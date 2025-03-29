'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '../components/ui/ChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../lib/supabase/database.types';
import { useTheme } from '../lib/themeContext';
import Link from 'next/link';
import { UserAnalysisService } from '../lib/services/userAnalysisService';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const deleteChatSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete
    
    // Open the modal and set the pending delete ID
    setPendingDeleteId(id);
    setDeleteModalOpen(true);
  };
  
  // Confirm delete action
  const confirmDelete = async () => {
    if (!userId || !pendingDeleteId) return;
    
    try {
      // Delete all chat messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_session_id', pendingDeleteId);
      
      if (messagesError) throw messagesError;
      
      // Then delete the chat session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', pendingDeleteId);
      
      if (error) throw error;
      
      // If we deleted the active chat, select another one
      if (chatSessionId === pendingDeleteId) {
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
    } finally {
      // Close the modal and clear the pending delete ID
      setDeleteModalOpen(false);
      setPendingDeleteId(null);
    }
  };
  
  // Cancel delete action
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPendingDeleteId(null);
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
  
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background flex relative">
        {/* Chat History Sidebar - Modified for mobile overlay */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative h-full z-30 md:z-auto md:translate-x-0 md:w-80 w-[85vw] bg-background border-r border-primary/10 transition-all duration-300 overflow-hidden shadow-lg md:shadow-none`}>
          <div className="p-4 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <button 
                onClick={createNewChatSession}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>New Chat</span>
              </button>
              <button 
                className="md:hidden ml-2 p-2 rounded-md hover:bg-primary/10 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-5rem)]">
            {chatSessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => {
                  setChatSessionId(session.id);
                  if (userId) {
                    // Trigger analysis when a chat is selected
                    analyzeUserChat(userId);
                  }
                }}
                className={`p-4 border-b border-primary/5 cursor-pointer hover:bg-primary/5 transition-colors ${
                  chatSessionId === session.id ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 min-w-0 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{formatSessionTitle(session)}</p>
                      <p className="text-xs text-foreground/60">{formatSessionDate(session.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChatSession(session.id, e)}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                    title="Delete chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Backdrop for mobile - closes sidebar when clicking outside */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="sticky top-0 z-10 bg-background border-b border-primary/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-3 p-2 rounded-md hover:bg-primary/10 transition-colors md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-foreground">Zen AI Chat</h1>
            </div>
            <div>
              <button
                onClick={createNewChatSession}
                className="p-2 rounded-md hover:bg-primary/10 transition-colors text-foreground"
                title="New Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            {error && (
              <div className="mb-8 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                <p className="font-medium">Error</p>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <div className="h-full max-w-5xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-96 bg-background rounded-lg shadow">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : !error && chatSessionId ? (
                <ChatInterface 
                  chatSessionId={chatSessionId}
                  userId={userId || undefined}
                  className="h-full"
                  suggestedTopics={suggestedTopics}
                  onTopicSelect={handleTopicSelection}
                  onFirstUserMessage={(message) => generateChatTitle(chatSessionId, message)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-background rounded-lg shadow">
                  <p className="text-foreground/70">Unable to load chat. Please try again later.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-primary/20">
              <h3 className="text-lg font-medium mb-4">Delete Chat</h3>
              <p className="mb-6 text-foreground/80">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md border border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
} 