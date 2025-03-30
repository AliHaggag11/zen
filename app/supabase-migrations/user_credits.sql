-- Create a new table for user credits
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Create a view that joins the profiles table with the credits table for easier access
CREATE OR REPLACE VIEW user_profiles_with_credits AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  COALESCE(uc.credits, 0) as credits
FROM profiles p
LEFT JOIN user_credits uc ON p.id = uc.user_id;

-- Create a credit transaction log to keep track of credit purchases and usage
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a function to add credits to a user
CREATE OR REPLACE FUNCTION add_user_credits(
  _user_id UUID,
  _amount INT,
  _description TEXT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  _current_credits INT;
BEGIN
  -- Insert into or update the user_credits table
  INSERT INTO user_credits (user_id, credits)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits = user_credits.credits + _amount,
    updated_at = TIMEZONE('utc', NOW())
  RETURNING credits INTO _current_credits;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    _user_id, 
    _amount, 
    'PURCHASE', 
    _description
  );
  
  RETURN _current_credits;
END;
$$ LANGUAGE plpgsql;

-- Create a function to use/deduct credits from a user
CREATE OR REPLACE FUNCTION use_user_credits(
  _user_id UUID,
  _amount INT,
  _description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  _current_credits INT;
BEGIN
  -- Get current credits
  SELECT credits INTO _current_credits FROM user_credits WHERE user_id = _user_id;
  
  -- Check if user has enough credits
  IF _current_credits IS NULL OR _current_credits < _amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update credits
  UPDATE user_credits
  SET 
    credits = credits - _amount,
    updated_at = TIMEZONE('utc', NOW())
  WHERE user_id = _user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    _user_id, 
    -_amount, 
    'USAGE', 
    _description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on the tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only administrators can insert/update user credits"
  ON user_credits FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only administrators can insert credit transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  )); 