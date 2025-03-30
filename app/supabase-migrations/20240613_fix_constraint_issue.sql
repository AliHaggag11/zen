-- Fix unique constraint issues by recreating the user_credits table if needed

-- First, check if the unique constraint exists
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_credits_user_id_key'
    AND table_name = 'user_credits'
  ) INTO constraint_exists;
  
  -- If constraint doesn't exist, we need to clean up duplicate data and add it
  IF NOT constraint_exists THEN
    -- Create a temporary table to store deduplicated records
    CREATE TEMP TABLE temp_user_credits AS
    SELECT DISTINCT ON (user_id) 
      id, 
      user_id, 
      credits, 
      created_at, 
      updated_at
    FROM user_credits
    ORDER BY user_id, updated_at DESC;
    
    -- Delete all records from user_credits
    DELETE FROM user_credits;
    
    -- Re-insert the deduplicated records
    INSERT INTO user_credits (id, user_id, credits, created_at, updated_at)
    SELECT id, user_id, credits, created_at, updated_at
    FROM temp_user_credits;
    
    -- Add the unique constraint
    ALTER TABLE user_credits ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);
    
    -- Drop the temporary table
    DROP TABLE temp_user_credits;
    
    -- Log the fix
    RAISE NOTICE 'Fixed duplicate records and added unique constraint on user_id';
  ELSE
    RAISE NOTICE 'Unique constraint already exists, no action needed';
  END IF;
END $$; 