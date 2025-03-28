-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_created_at_idx ON mood_entries(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only view their own mood entries
CREATE POLICY "Users can view their own mood entries"
  ON mood_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own mood entries
CREATE POLICY "Users can insert their own mood entries"
  ON mood_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own mood entries
CREATE POLICY "Users can update their own mood entries"
  ON mood_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own mood entries
CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mood_entries_updated_at
BEFORE UPDATE ON mood_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 