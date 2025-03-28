import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your project URL and anon key
// In production, these should be stored in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Types for user-related data
 */
export interface UserProfile {
  id: string;
  created_at?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notification_emails?: boolean;
  interests?: string[];
  preferred_activities?: string[];
}

/**
 * Types for mood tracking
 */
export interface MoodEntry {
  id?: string;
  user_id: string;
  mood_level: number; // 1-5 scale
  notes?: string;
  created_at?: string;
  tags?: string[];
}

/**
 * Types for chat history
 */
export interface ChatMessage {
  id?: string;
  user_id: string;
  content: string;
  is_from_user: boolean;
  created_at?: string;
  chat_session_id: string;
}

export interface ChatSession {
  id?: string;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * User Authentication Functions
 */

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user
 */
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Profile Management Functions
 */

/**
 * Get a user's profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Mood Tracking Functions
 */

/**
 * Save a mood entry for a user
 */
export async function saveMoodEntry(entry: MoodEntry) {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert(entry)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get mood entries for a user within a date range
 */
export async function getMoodEntries(
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<MoodEntry[]> {
  let query = supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

/**
 * Chat History Functions
 */

/**
 * Create a new chat session
 */
export async function createChatSession(userId: string, title: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get chat sessions for a user
 */
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Save a chat message
 */
export async function saveChatMessage(message: ChatMessage): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get messages for a specific chat session
 */
export async function getChatMessages(chatSessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_session_id', chatSessionId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
} 