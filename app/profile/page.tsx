'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTheme } from '../lib/themeContext';
import { getProfile, updateProfile, uploadAvatar, type Profile } from '../lib/supabase/profiles';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { currentTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }

        // Get user's email from session
        const userEmail = session.user.email || '';
        setEmail(userEmail);
        
        // Try to get profile from database
        let profileData = await getProfile(session.user.id);
        
        // If profile doesn't exist, create one
        if (!profileData) {
          // Create a basic profile
          const { data: userData } = await supabase
            .from('profiles')
            .insert([
              { 
                id: session.user.id, 
                email: userEmail,
                name: session.user.user_metadata?.name || ''
              }
            ])
            .select()
            .single();
            
          if (userData) {
            profileData = userData;
          } else {
            // If we still can't create or get the profile, use basic user data from session
            profileData = {
              id: session.user.id,
              email: userEmail,
              name: session.user.user_metadata?.name || '',
              avatar_url: null,
              created_at: new Date().toISOString()
            } as Profile;
          }
        }
        
        if (profileData) {
          setProfile(profileData);
          setName(profileData.name || '');
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (error: any) {
        console.error('Error loading profile:', error.message);
        
        // Handle the case where we can't load the profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Fall back to using session data
          setEmail(session.user.email || '');
          setName(session.user.user_metadata?.name || '');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      if (!profile) return;
      
      // Upload avatar if changed
      let avatarPath = avatarUrl;
      
      if (avatar) {
        // Add a size check
        if (avatar.size > 5 * 1024 * 1024) {
          throw new Error('Avatar image must be smaller than 5MB');
        }
        
        console.log('Starting avatar upload...');
        const newAvatarUrl = await uploadAvatar(profile.id, avatar);
        console.log('Upload result:', newAvatarUrl);
        
        if (!newAvatarUrl) {
          throw new Error('Failed to upload avatar - check browser console for details');
        }
        
        avatarPath = newAvatarUrl;
      }
      
      // Update profile in database
      console.log('Updating profile with:', { name, avatar_url: avatarPath });
      const updatedProfile = await updateProfile(profile.id, {
        name,
        avatar_url: avatarPath,
      });
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile information');
      }
      
      // Update session data if name changed
      await supabase.auth.updateUser({
        data: { name }
      });
      
      setProfile(updatedProfile);
      setAvatarUrl(updatedProfile.avatar_url);
      
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Error sending password reset');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading profile...</p>
        </div>
      ) : (
        <div className="min-h-screen py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-8">Your Profile</h1>
              
              {error && (
                <div className="p-4 mb-6 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-4 mb-6 text-sm rounded-lg bg-green-100 text-green-700 border border-green-200">
                  {success}
                </div>
              )}
              
              <div className="bg-background rounded-xl shadow-lg border border-primary/10 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-primary">
                            {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        Change
                        <input 
                          type="file" 
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{profile?.name || 'User'}</h2>
                      <p className="text-foreground/70">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
                        Full name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 bg-background/50 border border-foreground/10 rounded-lg cursor-not-allowed opacity-70"
                      />
                      <p className="mt-1 text-xs text-foreground/60">Email address cannot be changed</p>
                    </div>
                    
                    <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-between">
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="px-6 py-3 rounded-lg border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="p-6 bg-foreground/5 border-t border-primary/10">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-1">Account</h3>
                      <p className="text-sm text-foreground/70">Manage your account settings</p>
                    </div>
                    
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 