'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MindfulnessExerciseProps {
  duration?: number; // Duration in seconds
  onComplete?: () => void;
}

type MindfulnessType = 
  | 'body-scan' 
  | 'sitting-meditation' 
  | 'walking-meditation' 
  | 'mindful-observation' 
  | 'mindful-awareness'
  | 'mindful-appreciation';

export default function MindfulnessExercise({
  duration = 300, // Default 5 minutes (300 seconds)
  onComplete,
}: MindfulnessExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState('Choose a mindfulness practice to begin');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<MindfulnessType | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { currentTheme } = useTheme();
  const supabase = createClientComponentClient();

  // Check if the exercise has been completed today
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        const { data: activities } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('title', 'Daily Mindfulness')
          .eq('completed', true);
          
        if (activities && activities.length > 0) {
          const lastCompleted = activities[0].last_completed?.split('T')[0];
          if (lastCompleted === today) {
            setIsCompleted(true);
            setMessage('Already completed today! Great job!');
          }
        }
      } catch (error) {
        console.error('Error checking mindfulness exercise status:', error);
      }
    };
    
    checkCompletionStatus();
  }, [supabase]);

  // Timer logic
  useEffect(() => {
    if (!isActive || !selectedPractice) return;
    
    // Initialize start time
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    
    const animate = (timestamp: number) => {
      // Update overall timer based on elapsed time since start
      if (startTimeRef.current !== null) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const remaining = Math.max(0, duration - elapsed);
        setTimeRemaining(Math.ceil(remaining));
        
        // Guide through the steps based on time elapsed
        const stepDuration = duration / getPracticeSteps().length;
        const currentStepIndex = Math.min(
          Math.floor(elapsed / stepDuration),
          getPracticeSteps().length - 1
        );
        
        if (currentStepIndex !== currentStep) {
          setCurrentStep(currentStepIndex);
          setMessage(getPracticeSteps()[currentStepIndex]);
        }
        
        // Check if exercise is complete
        if (remaining <= 0) {
          setIsActive(false);
          setMessage('Complete! Great job with your mindfulness practice.');
          markAsCompleted();
          if (onComplete) onComplete();
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, selectedPractice, currentStep, onComplete]);
  
  // Get practice steps based on selected practice
  const getPracticeSteps = () => {
    switch (selectedPractice) {
      case 'body-scan':
        return [
          'Find a comfortable position lying on your back or sitting.',
          'Take a few deep breaths, allowing your body to relax.',
          'Bring attention to your feet. Notice any sensations without judgment.',
          'Slowly move your attention up through your legs, noticing sensations.',
          'Continue to your abdomen, chest, and notice your breathing.',
          'Move to your hands, arms, shoulders, feeling any tension.',
          'Focus on your neck, face, and head, releasing tension.',
          'Be aware of your whole body, breathing naturally.',
          'When ready, slowly reawaken your body with gentle movements.'
        ];
      case 'sitting-meditation':
        return [
          'Sit comfortably with your back straight and feet flat on the floor.',
          'Rest your hands in your lap and gently close your eyes.',
          'Focus on your breath moving in and out of your body.',
          'Notice the sensation of air flowing through your nostrils.',
          'Feel your chest and abdomen rise and fall with each breath.',
          'When your mind wanders, gently return focus to your breathing.',
          'Allow thoughts to come and go without judgment.',
          'Continue breathing mindfully, staying present.',
          'When ready, slowly open your eyes and notice how you feel.'
        ];
      case 'walking-meditation':
        return [
          'Find a quiet space about 10-20 feet long to walk back and forth.',
          'Stand at one end, feeling your feet touching the ground.',
          'Begin walking slowly, noticing the sensation in your feet.',
          'Feel the shifting of weight and balance with each step.',
          'Notice the movement of your legs, arms, and entire body.',
          'When your mind wanders, return focus to the physical sensations.',
          'At the end of your path, pause, breathe, and turn mindfully.',
          'Continue walking back and forth with full awareness.',
          'When finished, stand still and observe how your body feels.'
        ];
      case 'mindful-observation':
        return [
          'Choose a natural object within your immediate environment.',
          'Focus on watching it for a few minutes. This could be a flower, an insect, the clouds, or the moon.',
          'Don\'t do anything except notice the thing you are looking at.',
          'Visually explore every aspect of its formation.',
          'Allow yourself to be consumed by its presence.',
          'Allow yourself to connect with its energy and purpose in nature.',
          'Consider that this object is the product of climate, soil, air, water, sun – everything in nature.',
          'Notice the uniqueness of this object and its special place in the world.',
          'As you finish, reflect on what you observed and learned from this practice.'
        ];
      case 'mindful-awareness':
        return [
          'Choose a routine activity like brushing teeth, taking a shower, or eating.',
          'Turn your full attention to this task, slowing down the process.',
          'Notice every aspect of what you\'re doing and experiencing.',
          'Use all your senses to fully engage with the present moment.',
          'Feel textures, notice shapes, colors, sounds, and smells.',
          'Observe how your body moves during this activity.',
          'If your mind wanders, gently bring attention back to the task.',
          'Notice any resistance or impatience and let it go.',
          'Appreciate the opportunity to perform this simple activity.'
        ];
      case 'mindful-appreciation':
        return [
          'Take a moment to identify five things you usually take for granted.',
          'Consider objects or people that support your life but often go unnoticed.',
          'Focus on one thing at a time, giving it your full attention.',
          'Consider its origins, journey, and how it supports your wellbeing.',
          'Mentally thank this object or person for its service to you.',
          'Notice any feelings of gratitude that arise within you.',
          'Move to the next item on your list with the same mindful appreciation.',
          'Reflect on the interconnectedness of all things in your life.',
          'Notice how this practice affects your mood and perspective.'
        ];
      default:
        return [
          'Choose a mindfulness practice to begin',
          'Follow the guided instructions',
          'Stay present with each moment',
          'Notice your thoughts without judgment',
          'Return to your focus when your mind wanders',
          'Practice patience and self-compassion',
          'Observe sensations in your body',
          'Breathe naturally throughout the practice',
          'Acknowledge your effort in practicing mindfulness'
        ];
    }
  };
  
  const getPracticeDescription = (practice: MindfulnessType) => {
    switch (practice) {
      case 'body-scan':
        return 'Systematically focus attention on different parts of your body, from your feet to your head, noticing sensations without judgment.';
      case 'sitting-meditation':
        return 'Focus on your breath while sitting comfortably, bringing attention back to your breathing whenever your mind wanders.';
      case 'walking-meditation':
        return 'Focus on the experience of walking, being aware of the sensations of standing and the subtle movements that keep your balance.';
      case 'mindful-observation':
        return 'Choose a natural object and observe it closely, exploring its features as if you\'re seeing it for the first time.';
      case 'mindful-awareness':
        return 'Bring awareness to routine daily activities that you usually do automatically, like eating, brushing teeth, or washing dishes.';
      case 'mindful-appreciation':
        return 'Notice five things in your day that usually go unappreciated and reflect on their value and how they support your life.';
      default:
        return '';
    }
  };
  
  const markAsCompleted = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Check if there's already a "Daily Mindfulness" activity
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('title', 'Daily Mindfulness');
      
      const today = new Date().toISOString().split('T')[0];
      
      if (activities && activities.length > 0) {
        const activity = activities[0];
        const lastCompleted = activity.last_completed ? activity.last_completed.split('T')[0] : null;
        
        // Calculate new streak
        let newStreak = activity.streak || 0;
        
        if (lastCompleted === today) {
          // Already completed today
          setIsCompleted(true);
          return;
        }
        
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
        
        // Update the activity
        await supabase
          .from('user_activities')
          .update({
            completed: true,
            streak: newStreak,
            last_completed: new Date().toISOString()
          })
          .eq('id', activity.id);
          
        setIsCompleted(true);
        
        // Call onComplete to refresh the activities list in the parent component
        if (onComplete) onComplete();
      } else {
        // Create a new mindfulness activity
        const { data: newActivity } = await supabase
          .from('user_activities')
          .insert({
            user_id: session.user.id,
            title: 'Daily Mindfulness',
            description: 'Start with 5 minutes of mindfulness meditation each day.',
            frequency: 'Daily',
            completed: true,
            streak: 1,
            last_completed: new Date().toISOString()
          })
          .select()
          .single();
          
        setIsCompleted(true);
        
        // Call onComplete to refresh the activities list in the parent component
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error('Error marking mindfulness exercise as completed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startExercise = (practice: MindfulnessType) => {
    setSelectedPractice(practice);
    setIsActive(true);
    setCurrentStep(0);
    setMessage(getPracticeSteps()[0]);
    startTimeRef.current = null;
  };
  
  const pauseExercise = () => {
    setIsActive(false);
    setMessage('Paused - resume when you\'re ready');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  const resumeExercise = () => {
    setIsActive(true);
    setMessage(getPracticeSteps()[currentStep]);
  };
  
  const resetExercise = () => {
    setIsActive(false);
    setTimeRemaining(duration);
    setCurrentStep(0);
    setSelectedPractice(null);
    setMessage('Choose a mindfulness practice to begin');
    startTimeRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    return ((duration - timeRemaining) / duration) * 100;
  };

  // Get icon for practice
  const getPracticeIcon = (practice: MindfulnessType) => {
    switch (practice) {
      case 'body-scan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'sitting-meditation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'walking-meditation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'mindful-observation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'mindful-awareness':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'mindful-appreciation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-background rounded-lg">
      <div className="text-2xl font-medium mb-6 text-foreground text-center">{message}</div>
      
      {/* Exercise in progress */}
      {selectedPractice && (
        <div className="w-full max-w-lg mb-6">
          {/* Progress bar */}
          <div className="w-full h-2 bg-primary/10 rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {/* Timer */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-foreground/70">
              Step {currentStep + 1} of {getPracticeSteps().length}
            </span>
            <span className="text-base font-mono bg-primary/10 text-primary px-3 py-1 rounded-md">
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          {/* Current step instruction */}
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mb-6">
            <p className="text-foreground text-lg">{getPracticeSteps()[currentStep]}</p>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-4">
            {isActive ? (
              <button
                onClick={pauseExercise}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-gray-500 text-white transition-colors disabled:opacity-50"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={resumeExercise}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50"
              >
                Resume
              </button>
            )}
            <button
              onClick={resetExercise}
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-background border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            {!isActive && timeRemaining < duration && (
              <button
                onClick={markAsCompleted}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Mark Complete'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Practice selection */}
      {!selectedPractice && !isCompleted && (
        <div className="w-full max-w-2xl">
          <h3 className="text-lg font-medium mb-4 text-center">Select a mindfulness practice:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(['body-scan', 'sitting-meditation', 'walking-meditation', 'mindful-observation', 'mindful-awareness', 'mindful-appreciation'] as MindfulnessType[]).map((practice) => (
              <button
                key={practice}
                onClick={() => startExercise(practice)}
                className="p-4 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors text-left flex items-start"
              >
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full mr-3 mt-1">
                  {getPracticeIcon(practice)}
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    {practice.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h4>
                  <p className="text-sm text-foreground/70">{getPracticeDescription(practice)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed state */}
      {isCompleted && !selectedPractice && (
        <div className="mb-6 flex flex-col items-center">
          <div className="px-6 py-3 rounded-full bg-green-100 text-green-700 border border-green-300 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed Today
          </div>
          <button
            onClick={resetExercise}
            className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            Practice Again
          </button>
        </div>
      )}
      
      {/* Mindfulness information */}
      <div className="mt-6 text-sm text-foreground/70 max-w-md text-center">
        <p className="mb-2">
          <strong>Benefits of Mindfulness:</strong> Regular practice can reduce stress, 
          improve focus, and enhance emotional regulation.
        </p>
        <p>
          Mindfulness is the practice of being intensely aware of what you're sensing and 
          feeling in the moment, without interpretation or judgment.
        </p>
      </div>
    </div>
  );
} 