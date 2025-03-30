import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../supabase/database.types';

export class CreditService {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Get the current user's credit balance
   * @param userId User ID
   * @returns Credit balance or null if an error occurred
   */
  async getUserCredits(userId: string): Promise<number> {
    try {
      // First check if the user has any credits in the database
      const { data, error } = await this.supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no record found, initialize with 0 credits
        if (error.code === 'PGRST116') {
          // Insert a new record with 0 credits for this user
          const { data: newData, error: insertError } = await this.supabase
            .from('user_credits')
            .insert({ user_id: userId, credits: 0 })
            .select('credits')
            .single();

          if (insertError) {
            console.error('Error initializing user credits:', insertError);
            return 0; // Return 0 as default if initialization fails
          }

          return newData?.credits || 0;
        }
        
        console.error('Error fetching user credits:', error);
        return 0; // Return 0 as default
      }

      return data?.credits || 0;
    } catch (error) {
      console.error('Exception in getUserCredits:', error);
      return 0; // Return 0 as default if any other error
    }
  }

  /**
   * Check if a user has enough credits
   * @param userId User ID
   * @param amount Amount of credits needed
   * @returns Boolean indicating if user has enough credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    return credits >= amount;
  }

  /**
   * Use credits from a user's balance
   * @param userId User ID
   * @param amount Amount of credits to use
   * @param description Description of what the credits were used for
   * @returns Boolean indicating success or failure
   */
  async useCredits(userId: string, amount: number, description: string): Promise<boolean> {
    try {
      // First get current credit balance
      const currentCredits = await this.getUserCredits(userId);
      
      // Check if enough credits
      if (currentCredits < amount) {
        return false;
      }
      
      // Update the credits
      const { error: updateError } = await this.supabase
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
      
      // Log the transaction
      const { error: transactionError } = await this.supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          transaction_type: 'USAGE',
          description: description
        });
        
      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
        // We still consider this a success since the credits were updated
      }
      
      return true;
    } catch (error) {
      console.error('Exception in useCredits:', error);
      return false;
    }
  }

  /**
   * Add credits to a user's balance (for purchases)
   * @param userId User ID
   * @param amount Amount of credits to add
   * @param description Description of where the credits came from
   * @returns New credit balance or null if an error occurred
   */
  async addCredits(userId: string, amount: number, description: string): Promise<number | null> {
    try {
      // Get current credits first
      const currentCredits = await this.getUserCredits(userId);
      
      // Update credits
      const { error: updateError } = await this.supabase
        .from('user_credits')
        .update({ 
          credits: currentCredits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        // If no record exists yet, create one
        if (updateError.code === 'PGRST116') {
          const { error: insertError } = await this.supabase
            .from('user_credits')
            .insert({ 
              user_id: userId, 
              credits: amount 
            });
            
          if (insertError) {
            console.error('Error initializing user credits:', insertError);
            return null;
          }
        } else {
          console.error('Error adding credits:', updateError);
          return null;
        }
      }
      
      // Log the transaction
      const { error: transactionError } = await this.supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          transaction_type: 'PURCHASE',
          description: description
        });
        
      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
        // Continue anyway, transaction logging is secondary
      }
      
      // Get the new balance
      const newCredits = await this.getUserCredits(userId);
      return newCredits;
    } catch (error) {
      console.error('Exception in addCredits:', error);
      return null;
    }
  }

  /**
   * Get credit transaction history for a user
   * @param userId User ID
   * @returns Array of credit transactions
   */
  async getTransactionHistory(userId: string) {
    try {
      const { data, error } = await this.supabase
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
}

// Cost constants for different features
export const CREDIT_COSTS = {
  CHAT_MESSAGE: 1,  // Cost per message sent to AI
  FREE_DAILY_MESSAGES: 5, // Number of free messages per day
};

// Function to determine if a credit charge is needed
export async function shouldChargeForMessage(userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient<Database>();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Count messages sent today
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_from_user', true)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    
    if (error) {
      console.error('Error counting today\'s messages:', error);
      return true; // Charge by default if we can't determine
    }
    
    // If user has used fewer than FREE_DAILY_MESSAGES, don't charge
    return (count || 0) >= CREDIT_COSTS.FREE_DAILY_MESSAGES;
  } catch (error) {
    console.error('Exception in shouldChargeForMessage:', error);
    return true; // Charge by default if there's an error
  }
} 