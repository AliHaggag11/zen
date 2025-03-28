'use client';

import { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, formatChatHistory } from '../../lib/gemini';
import { saveChatMessage } from '../../lib/supabase';
import { useTheme } from '../../lib/themeContext';

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
}

export default function ChatInterface({
  chatSessionId,
  userId,
  initialMessages = [{ sender: 'ai', text: 'Hello! How are you feeling today? I\'m here to help and provide support. Feel free to share what\'s on your mind.' }],
  onAnalyzeEmotion,
  className = '',
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = { sender: 'user', text: message };
    setChat(prevChat => [...prevChat, userMessage]);
    
    // Optionally analyze the sentiment of user's message
    if (onAnalyzeEmotion) {
      onAnalyzeEmotion(message);
    }

    setMessage('');
    setIsSending(true);

    try {
      // Store user message in database if we have session and user info
      if (chatSessionId && userId) {
        await saveChatMessage({
          user_id: userId,
          chat_session_id: chatSessionId,
          content: message,
          is_from_user: true
        });
      }

      // Get formatted chat history for the API
      const formattedHistory = formatChatHistory(chat);
      
      // Send to Gemini API
      const response = await sendMessageToGemini(message, formattedHistory);

      // Add AI response to chat
      const aiMessage: Message = { sender: 'ai', text: response };
      setChat(prevChat => [...prevChat, aiMessage]);
      
      // Store AI response in database if we have session and user info
      if (chatSessionId && userId) {
        await saveChatMessage({
          user_id: userId,
          chat_session_id: chatSessionId,
          content: response,
          is_from_user: false
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message to the chat
      setChat(prevChat => [
        ...prevChat, 
        { sender: 'ai', text: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Get styles based on current theme
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'calm':
        return {
          headerBg: 'bg-primary',
          headerText: 'text-white',
          headerSubtext: 'text-secondary',
          userMessage: 'bg-primary text-white',
          aiMessage: 'bg-secondary text-primary',
          inputFocus: 'focus:ring-primary',
          button: 'bg-primary text-white hover:bg-primary/90',
          typingIndicator: 'bg-secondary text-primary'
        };
      case 'happy':
        return {
          headerBg: 'bg-primary',
          headerText: 'text-foreground',
          headerSubtext: 'text-secondary',
          userMessage: 'bg-primary text-foreground',
          aiMessage: 'bg-secondary text-primary',
          inputFocus: 'focus:ring-primary',
          button: 'bg-primary text-foreground hover:bg-primary/90',
          typingIndicator: 'bg-secondary text-primary'
        };
      case 'sad':
        return {
          headerBg: 'bg-primary',
          headerText: 'text-white',
          headerSubtext: 'text-secondary',
          userMessage: 'bg-primary text-white',
          aiMessage: 'bg-secondary text-primary',
          inputFocus: 'focus:ring-primary',
          button: 'bg-primary text-white hover:bg-primary/90',
          typingIndicator: 'bg-secondary text-primary'
        };
      case 'energetic':
        return {
          headerBg: 'bg-primary',
          headerText: 'text-white',
          headerSubtext: 'text-secondary',
          userMessage: 'bg-primary text-white',
          aiMessage: 'bg-secondary text-primary',
          inputFocus: 'focus:ring-primary',
          button: 'bg-primary text-white hover:bg-primary/90',
          typingIndicator: 'bg-secondary text-primary'
        };
      default: // neutral
        return {
          headerBg: 'bg-teal-600',
          headerText: 'text-white',
          headerSubtext: 'text-teal-100',
          userMessage: 'bg-teal-500 text-white',
          aiMessage: 'bg-gray-100 text-gray-800',
          inputFocus: 'focus:ring-teal-500',
          button: 'bg-teal-600 text-white hover:bg-teal-700',
          typingIndicator: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`flex flex-col bg-background rounded-lg shadow overflow-hidden ${className}`}>
      <div className={`p-6 ${styles.headerBg} ${styles.headerText}`}>
        <h2 className="text-xl font-semibold">AI Support Chat</h2>
        <p className={styles.headerSubtext}>Chat with your AI mental health assistant</p>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="p-4 h-96 overflow-y-auto flex flex-col space-y-4"
      >
        {chat.map((msg, index) => (
          <div 
            key={index}
            className={`${
              msg.sender === 'user' 
                ? `ml-auto ${styles.userMessage}` 
                : `mr-auto ${styles.aiMessage}`
            } rounded-lg p-3 max-w-[80%]`}
          >
            {msg.text}
          </div>
        ))}
        {isSending && (
          <div className={`mr-auto ${styles.typingIndicator} rounded-lg p-3`}>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-current rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${styles.inputFocus}`}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className={`${styles.button} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${styles.inputFocus} disabled:opacity-50`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 