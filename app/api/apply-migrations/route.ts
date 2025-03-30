import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/app/lib/supabase/database.types';
import * as fs from 'fs';
import * as path from 'path';

// This is a special admin-only route to apply SQL migrations
export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Check if the user is authenticated and is an admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Path to migrations directory
    const migrationsDir = path.join(process.cwd(), 'app', 'supabase-migrations');
    
    // Read all SQL files in the directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure they run in order
    
    const results = [];
    
    // Execute each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        results.push({
          file,
          success: false,
          error: error.message
        });
      } else {
        results.push({
          file,
          success: true
        });
      }
    }
    
    return NextResponse.json({
      message: 'Migrations applied',
      results
    });
  } catch (error) {
    console.error('Error applying migrations:', error);
    return NextResponse.json(
      { error: 'Failed to apply migrations' },
      { status: 500 }
    );
  }
} 