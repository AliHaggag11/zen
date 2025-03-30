// Script to apply migrations
// Run with: npx ts-node -r tsconfig-paths/register app/supabase-migrations/apply.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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

async function applyMigrations() {
  try {
    // Path to migrations directory
    const migrationsDir = path.join(process.cwd(), 'app', 'supabase-migrations');
    
    // Read all SQL files in the directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure they run in order
    
    console.log(`Found ${files.length} migration files`);
    
    // Execute each migration file
    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Execute the SQL directly using the exec_sql function
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.error(`Error applying migration ${file}:`, error.message);
        } else {
          console.log(`Successfully applied migration: ${file}`);
        }
      } catch (err) {
        console.error(`Failed to apply migration ${file}:`, err);
      }
    }
    
    console.log('All migrations completed');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

// Run the migrations
applyMigrations(); 