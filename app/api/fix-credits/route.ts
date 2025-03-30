import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/app/lib/supabase/database.types';

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
    
    // Get all user credits records for this user to check for duplicates
    const { data: userCredits, error: userCreditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId);
    
    if (userCreditsError) {
      return NextResponse.json(
        { error: 'Failed to fetch user credits', details: userCreditsError },
        { status: 500 }
      );
    }
    
    let latestCredits = userCredits?.[0];
    let duplicateCount = 0;
    
    // Check for duplicates
    if (userCredits && userCredits.length > 1) {
      // We have duplicates, find the most recent record
      duplicateCount = userCredits.length - 1;
      latestCredits = userCredits.reduce((latest, current) => {
        // Convert to Date objects for comparison
        const latestDate = new Date(latest.updated_at || latest.created_at);
        const currentDate = new Date(current.updated_at || current.created_at);
        
        return currentDate > latestDate ? current : latest;
      }, userCredits[0]);
      
      // Delete all records except the latest one
      for (const record of userCredits) {
        if (record.id !== latestCredits.id) {
          await supabase
            .from('user_credits')
            .delete()
            .eq('id', record.id);
        }
      }
    }
    
    // If no credit record exists, create one
    if (userCredits && userCredits.length === 0) {
      const { data, error } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits: 0
        })
        .select('*')
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to create credit record', details: error },
          { status: 500 }
        );
      }
      
      latestCredits = data;
    }
    
    // Return the current state after fix
    return NextResponse.json({
      message: 'Credits fixed successfully',
      duplicatesRemoved: duplicateCount,
      currentCredits: latestCredits?.credits || 0
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 