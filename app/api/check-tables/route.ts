import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/app/lib/supabase/database.types';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Get the current session to verify the user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Check if the user_credits table exists
    const { data: userCreditsExists, error: userCreditsError } = await supabase
      .from('user_credits')
      .select('id')
      .limit(1);
    
    // Check if the credit_transactions table exists
    const { data: transactionsExists, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('id')
      .limit(1);
    
    // Get columns for user_credits table
    const { data: userCreditsColumns, error: columnsError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'user_credits' }
    );
    
    // Get any constraints on user_credits
    const { data: constraints, error: constraintsError } = await supabase.rpc(
      'get_table_constraints',
      { table_name: 'user_credits' }
    );
    
    // Get user's credit records
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', session.user.id);
    
    return NextResponse.json({
      tables: {
        user_credits: {
          exists: userCreditsError ? false : true,
          error: userCreditsError ? userCreditsError.message : null
        },
        credit_transactions: {
          exists: transactionsError ? false : true,
          error: transactionsError ? transactionsError.message : null
        }
      },
      schema: {
        columns: userCreditsColumns || [],
        constraints: constraints || [],
        columnsError: columnsError ? columnsError.message : null,
        constraintsError: constraintsError ? constraintsError.message : null
      },
      userCredits: {
        recordCount: userCredits?.length || 0,
        records: userCredits || [],
        error: creditsError ? creditsError.message : null
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 