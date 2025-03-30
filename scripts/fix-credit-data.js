// This script will fix credit-related database issues
// To run: node scripts/fix-credit-data.js

// Load required libraries
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (admin)
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCreditData() {
  console.log('Starting credit data fix...');
  console.log('-----------------------------');
  
  try {
    // 1. Execute the fix constraint SQL
    console.log('Fixing duplicate records and adding unique constraint...');
    
    const fixSql = `
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
      
      -- Try to add the unique constraint
      ALTER TABLE user_credits DROP CONSTRAINT IF EXISTS user_credits_user_id_key;
      ALTER TABLE user_credits ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);
      
      -- Drop the temporary table
      DROP TABLE temp_user_credits;
    `;
    
    const { error: fixError } = await supabase.rpc('exec_sql', { sql_query: fixSql });
    
    if (fixError) {
      console.error('Error fixing credit data:', fixError.message);
    } else {
      console.log('Successfully fixed credit data!');
    }
    
    // 2. Check the results - count records in user_credits
    const { data: countData, error: countError } = await supabase
      .from('user_credits')
      .select('user_id', { count: 'exact' });
      
    if (countError) {
      console.error('Error counting credit records:', countError.message);
    } else {
      console.log(`Total unique credit records: ${countData.length}`);
    }
    
    // 3. Check for any remaining duplicates
    const checkSql = `
      SELECT user_id, COUNT(*) as count
      FROM user_credits
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `;
    
    const { data: duplicateData, error: duplicateError } = await supabase.rpc('exec_sql', { 
      sql_query: checkSql 
    });
    
    if (duplicateError) {
      console.error('Error checking for duplicates:', duplicateError.message);
    } else if (duplicateData && duplicateData.length > 0) {
      console.log('Warning: Still found duplicate records. Manual intervention required.');
      console.log(duplicateData);
    } else {
      console.log('No duplicate records found. Fix was successful!');
    }
    
    console.log('\nFix completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixCreditData(); 