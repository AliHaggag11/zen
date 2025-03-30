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
    
    const userId = session.user.id;
    
    // Get the user's current credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record is found, create one with 0 credits
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits: 0
          });
        
        if (insertError) {
          return NextResponse.json(
            { error: 'Failed to initialize credits' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ credits: 0 });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch credits' },
        { status: 500 }
      );
    }
    
    // Get transaction history
    const { data: transactions, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transactionError) {
      console.error('Error fetching transactions:', transactionError);
      // Continue anyway to return at least the credit balance
    }
    
    return NextResponse.json({
      credits: data.credits,
      transactions: transactions || []
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    const userId = session.user.id;
    
    // Get the request body
    const body = await request.json();
    const { action, amount, description } = body;
    
    if (!action || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request - action and amount are required' },
        { status: 400 }
      );
    }
    
    // Get current credits
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (creditError) {
      // If no record is found, create one with 0 credits
      if (creditError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits: 0
          });
        
        if (insertError) {
          return NextResponse.json(
            { error: 'Failed to initialize credits' },
            { status: 500 }
          );
        }
        
        if (action === 'use') {
          return NextResponse.json(
            { error: 'Insufficient credits' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to fetch credits' },
          { status: 500 }
        );
      }
    }
    
    const currentCredits = creditData?.credits || 0;
    
    // Handle different actions
    if (action === 'use') {
      // Check if enough credits
      if (currentCredits < amount) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 400 }
        );
      }
      
      // Update credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: currentCredits - amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update credits' },
          { status: 500 }
        );
      }
      
      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          transaction_type: 'USAGE',
          description: description || 'Used credits'
        });
      
      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
        // Continue anyway
      }
      
      return NextResponse.json({
        success: true,
        credits: currentCredits - amount
      });
      
    } else if (action === 'add') {
      // Update credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: currentCredits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update credits' },
          { status: 500 }
        );
      }
      
      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          transaction_type: 'PURCHASE',
          description: description || 'Added credits'
        });
      
      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
        // Continue anyway
      }
      
      return NextResponse.json({
        success: true,
        credits: currentCredits + amount
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action - must be "use" or "add"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 