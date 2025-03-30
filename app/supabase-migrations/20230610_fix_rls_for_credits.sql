-- Fix Row Level Security for user_credits and credit_transactions
-- This ensures users can only access their own credit data

-- First, drop any conflicting RLS policies
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert their own credit records" ON user_credits;
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON credit_transactions;

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

-- Create permissive policies for credit_transactions table
CREATE POLICY "Users can view their own transactions" 
ON credit_transactions FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON credit_transactions FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on both tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY; 