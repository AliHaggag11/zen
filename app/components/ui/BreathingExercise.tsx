'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/lib/themeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BreathingExerciseProps {
  duration?: number; // Duration in seconds
  breathsPerMinute?: number;
  onComplete?: () => void;
}

export default function BreathingExercise({
  duration = 180, // Default 3 minutes (180 seconds)
  breathsPerMinute = 6, // More relaxed breathing pace
  onComplete,
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [message, setMessage] = useState('Press start to begin');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [breathCount, setBreathCount] = useState(1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPhaseChangeRef = useRef<number | null>(null);
  const { currentTheme } = useTheme();
  const supabase = createClientComponentClient();
  
  // Calculate timings based on breaths per minute
  const cycleDuration = 60 / breathsPerMinute; // Total time for one breath cycle in seconds
  const inhaleDuration = cycleDuration * 0.45; // 45% of the cycle for inhale
  const holdDuration = cycleDuration * 0.10; // 10% of the cycle for hold
  const exhaleDuration = cycleDuration * 0.35; // 35% of the cycle for exhale
  const restDuration = cycleDuration * 0.10; // 10% of the cycle for rest

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
          .eq('title', 'Deep Breathing')
          .eq('completed', true);
          
        if (activities && activities.length > 0) {
          const lastCompleted = activities[0].last_completed?.split('T')[0];
          if (lastCompleted === today) {
            setIsCompleted(true);
            setMessage('Already completed today! Great job!');
          }
        }
      } catch (error) {
        console.error('Error checking breathing exercise status:', error);
      }
    };
    
    checkCompletionStatus();
  }, [supabase]);

  useEffect(() => {
    if (!isActive) return;
    
    // Initialize start time and phase change time
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    
    if (lastPhaseChangeRef.current === null) {
      lastPhaseChangeRef.current = performance.now();
    }
    
    const animate = (timestamp: number) => {
      // Update overall timer based on elapsed time since start
      if (startTimeRef.current !== null) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const remaining = Math.max(0, duration - elapsed);
        setTimeRemaining(Math.ceil(remaining));
        
        // Update phase timer based on elapsed time since last phase change
        if (lastPhaseChangeRef.current !== null) {
          const phaseElapsed = (timestamp - lastPhaseChangeRef.current) / 1000;
          
          // Determine current phase duration
          let currentPhaseDuration: number;
          switch (breathPhase) {
            case 'inhale':
              currentPhaseDuration = inhaleDuration;
              setMessage(`Breathe in (${breathCount})...`);
              break;
            case 'hold':
              currentPhaseDuration = holdDuration;
              setMessage(`Hold...`);
              break;
            case 'exhale':
              currentPhaseDuration = exhaleDuration;
              setMessage(`Breathe out...`);
              break;
            case 'rest':
              currentPhaseDuration = restDuration;
              setMessage(`Rest...`);
              break;
          }
          
          setPhaseTime(phaseElapsed / currentPhaseDuration);
          
          // Check if phase should change
          if (phaseElapsed >= currentPhaseDuration) {
            lastPhaseChangeRef.current = timestamp;
            
            // Move to next phase
            switch (breathPhase) {
              case 'inhale':
                setBreathPhase('hold');
                break;
              case 'hold':
                setBreathPhase('exhale');
                break;
              case 'exhale':
                setBreathPhase('rest');
                break;
              case 'rest':
                setBreathPhase('inhale');
                // Increment breath count when starting a new breath cycle
                setBreathCount(prevCount => prevCount + 1);
                break;
            }
          }
        }
        
        // Check if exercise is complete
        if (remaining <= 0) {
          setIsActive(false);
          setMessage('Complete! Great job!');
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
  }, [isActive, breathPhase, duration, inhaleDuration, holdDuration, exhaleDuration, restDuration, onComplete, breathCount]);
  
  const markAsCompleted = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Check if there's already a "Deep Breathing" activity
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('title', 'Deep Breathing');
      
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
        // Create a new breathing activity
        const { data: newActivity } = await supabase
          .from('user_activities')
          .insert({
            user_id: session.user.id,
            title: 'Deep Breathing',
            description: 'Practice deep breathing when feeling stressed.',
            frequency: 'As needed',
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
      console.error('Error marking breathing exercise as completed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleExercise = () => {
    if (isActive) {
      // Stop the exercise
      setIsActive(false);
      setMessage('Paused');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      // Start or resume the exercise
      setIsActive(true);
      setBreathPhase('inhale');
      setMessage('Breathe in...');
      
      // Reset time refs if starting from beginning
      if (timeRemaining === duration) {
        startTimeRef.current = null;
        lastPhaseChangeRef.current = null;
        setBreathCount(1);
      }
    }
  };
  
  const resetExercise = () => {
    setIsActive(false);
    setTimeRemaining(duration);
    setBreathPhase('inhale');
    setPhaseTime(0);
    setBreathCount(1);
    setMessage('Press start to begin');
    startTimeRef.current = null;
    lastPhaseChangeRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // Calculate circle size based on breath phase
  const getCircleSize = () => {
    switch (breathPhase) {
      case 'inhale':
        return 100 + (80 * phaseTime); // Grow from 100% to 180% (less extreme)
      case 'hold':
        return 180; // Stay at 180%
      case 'exhale':
        return 180 - (80 * phaseTime); // Shrink from 180% to 100%
      case 'rest':
        return 100; // Stay at 100%
    }
  };
  
  // Get breathing instructions based on the NHS guidelines
  const getBreathingInstructions = () => {
    return (
      <>
        <p className="mb-2">
          <strong>NHS Recommended Technique:</strong> This breathing exercise helps reduce stress and anxiety.
        </p>
        <ul className="text-left list-disc pl-5 space-y-1 mb-2">
          <li>Breathe deeply down into your belly, not just your chest</li>
          <li>Try to breathe in through your nose and out through your mouth</li>
          <li>Keep your breathing gentle and regular</li>
          <li>Count slowly as you breathe if helpful</li>
        </ul>
        <p>
          For best results, practice this exercise for at least 5 minutes daily.
        </p>
      </>
    );
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-background rounded-lg">
      <div className="text-2xl font-medium mb-6 text-foreground text-center">{message}</div>
      
      <div className="relative flex items-center justify-center mb-8 h-44 w-44">
        {/* Progress ring */}
        <svg className="absolute w-44 h-44" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-primary/10" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 * (timeRemaining / duration)} 
            className="text-primary/60 transition-all duration-300" 
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Timer inside circle - positioned with z-index to ensure it's visible */}
        <div className="absolute text-xl font-mono text-primary/80 bg-background/90 px-3 py-1 rounded-lg z-10">
          {formatTime(timeRemaining)}
        </div>
        
        {/* Animated breathing circle - lower z-index so it doesn't cover the timer text */}
        <div 
          className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 ease-in-out z-0 ${
            isActive ? 'border-primary/70 bg-primary/20' : 'border-primary/30 bg-primary/10'
          }`}
          style={{ 
            transform: `scale(${getCircleSize() / 100})`,
          }}
        />
      </div>
      
      <div className="flex gap-4 mt-2 mb-6">
        {!isCompleted ? (
          <>
            <button
              onClick={toggleExercise}
              disabled={isLoading}
              className={`px-8 py-3 rounded-full ${
                isActive 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              } transition-colors disabled:opacity-50`}
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            {isActive && (
              <button
                onClick={resetExercise}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-background border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            )}
            {!isActive && timeRemaining < duration && (
              <button
                onClick={markAsCompleted}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Mark Complete'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="px-6 py-3 rounded-full bg-green-100 text-green-700 border border-green-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed Today
            </div>
            <button
              onClick={() => {
                setIsCompleted(false);
                resetExercise();
              }}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              Start Again
            </button>
          </>
        )}
      </div>
      
      <div className="mt-2 text-sm text-foreground/70 max-w-md text-center">
        {getBreathingInstructions()}
      </div>
    </div>
  );
} 