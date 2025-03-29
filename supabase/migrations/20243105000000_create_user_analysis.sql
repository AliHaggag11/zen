-- Create a new table for user analysis data
CREATE TABLE IF NOT EXISTS public.user_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_trends JSONB DEFAULT '{}'::JSONB,
  common_topics JSONB DEFAULT '[]'::JSONB,
  wellness_score INTEGER DEFAULT 5,
  strengths JSONB DEFAULT '[]'::JSONB,
  areas_for_growth JSONB DEFAULT '[]'::JSONB,
  recommended_practices JSONB DEFAULT '[]'::JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_analysis ENABLE ROW LEVEL SECURITY;

-- Allow users to only see and modify their own analysis
CREATE POLICY "Users can view their own analysis" ON public.user_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis" ON public.user_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis" ON public.user_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_analysis_user_id_idx ON public.user_analysis(user_id); 