'use client';

import { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, formatChatHistory, saveChatMessage } from '../../lib/gemini';
import { useTheme } from '../../lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserAnalysisService } from '../../lib/services/userAnalysisService';

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentTheme } = useTheme();
  const supabase = createClientComponentClient();

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

  return (
    <div className={`flex flex-col bg-background rounded-xl shadow-lg border border-primary/10 overflow-hidden ${className}`} style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="flex-grow overflow-y-auto" ref={chatContainerRef}>
        <div className="p-6 space-y-6">
          {chat.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-primary/5 text-foreground rounded-tl-none border border-primary/5'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm sm:text-base">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] bg-primary/5 text-foreground border border-primary/5">
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
      
      <div className="p-4 border-t border-primary/10 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground resize-none"
              rows={1}
              style={{ minHeight: '2.5rem', maxHeight: '8rem' }}
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
            className="p-3 rounded-xl bg-primary text-white disabled:opacity-50 flex-shrink-0 hover:bg-primary/90 transition-colors"
            disabled={isSending || !message.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h4a1 1 0 00.93-.634l4-8a1 1 0 00-.93-1.366h-7.12z" />
            </svg>
          </button>
        </form>
        <div className="mt-2 text-xs text-center text-foreground/40">
          Your conversations are private and secure
        </div>
      </div>
    </div>
  );
} 