import React, { useState, useEffect } from 'react';
import { UserAnalysis } from '../../lib/services/userAnalysisService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../lib/supabase/database.types';
import { UserAnalysisService } from '../../lib/services/userAnalysisService';
import { User } from '@supabase/supabase-js';

interface UserWellnessReportProps {
  user: User | null;
  className?: string;
}

export default function UserWellnessReport({ user, className = '' }: UserWellnessReportProps) {
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  // Auto-refresh timer reference
  const autoRefreshInterval = 180000; // 3 minutes
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Load and analyze user data
  const fetchAndAnalyzeData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Generate fresh analysis
      const service = new UserAnalysisService();
      console.log('Analyzing user profile for wellness report...');
      
      let userAnalysis: UserAnalysis | null = null;
      
      try {
        userAnalysis = await service.analyzeAndUpdateUserProfile(user.id);
        console.log('Analysis completed successfully:', userAnalysis?.wellness_score);
      } catch (analysisError) {
        console.error('Error in analysis:', analysisError);
        // Try to get existing analysis without updating
        try {
          userAnalysis = await service.getUserAnalysis(user.id);
          console.log('Retrieved existing analysis as fallback');
        } catch (getError) {
          console.error('Could not retrieve existing analysis:', getError);
        }
      }
      
      if (userAnalysis) {
        setAnalysis(userAnalysis);
      } else {
        // If null is returned, use a default analysis
        const defaultAnalysis = {
          user_id: user.id,
          mood_trends: {},
          common_topics: [],
          wellness_score: 5,
          strengths: [],
          areas_for_growth: [],
          recommended_practices: [{
            title: "Daily Mindfulness",
            description: "Start with 5 minutes of mindfulness meditation each day.",
            frequency: "Daily"
          }],
          last_updated: new Date().toISOString()
        };
        
        setAnalysis(defaultAnalysis);
        // Try to save this default analysis to avoid future errors
        try {
          await service.updateUserAnalysis(user.id, defaultAnalysis);
        } catch (saveError) {
          console.error('Could not save default analysis:', saveError);
        }
      }
    } catch (e) {
      console.error('Error loading user analysis:', e);
      // Create a fallback analysis
      setAnalysis({
        user_id: user.id,
        mood_trends: {},
        common_topics: [],
        wellness_score: 5,
        strengths: [],
        areas_for_growth: [],
        recommended_practices: [{
          title: "Daily Mindfulness",
          description: "Start with 5 minutes of mindfulness meditation each day.",
          frequency: "Daily"
        }],
        last_updated: new Date().toISOString()
      });
      setError('Could not load your wellness report, showing default recommendations.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load and periodic refresh
  useEffect(() => {
    fetchAndAnalyzeData();
    
    // Set up auto-refresh
    const intervalId = setInterval(() => {
      if (user) {
        // Check if data is stale (more than 15 minutes old)
        if (analysis) {
          const lastUpdated = new Date(analysis.last_updated).getTime();
          const now = new Date().getTime();
          const fifteenMinutes = 15 * 60 * 1000;
          
          if (now - lastUpdated > fifteenMinutes) {
            fetchAndAnalyzeData();
          }
        } else {
          fetchAndAnalyzeData();
        }
      }
    }, autoRefreshInterval);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Generate new analysis
  const generateNewAnalysis = async () => {
    if (!user) return;
    
    try {
      setGenerating(true);
      setError(null);
      await fetchAndAnalyzeData();
    } catch (e) {
      console.error('Error generating user analysis:', e);
      setError('Failed to update your wellness report. Try again later.');
    } finally {
      setGenerating(false);
    }
  };
  
  if (loading && !analysis) {
    return (
      <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Wellness Report</h2>
        <p className="text-foreground/70 mb-4">
          Your personalized wellness report will appear here once you have some chat history.
        </p>
        <p className="text-foreground/70 mb-4">
          Try having a conversation with the AI assistant to get insights about your mental wellbeing.
        </p>
      </div>
    );
  }
  
  // Calculate a color based on wellness score (1-10)
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-blue-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get wellness label
  const getWellnessLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Above Average";
    if (score === 5) return "Average";
    if (score >= 4) return "Below Average";
    if (score >= 3) return "Needs Attention";
    if (score >= 2) return "Concerning";
    return "Needs Immediate Support";
  };
  
  return (
    <div className={`bg-background rounded-lg shadow-md p-6 ${className} ${loading ? 'opacity-70' : ''}`}>
      {error && (
        <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Wellness Report</h2>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-foreground/60">
            Last updated: {formatDate(analysis.last_updated)}
          </p>
          <button
            onClick={generateNewAnalysis}
            disabled={generating || loading}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {generating || loading ? (
              <>
                <span className="animate-spin h-3 w-3 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                Updating...
              </>
            ) : (
              'Update Report'
            )}
          </button>
        </div>
      </div>
      
      {/* Wellness Score */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Wellness Score</h3>
        <div className="flex items-center">
          <div className={`text-4xl font-bold ${getScoreColor(analysis.wellness_score)}`}>
            {analysis.wellness_score}
          </div>
          <div className="ml-3 text-foreground/70">
            <p className="text-sm">out of 10</p>
            <p className={`text-sm ${getScoreColor(analysis.wellness_score)}`}>
              {getWellnessLabel(analysis.wellness_score)}
            </p>
          </div>
        </div>
        <p className="text-xs text-foreground/70 mt-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Score includes your completed wellness activities and streaks
        </p>
      </div>
      
      {/* Mood Trends */}
      {Object.keys(analysis.mood_trends).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Mood Trends</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(analysis.mood_trends).map(([mood, intensity]) => (
              <div key={mood} className="bg-primary/5 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="capitalize">{mood}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.floor(Number(intensity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Common Topics */}
      {analysis.common_topics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Common Topics</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.common_topics.map((topic, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Strengths & Areas for Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Your Strengths</h3>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Areas for Growth */}
        {analysis.areas_for_growth.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Areas for Growth</h3>
            <ul className="space-y-2">
              {analysis.areas_for_growth.map((area, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Recommended Practices */}
      {analysis.recommended_practices.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Recommended Practices</h3>
          <div className="space-y-4">
            {analysis.recommended_practices.map((practice, index) => (
              <div key={index} className="bg-primary/5 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{practice.title}</h4>
                  {practice.frequency && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {practice.frequency}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 mt-1">
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-foreground/60 mt-6">
        This analysis is based on your chat interactions and is intended to provide general insights.
        If you're experiencing serious mental health concerns, please consult a healthcare professional.
      </p>
    </div>
  );
} 