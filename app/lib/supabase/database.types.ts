export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          mood_level: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          mood_level: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          mood_level?: number
          notes?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          user_id: string
          chat_session_id: string
          content: string
          is_from_user: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          chat_session_id: string
          content: string
          is_from_user: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          chat_session_id?: string
          content?: string
          is_from_user?: boolean
        }
      }
      chat_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
          updated_at?: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 