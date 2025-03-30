-- Fix the user_credits table structure to ensure proper persistence

-- Check if the user_credits table exists, if not create it
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups by user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Make sure the credit_transactions table exists
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for transaction lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- Enable RLS on both tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert their own credit records" ON user_credits;
DROP POLICY IF EXISTS "Anyone can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Anyone can update their own credits" ON user_credits;
DROP POLICY IF EXISTS "Anyone can insert their own credits" ON user_credits;
DROP POLICY IF EXISTS "Only administrators can insert/update user credits" ON user_credits;

-- Create permissive policies for user_credits table
CREATE POLICY "Users can view their own credits" 
ON user_credits FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON user_credits FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit records" 
ON user_credits FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop existing transaction policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Anyone can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Anyone can insert their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Only administrators can insert credit transactions" ON credit_transactions;

-- Create permissive policies for credit_transactions table
CREATE POLICY "Users can view their own transactions" 
ON credit_transactions FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON credit_transactions FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to user_credits table if it doesn't exist
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 