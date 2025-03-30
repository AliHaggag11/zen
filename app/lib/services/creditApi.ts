/**
 * Client-side API helpers for credit operations
 */

/**
 * Get current credit balance and recent transactions
 */
export async function getCreditInfo() {
  try {
    const response = await fetch('/api/credits');
    if (!response.ok) {
      throw new Error('Failed to fetch credit information');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching credit info:', error);
    return { credits: 0, transactions: [] };
  }
}

/**
 * Use credits for a service
 */
export async function useCredits(amount: number, description: string) {
  try {
    const response = await fetch('/api/credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'use',
        amount,
        description,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to use credits');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error using credits:', error);
    throw error;
  }
}

/**
 * Add credits to account (after purchase)
 */
export async function addCredits(amount: number, description: string) {
  try {
    const response = await fetch('/api/credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        amount,
        description,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add credits');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
} 