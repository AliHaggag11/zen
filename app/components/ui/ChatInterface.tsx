'use client';

import { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, formatChatHistory, saveChatMessage } from '../../lib/gemini';
import { useTheme } from '../../lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserAnalysisService } from '../../lib/services/userAnalysisService';
import { getProfile } from '../../lib/supabase/profiles';
import Image from 'next/image';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatInterfaceProps {
  chatSessionId?: string;
  userId?: string;
  initialMessages?: Message[];
  onAnalyzeEmotion?: (text: string) => void;
  className?: string;
  suggestedTopics?: string[];
  onTopicSelect?: (topic: string) => void;
  onFirstUserMessage?: (message: string) => void;
}

export default function ChatInterface({
  chatSessionId,
  userId,
  initialMessages = [{ sender: 'ai', text: 'Hello! How are you feeling today? I\'m here to help and provide support. Feel free to share what\'s on your mind.' }],
  onAnalyzeEmotion,
  className = '',
  suggestedTopics = [
    "I'm feeling anxious about work",
    "Help me with meditation techniques",
    "I need to improve my sleep habits"
  ],
  onTopicSelect,
  onFirstUserMessage
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentTheme } = useTheme();
  const supabase = createClientComponentClient();

  // Fetch user profile for avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        const profile = await getProfile(userId);
        if (profile) {
          setUserAvatar(profile.avatar_url);
          setUserName(profile.name || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  // Load previous chat messages if we have a session ID
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatSessionId || !userId) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_session_id', chatSessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading chat history:', error);
          return;
        }

        if (data && data.length > 0) {
          const formattedMessages: Message[] = data.map(msg => ({
            sender: msg.is_from_user ? 'user' : 'ai',
            text: msg.content
          }));
          
          // Combine with welcome message if history is empty
          if (formattedMessages.length > 0) {
            setChat(formattedMessages);
            // Hide suggestions if there's existing chat history
            setShowSuggestions(formattedMessages.length <= 1);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [chatSessionId, userId, supabase]);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Add event listener for topic suggestions
  useEffect(() => {
    const handleInputChange = () => {
      if (textareaRef.current) {
        setMessage(textareaRef.current.value);
      }
    };

    if (textareaRef.current) {
      textareaRef.current.addEventListener('input', handleInputChange);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('input', handleInputChange);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    // Add user message to chat
    const userMessage: Message = { sender: 'user', text: message };
    
    // If this is the first user message, call the callback
    const isFirstUserMessage = chat.every(msg => msg.sender !== 'user');
    if (isFirstUserMessage && onFirstUserMessage) {
      onFirstUserMessage(message);
    }
    
    setChat(prevChat => [...prevChat, userMessage]);
    const currentMessage = message; // Save message before clearing input
    setMessage('');
    setIsSending(true);
    
    try {
      // Store message in database if we have a session ID
      if (chatSessionId && userId) {
        await saveChatMessage({
          user_id: userId,
          chat_session_id: chatSessionId,
          content: currentMessage,
          is_from_user: true
        });
      }
      
      // Get formatted chat history for the API
      const formattedHistory = formatChatHistory(chat);
      
      // Send message to Gemini API
      const response = await sendMessageToGemini(currentMessage, formattedHistory);
      
      // Add AI response to chat
      const aiMessage: Message = { sender: 'ai', text: response };
      setChat(prevChat => [...prevChat, aiMessage]);
      
      // Store AI response in database if we have a session ID
      if (chatSessionId && userId) {
        await saveChatMessage({
          user_id: userId,
          chat_session_id: chatSessionId,
          content: response,
          is_from_user: false
        });
        
        // Trigger user analysis update after a short delay
        setTimeout(async () => {
          try {
            const analysisService = new UserAnalysisService();
            await analysisService.analyzeAndUpdateUserProfile(userId);
          } catch (error) {
            console.error('Error updating user analysis:', error);
          }
        }, 2000);
      }
      
      // Analyze emotion in the user's message
      if (onAnalyzeEmotion) {
        onAnalyzeEmotion(currentMessage);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChat(prevChat => [
        ...prevChat, 
        { 
          sender: 'ai', 
          text: 'I apologize, but I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    setMessage(topic);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    if (onTopicSelect) {
      onTopicSelect(topic);
    }
  };

  // Function to render user avatar
  const renderUserAvatar = () => {
    if (userAvatar) {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
          <Image 
            src={userAvatar} 
            alt={userName || "User Avatar"}
            width={32}
            height={32}
            className="object-cover w-full h-full"
            onError={() => {
              // Fallback to default avatar if image fails to load
              setUserAvatar(null);
            }}
          />
        </div>
      );
    }
    
    // Default avatar if no custom avatar is set
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };
  
  // Function to render AI avatar
  const renderAIAvatar = () => {
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center shadow-sm">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-background rounded-xl shadow-lg border border-primary/10 overflow-hidden ${className}`} style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="flex-grow overflow-y-auto" ref={chatContainerRef}>
        <div className="p-6 space-y-6">
          {chat.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for AI */}
              {msg.sender === 'ai' && (
                <div className="mr-2 self-end mb-1">
                  {renderAIAvatar()}
                </div>
              )}
              
              <div 
                className={`px-4 py-3 rounded-2xl max-w-[75%] ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-primary/5 text-foreground rounded-tl-none border border-primary/5'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm sm:text-base">{msg.text}</div>
              </div>
              
              {/* Avatar for User */}
              {msg.sender === 'user' && (
                <div className="ml-2 self-end mb-1">
                  {renderUserAvatar()}
                </div>
              )}
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="mr-2 self-end mb-1">
                {renderAIAvatar()}
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-none max-w-[75%] bg-primary/5 text-foreground border border-primary/5">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested topics that appear in the chat area */}
          {showSuggestions && (
            <div className="flex justify-center my-4">
              <div className="bg-primary/5 rounded-xl p-4 max-w-[90%] border border-primary/10">
                <p className="text-sm text-foreground/70 mb-3 text-center">Try asking about:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedTopics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleTopicClick(topic)}
                      className="px-3 py-2 bg-background hover:bg-primary/10 rounded-lg text-sm text-foreground transition-colors border border-primary/10"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-primary/10">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 pr-10 rounded-lg border border-primary/10 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-background text-foreground"
              rows={1}
              style={{ 
                minHeight: '2.5rem', 
                maxHeight: '10rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            className="p-3 rounded-lg bg-primary hover:bg-primary/90 text-white flex-shrink-0 transition-colors"
            disabled={isSending || !message.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 