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
      user_analysis: {
        Row: {
          id: string
          user_id: string
          mood_trends: Json
          common_topics: Json
          wellness_score: number
          strengths: Json
          areas_for_growth: Json
          recommended_practices: Json
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_trends?: Json
          common_topics?: Json
          wellness_score?: number
          strengths?: Json
          areas_for_growth?: Json
          recommended_practices?: Json
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_trends?: Json
          common_topics?: Json
          wellness_score?: number
          strengths?: Json
          areas_for_growth?: Json
          recommended_practices?: Json
          last_updated?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analysis_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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