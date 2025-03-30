-- Create functions to help diagnose database issues

-- Function to get columns for a table
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(jsonb_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable
    ))
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = get_table_columns.table_name
  );
END;
$$;

-- Function to get constraints for a table
CREATE OR REPLACE FUNCTION get_table_constraints(table_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(jsonb_build_object(
      'constraint_name', tc.constraint_name,
      'constraint_type', tc.constraint_type,
      'columns', (
        SELECT jsonb_agg(kcu.column_name)
        FROM information_schema.key_column_usage kcu
        WHERE kcu.constraint_name = tc.constraint_name
      )
    ))
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public' 
    AND tc.table_name = get_table_constraints.table_name
  );
END;
$$;

-- Function to check for duplicate records
CREATE OR REPLACE FUNCTION check_duplicate_credits(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'count', COUNT(*),
    'records', jsonb_agg(jsonb_build_object(
      'id', id,
      'credits', credits,
      'created_at', created_at,
      'updated_at', updated_at
    ))
  )
  INTO result
  FROM user_credits
  WHERE user_id = user_id_param;
  
  RETURN result;
END;
$$; 