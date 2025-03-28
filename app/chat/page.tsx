'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '../components/ui/ChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../lib/supabase/database.types';
import { useTheme } from '../lib/themeContext';

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const { currentTheme } = useTheme();
  
  useEffect(() => {
    const setupChatSession = async () => {
      setIsLoading(true);
      
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User not logged in - this should be caught by ProtectedRoute
          setIsLoading(false);
          return;
        }
        
        setUserId(session.user.id);
        
        // Look for an existing chat session or create a new one
        const { data: existingSessions } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (existingSessions && existingSessions.length > 0) {
          setChatSessionId(existingSessions[0].id);
        } else {
          // Create a new chat session
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: session.user.id,
              title: 'New Chat Session'
            })
            .select();
          
          if (data && data.length > 0) {
            setChatSessionId(data[0].id);
          }
          
          if (error) {
            console.error('Error creating chat session:', error);
          }
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setupChatSession();
  }, [supabase]);
  
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">AI Companion Chat</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-96 bg-background rounded-lg shadow">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ChatInterface 
                  chatSessionId={chatSessionId || undefined}
                  userId={userId || undefined}
                  className="h-full min-h-[500px]"
                />
              )}
            </div>
            
            <div className="bg-primary/5 rounded-lg p-8 border border-primary/10 h-fit">
              <h3 className="text-xl font-medium text-foreground mb-4">Chat Assistant</h3>
              <p className="text-foreground/80 mb-6">
                Your AI companion is here to provide support, guidance, and a listening ear whenever you need it.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Suggested Topics</h4>
                  <ul className="space-y-3">
                    <li className="p-3 bg-background rounded-md cursor-pointer hover:bg-primary/10 transition-colors">
                      "I'm feeling anxious about work"
                    </li>
                    <li className="p-3 bg-background rounded-md cursor-pointer hover:bg-primary/10 transition-colors">
                      "Help me with meditation techniques"
                    </li>
                    <li className="p-3 bg-background rounded-md cursor-pointer hover:bg-primary/10 transition-colors">
                      "I need to improve my sleep habits"
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Tips for Better Conversations</h4>
                  <ul className="space-y-2 text-foreground/70 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 rounded-full bg-primary/20 text-primary flex-shrink-0 flex items-center justify-center mr-2">1</span>
                      <span>Be specific about how you're feeling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 rounded-full bg-primary/20 text-primary flex-shrink-0 flex items-center justify-center mr-2">2</span>
                      <span>Ask follow-up questions for deeper insights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-5 h-5 rounded-full bg-primary/20 text-primary flex-shrink-0 flex items-center justify-center mr-2">3</span>
                      <span>Share context about your situation</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-primary/10">
                <p className="text-xs text-foreground/50">
                  Remember: While our AI assistant can provide support and guidance, it is not a replacement for professional mental health care. If you're experiencing a crisis, please contact a healthcare professional or emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 