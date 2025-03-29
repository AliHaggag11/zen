-- Create user_activities table for tracking wellness activities
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'Daily',
  completed BOOLEAN DEFAULT false,
  streak INTEGER DEFAULT 0,
  last_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own activities
CREATE POLICY user_activities_select_policy
  ON user_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own activities
CREATE POLICY user_activities_insert_policy
  ON user_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own activities
CREATE POLICY user_activities_update_policy
  ON user_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own activities
CREATE POLICY user_activities_delete_policy
  ON user_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON user_activities(user_id); 