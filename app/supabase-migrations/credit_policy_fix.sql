-- Drop existing RLS policies that might be restricting access
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Only administrators can insert/update user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Only administrators can insert credit transactions" ON credit_transactions;

-- Create more permissive policies that will work for client-side usage
CREATE POLICY "Anyone can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert their own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert their own transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id); 