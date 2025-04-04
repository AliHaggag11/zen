'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '../components/ui/ChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../lib/supabase/database.types';
import { useTheme } from '../lib/themeContext';
import Link from 'next/link';
import { UserAnalysisService } from '../lib/services/userAnalysisService';
import { Menu, X, Plus, Trash2, ChevronLeft } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const { currentTheme } = useTheme();
  
  const suggestedTopics = [
    "I'm feeling anxious about work",
    "Help me with meditation techniques",
    "I need to improve my sleep habits",
    "How can I manage stress better?",
    "I want to practice gratitude"
  ];
  
  // Fetch all chat sessions
  const fetchChatSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setChatSessions(data as ChatSession[]);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };
  
  // Create a new chat session
  const createNewChatSession = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: 'New Chat ' + new Date().toLocaleDateString()
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setChatSessionId(data[0].id);
        await fetchChatSessions(userId);
      }
    } catch (error) {
      console.error('Error creating new chat session:', error);
      setError('Failed to create new chat.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update chat title
  const updateChatTitle = async (id: string, title: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchChatSessions(userId);
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };
  
  // Delete chat session
  const deleteChatSession = async (id: string) => {
    if (!userId || !id) return;
    
    try {
      // Delete all chat messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_session_id', id);
      
      if (messagesError) throw messagesError;
      
      // Then delete the chat session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // If we deleted the active chat, select another one
      if (chatSessionId === id) {
        const { data } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (data && data.length > 0) {
          setChatSessionId(data[0].id);
        } else {
          // If no chats left, create a new one
          await createNewChatSession();
        }
      }
      
      await fetchChatSessions(userId);
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };
  
  // Function to generate a title from the first message
  const generateChatTitle = async (chatId: string, firstMessage: string) => {
    if (!chatId || !firstMessage) return;
    
    // If already has a meaningful title (not "New Chat"), don't update
    const { data: chatData } = await supabase
      .from('chat_sessions')
      .select('title')
      .eq('id', chatId)
      .single();
      
    if (chatData && !chatData.title.startsWith('New Chat')) {
      return;
    }
    
    // Generate title from first message (limit to first 30 chars)
    let title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
      
    // Remove any line breaks
    title = title.replace(/\n/g, ' ');
    
    await updateChatTitle(chatId, title);
  };
  
  // Analyze user chat history
  const analyzeUserChat = async (userId: string) => {
    if (!userId) return;
    
    try {
      const analysisService = new UserAnalysisService();
      await analysisService.analyzeAndUpdateUserProfile(userId);
    } catch (error) {
      console.error('Error analyzing user chat:', error);
    }
  };
  
  useEffect(() => {
    const setupChatSession = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        setUserId(session.user.id);
        
        // Fetch all chat sessions for the user
        await fetchChatSessions(session.user.id);
        
        // Look for an existing chat session
        const { data: existingSessions, error: fetchError } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error('Error fetching chat sessions:', fetchError);
          throw new Error(`Failed to fetch chat sessions: ${fetchError.message}`);
        }
        
        if (existingSessions && existingSessions.length > 0) {
          setChatSessionId(existingSessions[0].id);
          // Trigger analysis when the first chat is loaded
          if (session.user.id) {
            analyzeUserChat(session.user.id);
          }
        } else {
          // Create a new chat session
          await createNewChatSession();
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    setupChatSession();
  }, [supabase]);
  
  // Function to handle topic selection
  const handleTopicSelection = (topic: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = topic;
      // Set value and dispatch input event to trigger change
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
  };

  const formatSessionTitle = (session: ChatSession) => {
    // If title is "New Chat + date", just return "New Chat"
    if (session.title.startsWith('New Chat')) {
      return 'New Chat';
    }
    return session.title;
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Add this effect to handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary/10 text-primary lg:hidden"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div 
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-background border-r border-primary/10 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header with close button */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">Chat Sessions</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-primary/5 text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Rest of the sidebar content */}
            <div className="p-4">
              <button
                onClick={createNewChatSession}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    chatSessionId === session.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-primary/5'
                  }`}
                >
                  <button
                    onClick={() => {
                      setChatSessionId(session.id);
                      setIsSidebarOpen(false);
                    }}
                    className="flex-1 text-left truncate"
                  >
                    {session.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(session.id);
                      setDeleteModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-foreground/50 hover:text-foreground transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-primary/10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-primary/5"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-foreground truncate">
                {chatSessions.find(s => s.id === chatSessionId)?.title || 'New Chat'}
              </h2>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {chatSessionId ? (
              <ChatInterface
                chatSessionId={chatSessionId}
                userId={userId || undefined}
                suggestedTopics={suggestedTopics}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Zen Chat</h2>
                  <p className="text-foreground/70 mb-4">Start a new chat or select an existing one from the sidebar</p>
                  <button
                    onClick={createNewChatSession}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Delete Chat</h3>
              <p className="text-foreground/70 mb-6">Are you sure you want to delete this chat? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-foreground hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pendingDeleteId) {
                      deleteChatSession(pendingDeleteId);
                    }
                    setDeleteModalOpen(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 