'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Get a user's profile by ID
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

/**
 * Update a user's profile
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> => {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data;
};

/**
 * Upload a user avatar and return the public URL
 * Simplified version with better error handling
 */
export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<string | null> => {
  try {
    const supabase = createClientComponentClient<Database>();
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('Uploading avatar with path:', filePath);
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Storage upload error details:', uploadError);
      return null;
    }
    
    console.log('Upload successful:', uploadData);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('Public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error during avatar upload:', error);
    return null;
  }
}; 