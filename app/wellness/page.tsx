'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserAnalysis } from '../lib/services/userAnalysisService';
import { UserAnalysisService } from '../lib/services/userAnalysisService';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Card from '../components/ui/Card';
import BreathingExercise from '../components/ui/BreathingExercise';
import MindfulnessExercise from '../components/ui/MindfulnessExercise';
import { User } from '@supabase/supabase-js';
import { useTheme } from '../lib/themeContext';
import VideoModal from '../components/ui/VideoModal';

interface Activity {
  id: string;
  title: string;
  description: string;
  frequency: string;
  completed: boolean;
  streak: number;
  lastCompleted?: string;
}

export default function WellnessActivitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showMindfulnessExercise, setShowMindfulnessExercise] = useState(false);
  const [showPMRExercise, setShowPMRExercise] = useState(false);
  const [showMindfulMovementExercise, setShowMindfulMovementExercise] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: '', title: '' });
  const supabase = createClientComponentClient();
  const { currentTheme } = useTheme();

  // Load user data
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserData(session.user.id);
      }
      setLoading(false);
    };
    
    getUser();
  }, [supabase]);

  // Load user analysis and activities
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      // Get user analysis
      const service = new UserAnalysisService();
      const userAnalysis = await service.getUserAnalysis(userId);
      setAnalysis(userAnalysis);
      
      // Default wellness activities that everyone should have
      const defaultActivities = [
        {
          title: 'Daily Mindfulness',
          description: 'Start with 5 minutes of mindfulness meditation each day.',
          frequency: 'Daily'
        },
        {
          title: 'Deep Breathing',
          description: 'Practice deep breathing when feeling stressed.',
          frequency: 'As needed'
        },
        {
          title: 'Journaling',
          description: 'Write about your thoughts, feelings, and experiences for self-reflection.',
          frequency: 'Daily'
        },
        {
          title: 'Progressive Muscle Relaxation',
          description: 'Tense and then relax muscle groups to reduce physical tension and stress.',
          frequency: 'As needed'
        },
        {
          title: 'Mindful Movement',
          description: 'Practice gentle movement like Tai Chi, Qigong, or Yoga to connect mind and body.',
          frequency: 'Weekly'
        }
      ];
      
      // Get or create user activities
      const { data: existingActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId);
      
      if (existingActivities && existingActivities.length > 0) {
        // First, convert existing activities to the right format
        const formattedActivities = existingActivities.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          frequency: a.frequency || 'Daily',
          completed: a.completed || false,
          streak: a.streak || 0,
          lastCompleted: a.last_completed
        }));
        
        // Check if any default activities are missing and add them
        const existingTitles = formattedActivities.map(a => a.title);
        const missingActivities = defaultActivities.filter(a => !existingTitles.includes(a.title));
        
        if (missingActivities.length > 0) {
          // Add missing default activities
          const newActivities = await Promise.all(missingActivities.map(async (practice) => {
            const { data: activityData, error } = await supabase
              .from('user_activities')
              .insert({
                user_id: userId,
                title: practice.title,
                description: practice.description,
                frequency: practice.frequency || 'Daily',
                completed: false,
                streak: 0
              })
              .select()
              .single();
            
            if (error) throw error;
            
            return {
              id: activityData.id,
              title: activityData.title,
              description: activityData.description,
              frequency: activityData.frequency || 'Daily',
              completed: false,
              streak: 0
            };
          }));
          
          // Combine existing and new activities
          setActivities([...formattedActivities, ...newActivities]);
        } else {
          // No missing activities, just use existing ones
          setActivities(formattedActivities);
        }
      } else if (userAnalysis) {
        // No existing activities, create all defaults plus recommendations
        const allActivities = [
          ...defaultActivities,
          ...userAnalysis.recommended_practices
        ];
        
        // Create activities
        const newActivities = await Promise.all(allActivities.map(async (practice) => {
          const { data: activityData, error } = await supabase
            .from('user_activities')
            .insert({
              user_id: userId,
              title: practice.title,
              description: practice.description,
              frequency: practice.frequency || 'Daily',
              completed: false,
              streak: 0
            })
            .select()
            .single();
          
          if (error) throw error;
          
          return {
            id: activityData.id,
            title: activityData.title,
            description: activityData.description,
            frequency: activityData.frequency || 'Daily',
            completed: false,
            streak: 0
          };
        }));
        
        setActivities(newActivities);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
      setError('Failed to load your wellness activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Mark activity as complete
  const completeActivity = async (activityId: string) => {
    if (!user) return;
    
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;
      
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = activity.lastCompleted ? activity.lastCompleted.split('T')[0] : null;
      
      // Calculate new streak
      let newStreak = activity.streak;
      
      if (lastCompleted === today) {
        // Already completed today, toggle off
        newStreak = Math.max(0, newStreak - 1);
        
        await supabase
          .from('user_activities')
          .update({
            completed: false,
            streak: newStreak,
            last_completed: null
          })
          .eq('id', activityId);
          
        setActivities(activities.map(a => 
          a.id === activityId 
            ? { ...a, completed: false, streak: newStreak, lastCompleted: undefined } 
            : a
        ));
      } else {
        // Not completed today, mark as complete
        // Check if the last completion was yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastCompleted === yesterdayStr) {
          // Completed yesterday, increment streak
          newStreak += 1;
        } else if (!lastCompleted) {
          // First time completing, start streak
          newStreak = 1;
        } else {
          // Streak broken, restart
          newStreak = 1;
        }
        
        await supabase
          .from('user_activities')
          .update({
            completed: true,
            streak: newStreak,
            last_completed: new Date().toISOString()
          })
          .eq('id', activityId);
          
        setActivities(activities.map(a => 
          a.id === activityId 
            ? { ...a, completed: true, streak: newStreak, lastCompleted: new Date().toISOString() } 
            : a
        ));
      }
    } catch (e) {
      console.error('Error updating activity:', e);
      setError('Failed to update activity status. Please try again.');
    }
  };
  
  // Add a custom activity
  const addCustomActivity = async () => {
    if (!user) return;
    
    try {
      const title = prompt('Activity title:');
      if (!title) return;
      
      const description = prompt('Activity description (optional):');
      const frequency = prompt('Frequency (Daily, Weekly, As needed):', 'Daily');
      
      const { data: newActivity, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          title,
          description: description || '',
          frequency: frequency || 'Daily',
          completed: false,
          streak: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities([...activities, {
        id: newActivity.id,
        title: newActivity.title,
        description: newActivity.description,
        frequency: newActivity.frequency,
        completed: false,
        streak: 0
      }]);
    } catch (e) {
      console.error('Error adding activity:', e);
      setError('Failed to add activity. Please try again.');
    }
  };
  
  // Delete an activity
  const deleteActivity = async (activityId: string) => {
    if (!user) return;
    
    try {
      const confirmed = window.confirm('Are you sure you want to delete this activity?');
      if (!confirmed) return;
      
      await supabase
        .from('user_activities')
        .delete()
        .eq('id', activityId);
      
      setActivities(activities.filter(a => a.id !== activityId));
    } catch (e) {
      console.error('Error deleting activity:', e);
      setError('Failed to delete activity. Please try again.');
    }
  };
  
  // Get frequency color
  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'bg-blue-100 text-blue-700';
      case 'weekly':
        return 'bg-purple-100 text-purple-700';
      case 'monthly':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Toggle breathing exercise
  const toggleBreathingExercise = () => {
    setShowBreathingExercise(!showBreathingExercise);
    setShowMindfulnessExercise(false);
    setShowPMRExercise(false);
    setShowMindfulMovementExercise(false);
  };

  // Toggle mindfulness exercise
  const toggleMindfulnessExercise = () => {
    setShowMindfulnessExercise(!showMindfulnessExercise);
    setShowBreathingExercise(false);
    setShowPMRExercise(false);
    setShowMindfulMovementExercise(false);
  };
  
  // Toggle PMR exercise
  const togglePMRExercise = () => {
    setShowPMRExercise(!showPMRExercise);
    setShowMindfulnessExercise(false);
    setShowBreathingExercise(false);
    setShowMindfulMovementExercise(false);
  };
  
  // Toggle Mindful Movement exercise
  const toggleMindfulMovementExercise = () => {
    setShowMindfulMovementExercise(!showMindfulMovementExercise);
    setShowMindfulnessExercise(false);
    setShowBreathingExercise(false);
    setShowPMRExercise(false);
  };

  // Function to open video modal
  const openVideoModal = (videoUrl: string, title: string) => {
    setCurrentVideo({ url: videoUrl, title });
    setVideoModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Activities</h1>
              <p className="text-foreground/70">Track your wellness practices and build healthy habits</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button 
                onClick={addCustomActivity}
                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Add Custom Activity
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Breathing Exercise */}
          {showBreathingExercise && (
            <div className="mb-6">
              <Card className="overflow-hidden">
                <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
                  <h2 className="text-xl font-semibold text-foreground">Guided Breathing Exercise</h2>
                  <button 
                    onClick={toggleBreathingExercise}
                    className="p-1 hover:bg-primary/10 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <BreathingExercise 
                  duration={180}
                  breathsPerMinute={6}
                  onComplete={() => {
                    // Re-fetch activities after exercise completion
                    if (user) {
                      loadUserData(user.id);
                      
                      // Find and mark the Deep Breathing activity as completed
                      const deepBreathingActivity = activities.find(a => a.title === 'Deep Breathing');
                      if (deepBreathingActivity) {
                        completeActivity(deepBreathingActivity.id);
                      }
                      
                      // Close the breathing exercise modal after completion
                      setTimeout(() => {
                        setShowBreathingExercise(false);
                      }, 2000);
                    }
                  }}
                />
              </Card>
            </div>
          )}
          
          {/* Mindfulness Exercise */}
          {showMindfulnessExercise && (
            <div className="mb-6">
              <Card className="overflow-hidden">
                <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
                  <h2 className="text-xl font-semibold text-foreground">Daily Mindfulness Practice</h2>
                  <button 
                    onClick={toggleMindfulnessExercise}
                    className="p-1 hover:bg-primary/10 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <MindfulnessExercise 
                  duration={300}
                  onComplete={() => {
                    // Re-fetch activities after exercise completion
                    if (user) {
                      loadUserData(user.id);
                      
                      // Find and mark the Daily Mindfulness activity as completed
                      const mindfulnessActivity = activities.find(a => a.title === 'Daily Mindfulness');
                      if (mindfulnessActivity) {
                        completeActivity(mindfulnessActivity.id);
                      }
                      
                      // Close the mindfulness exercise modal after completion
                      setTimeout(() => {
                        setShowMindfulnessExercise(false);
                      }, 2000);
                    }
                  }}
                />
              </Card>
            </div>
          )}
          
          {/* PMR Exercise */}
          {showPMRExercise && (
            <div className="mb-6">
              <Card className="overflow-hidden">
                <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
                  <h2 className="text-xl font-semibold text-foreground">Progressive Muscle Relaxation</h2>
                  <button 
                    onClick={togglePMRExercise}
                    className="p-1 hover:bg-primary/10 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-8 bg-background">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-medium mb-4">Follow These Steps</h3>
                    <p className="text-foreground/70 mb-6">Progressive Muscle Relaxation involves tensing and then relaxing different muscle groups to reduce physical tension and stress.</p>
                  </div>
                  
                  <div className="max-w-lg mx-auto space-y-6">
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">1. Preparation</h4>
                      <p className="text-sm text-foreground/70">Find a quiet, comfortable place to sit or lie down. Loosen any tight clothing and remove shoes. Take a few deep breaths.</p>
                    </div>
                    
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">2. Feet and Legs</h4>
                      <p className="text-sm text-foreground/70">Curl your toes tightly for 5-10 seconds, then release and notice the difference. Next, tense your calf muscles, hold, then release.</p>
                    </div>
                    
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">3. Abdomen and Chest</h4>
                      <p className="text-sm text-foreground/70">Tighten your stomach muscles for 5-10 seconds, then release. Next, tense your chest, hold, then release.</p>
                    </div>
                    
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">4. Arms and Hands</h4>
                      <p className="text-sm text-foreground/70">Make a fist with both hands, squeezing tightly for 5-10 seconds, then release. Next, tense your biceps, hold, then release.</p>
                    </div>
                    
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">5. Shoulders, Neck, and Face</h4>
                      <p className="text-sm text-foreground/70">Raise your shoulders toward your ears, hold, then release. Tense your neck, then your face, holding each for 5-10 seconds before releasing.</p>
                    </div>
                    
                    <div className="border border-primary/10 rounded-lg p-4 bg-primary/5">
                      <h4 className="font-medium mb-2">6. Full Body Awareness</h4>
                      <p className="text-sm text-foreground/70">After completing all muscle groups, take a moment to notice how your body feels. Compare the relaxed state to the tensed state.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => {
                        const pmrActivity = activities.find(a => a.title === 'Progressive Muscle Relaxation');
                        if (pmrActivity) {
                          completeActivity(pmrActivity.id);
                          setTimeout(() => {
                            togglePMRExercise();
                          }, 1000);
                        }
                      }}
                      className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Mindful Movement Exercise */}
          {showMindfulMovementExercise && (
            <div className="mb-6">
              <Card className="overflow-hidden">
                <div className="flex justify-between items-center bg-primary/5 p-4 border-b border-primary/10">
                  <h2 className="text-xl font-semibold text-foreground">Mindful Movement</h2>
                  <button 
                    onClick={toggleMindfulMovementExercise}
                    className="p-1 hover:bg-primary/10 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-8 bg-background">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-medium mb-4">Mindful Movement Practices</h3>
                    <p className="text-foreground/70 mb-6">Choose from these gentle movement practices to connect mind and body:</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div 
                      className="border border-primary/10 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => {
                        openVideoModal('https://www.youtube.com/embed/cEOS2zoyQw4', 'Tai Chi for Beginners');
                        console.log('Opening Tai Chi video');
                      }}
                    >
                      <h4 className="font-medium mb-2 text-center">Tai Chi</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3 relative group">
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70">Slow, flowing movements with focused breathing to promote harmony and balance.</p>
                    </div>
                    
                    <div 
                      className="border border-primary/10 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => {
                        openVideoModal('https://www.youtube.com/embed/Ac3mhgHpQQ0', 'Qigong for Beginners');
                        console.log('Opening Qigong video');
                      }}
                    >
                      <h4 className="font-medium mb-2 text-center">Qigong</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3 relative group">
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70">Coordinated body postures, movement, breathing, and meditation to enhance life energy.</p>
                    </div>
                    
                    <div 
                      className="border border-primary/10 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => {
                        openVideoModal('https://www.youtube.com/embed/VaoV1PrYft4', 'Gentle Yoga for Beginners');
                        console.log('Opening Yoga video');
                      }}
                    >
                      <h4 className="font-medium mb-2 text-center">Yoga</h4>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3 relative group">
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70">Postures, meditation, and breathing techniques to promote physical and mental wellbeing.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 max-w-lg mx-auto">
                    <h4 className="font-medium mb-3 text-center">How to Practice Mindful Movement</h4>
                    <ol className="space-y-2 text-sm text-foreground/70 list-decimal pl-5">
                      <li>Choose a practice that interests you (Tai Chi, Qigong, Yoga, or another gentle movement practice)</li>
                      <li>Find a quiet space where you won't be disturbed</li>
                      <li>Wear comfortable clothing that allows for free movement</li>
                      <li>Focus on your breathing throughout the practice</li>
                      <li>Pay attention to how your body feels with each movement</li>
                      <li>Start with just 5-10 minutes and gradually increase as you get comfortable</li>
                      <li>Be patient with yourself and avoid straining or pushing too hard</li>
                    </ol>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => {
                        const mindfulMovementActivity = activities.find(a => a.title === 'Mindful Movement');
                        if (mindfulMovementActivity) {
                          completeActivity(mindfulMovementActivity.id);
                          setTimeout(() => {
                            toggleMindfulMovementExercise();
                          }, 1000);
                        }
                      }}
                      className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Video Modal */}
          <VideoModal 
            isOpen={videoModalOpen} 
            onClose={() => setVideoModalOpen(false)} 
            videoUrl={currentVideo.url} 
            title={currentVideo.title} 
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-background rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Activities Found</h2>
              <p className="text-foreground/70 mb-6">
                You don't have any wellness activities yet. Add a custom activity or chat with the AI to get personalized recommendations.
              </p>
              <button 
                onClick={addCustomActivity} 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Your First Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Filter out duplicate activities by title */}
              {activities
                .filter((activity, index, self) => 
                  index === self.findIndex(a => a.title === activity.title)
                )
                .map((activity) => (
                <Card key={activity.id} className="p-0 overflow-hidden">
                  <div className="relative">
                    <div className={`absolute top-0 left-0 w-full h-1 ${activity.completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">{activity.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getFrequencyColor(activity.frequency)}`}>
                          {activity.frequency}
                        </span>
                      </div>
                      
                      <p className="text-foreground/70 text-sm mb-4">
                        {activity.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Streak:</span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono">
                            {activity.streak} {activity.streak === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete activity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {activity.title === 'Deep Breathing' ? (
                            <button
                              onClick={() => setShowBreathingExercise(true)}
                              className={`p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20`}
                              title="Start breathing exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : activity.title === 'Daily Mindfulness' ? (
                            <button
                              onClick={() => setShowMindfulnessExercise(true)}
                              className={`p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20`}
                              title="Start mindfulness exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : activity.title === 'Journaling' ? (
                            <a 
                              href="/journal" 
                              className={`p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center`}
                              title="Open journal"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </a>
                          ) : activity.title === 'Progressive Muscle Relaxation' ? (
                            <button
                              onClick={() => togglePMRExercise()}
                              className={`p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20`}
                              title="Start PMR exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : activity.title === 'Mindful Movement' ? (
                            <button
                              onClick={() => toggleMindfulMovementExercise()}
                              className={`p-2 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20`}
                              title="Start Mindful Movement exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => completeActivity(activity.id)}
                              className={`p-2 rounded-full transition-colors ${
                                activity.completed 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-500'
                              }`}
                              title={activity.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Wellness Tips */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6">Wellness Tips</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Consistency Matters</h3>
                    <p className="text-foreground/70 text-sm">Small daily actions lead to significant changes over time. Focus on building consistent habits rather than making big changes all at once.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Start Small</h3>
                    <p className="text-foreground/70 text-sm">Begin with just 2-5 minutes of a new practice. As it becomes a habit, gradually increase the duration.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Celebrate Progress</h3>
                    <p className="text-foreground/70 text-sm">Acknowledge and celebrate your achievements, no matter how small. Each completed activity is a step towards better wellbeing.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Mix and Match</h3>
                    <p className="text-foreground/70 text-sm">Explore different wellness practices to find what works best for you. A variety of activities can help you maintain interest and address different aspects of wellbeing.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 