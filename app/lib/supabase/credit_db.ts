import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

/**
 * Direct database operations for the credit system
 * These functions bypass the service layer to directly handle credit transactions
 */

/**
 * Get the current user's credit balance directly from the database
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record found, initialize with 0 credits
      if (error.code === 'PGRST116') {
        await initializeUserCredits(userId);
        return 0;
      }
      
      console.error('Error fetching user credits:', error);
      return 0;
    }
    
    return data?.credits || 0;
  } catch (error) {
    console.error('Exception in getUserCredits:', error);
    return 0;
  }
}

/**
 * Initialize a user credit record with 0 credits
 */
export async function initializeUserCredits(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits: 0
      });
    
    if (error) {
      console.error('Error initializing user credits:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in initializeUserCredits:', error);
    return false;
  }
}

/**
 * Add credits to a user's account
 */
export async function addCredits(userId: string, amount: number, description: string): Promise<number | null> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // First check if user has a credit record
    const { data: existingCredit, error: checkError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // Record not found
        // Create new credit record
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits: amount
          });
        
        if (insertError) {
          console.error('Error creating credit record:', insertError);
          return null;
        }
      } else {
        console.error('Error checking credit record:', checkError);
        return null;
      }
    } else {
      // Update existing record
      const currentCredits = existingCredit?.credits || 0;
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: currentCredits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating credits:', updateError);
        return null;
      }
    }
    
    // Log the transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'PURCHASE',
        description: description
      });
    
    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Continue anyway since the credits were added
    }
    
    // Get updated balance
    const { data: updatedCredit, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated credits:', fetchError);
      return null;
    }
    
    return updatedCredit?.credits || 0;
  } catch (error) {
    console.error('Exception in addCredits:', error);
    return null;
  }
}

/**
 * Use credits from a user's account
 */
export async function useCredits(userId: string, amount: number, description: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // Get current credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching current credits:', error);
      return false;
    }
    
    const currentCredits = data?.credits || 0;
    
    // Check if enough credits
    if (currentCredits < amount) {
      return false;
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
      console.error('Error updating credits:', updateError);
      return false;
    }
    
    // Log transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'USAGE',
        description: description
      });
    
    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Continue anyway since the credits were deducted
    }
    
    return true;
  } catch (error) {
    console.error('Exception in useCredits:', error);
    return false;
  }
}

/**
 * Get credit transaction history
 */
export async function getTransactionHistory(userId: string) {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in getTransactionHistory:', error);
    return [];
  }
} 