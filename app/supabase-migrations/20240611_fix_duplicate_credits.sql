-- Fix duplicate user_credits records
-- This script will keep only the most recent credit record for each user

-- First, create a temporary table to store the latest record for each user
CREATE TEMP TABLE latest_user_credits AS
SELECT DISTINCT ON (user_id) 
  id, 
  user_id, 
  credits, 
  created_at, 
  updated_at
FROM user_credits
ORDER BY user_id, updated_at DESC;

-- Delete all records from user_credits
TRUNCATE user_credits;

-- Re-insert the deduplicated records
INSERT INTO user_credits (id, user_id, credits, created_at, updated_at)
SELECT id, user_id, credits, created_at, updated_at
FROM latest_user_credits;

-- Now add the unique constraint safely
ALTER TABLE user_credits ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);

-- Drop the temporary table
DROP TABLE latest_user_credits;

-- Add other necessary indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Make sure RLS policies are correctly applied
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Update policies
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
CREATE POLICY "Users can view their own credits" 
ON user_credits FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
CREATE POLICY "Users can update their own credits" 
ON user_credits FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit records" ON user_credits;
CREATE POLICY "Users can insert their own credit records" 
ON user_credits FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id); 