-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own journal entries
CREATE POLICY "Users can view their own journal entries" 
  ON journal_entries
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own journal entries
CREATE POLICY "Users can insert their own journal entries" 
  ON journal_entries
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own journal entries
CREATE POLICY "Users can update their own journal entries" 
  ON journal_entries
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own journal entries
CREATE POLICY "Users can delete their own journal entries" 
  ON journal_entries
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to journal_entries
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column(); 