import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../supabase/database.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Interface for a single message
interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

// Interface for user analysis
export interface UserAnalysis {
  id?: string;
  user_id: string;
  mood_trends: {
    [key: string]: number; // e.g., "happy": 0.7, "anxious": 0.3
  };
  common_topics: string[];
  wellness_score: number;
  strengths: string[];
  areas_for_growth: string[];
  recommended_practices: {
    title: string;
    description: string;
    frequency?: string;
  }[];
  last_updated: string;
  created_at?: string;
}

export class UserAnalysisService {
  private supabase;
  
  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }
  
  /**
   * Gets recent messages from a user's chat history
   */
  async getUserChatHistory(userId: string, limit = 100): Promise<Message[]> {
    try {
      // Get all chat sessions for the user
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (sessionsError) throw sessionsError;
      if (!sessions || sessions.length === 0) return [];
      
      const sessionIds = sessions.map(s => s.id);
      
      // Get messages from all sessions
      const { data: messages, error: messagesError } = await this.supabase
        .from('chat_messages')
        .select('*')
        .in('chat_session_id', sessionIds)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (messagesError) throw messagesError;
      if (!messages) return [];
      
      // Transform to Message interface
      return messages.map(m => ({
        sender: m.is_from_user ? 'user' : 'ai',
        text: m.content,
        timestamp: m.created_at
      }));
    } catch (error) {
      console.error('Error getting user chat history:', error);
      return [];
    }
  }
  
  /**
   * Analyzes user messages using AI to generate insights
   */
  async analyzeUserMessages(messages: Message[]): Promise<UserAnalysis | null> {
    if (!messages || messages.length === 0) return null;
    
    try {
      // Filter to just user messages for analysis
      const userMessages = messages.filter(m => m.sender === 'user').map(m => m.text);
      
      if (userMessages.length === 0) return null;
      
      console.log("Analyzing messages:", userMessages);
      
      // Extract keywords from messages to determine mood and topics
      const keywords = {
        positive: ['happy', 'good', 'great', 'excellent', 'joy', 'excited', 'hopeful', 'motivated', 'satisfied', 'peaceful', 
                  'glad', 'wonderful', 'fantastic', 'terrific', 'delighted', 'pleased', 'content', 'cheerful', 'fine', 'better'],
        negative: ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'tired', 'exhausted', 'angry', 'frustrated', 'overwhelmed',
                  'unhappy', 'bad', 'terrible', 'awful', 'miserable', 'upset', 'concerned', 'uncomfortable', 'distressed', 'low'],
        topics: ['work', 'sleep', 'family', 'relationship', 'health', 'exercise', 'meditation', 'mindfulness', 'anxiety', 'stress', 
                'diet', 'hobby', 'social', 'finance', 'mood', 'feeling', 'mental', 'physical', 'emotion', 'energy']
      };
      
      // Calculate sentiment scores
      let positiveScore = 0;
      let negativeScore = 0;
      const topicCounts: Record<string, number> = {};
      const allText = userMessages.join(' ').toLowerCase();
      
      // Improved positive keyword matching with partial matches
      keywords.positive.forEach(word => {
        // Check for exact matches
        const exactRegex = new RegExp(`\\b${word}\\b`, 'gi');
        const exactMatches = allText.match(exactRegex);
        if (exactMatches) {
          positiveScore += exactMatches.length * 2; // Weight exact matches more
          console.log(`Found exact positive word "${word}" ${exactMatches.length} times`);
        }
        
        // Check for partial matches (e.g., "happier" matches "happy")
        const partialRegex = new RegExp(`${word}`, 'gi');
        const allMatches = allText.match(partialRegex) || [];
        const exactMatchesCount = exactMatches ? exactMatches.length : 0;
        const partialMatchesCount = allMatches.length - exactMatchesCount;
        
        if (partialMatchesCount > 0) {
          positiveScore += partialMatchesCount;
          console.log(`Found partial positive word "${word}" ${partialMatchesCount} times`);
        }
      });
      
      // Check for simple positive phrases like "I am happy" or "I'm feeling good"
      const positivePatterns = [
        /\b(?:i am|i'm|i feel|feeling)\s+(?:happy|good|great|fine|better|okay|alright)/gi,
        /\b(?:doing|going)\s+(?:well|good|great|fine|better)/gi
      ];
      
      positivePatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          positiveScore += matches.length * 3; // Weight these phrases highly
          console.log(`Found positive phrase pattern ${matches.length} times: ${matches.join(', ')}`);
        }
      });
      
      // Negative keyword matching
      keywords.negative.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = allText.match(regex);
        if (matches) {
          negativeScore += matches.length;
          console.log(`Found negative word "${word}" ${matches.length} times`);
        }
      });
      
      // Check for negative phrases
      const negativePatterns = [
        /\b(?:i am|i'm|i feel|feeling)\s+(?:sad|bad|depressed|anxious|worried|stressed|tired)/gi,
        /\b(?:not|don't|cant|cannot)\s+(?:feel|feeling|doing|going)\s+(?:well|good|great)/gi
      ];
      
      negativePatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          negativeScore += matches.length * 2;
          console.log(`Found negative phrase pattern ${matches.length} times: ${matches.join(', ')}`);
        }
      });
      
      // Count topic mentions
      const topicsWithSynonyms = {
        'wellness': ['wellness', 'wellbeing', 'well-being', 'health', 'healthy', 'mental health'],
        'work': ['work', 'job', 'career', 'office', 'profession', 'workplace', 'employment'],
        'sleep': ['sleep', 'insomnia', 'rest', 'nap', 'tired', 'bed', 'snooze', 'sleepy'],
        'family': ['family', 'parent', 'child', 'children', 'mom', 'dad', 'mother', 'father', 'sibling', 'brother', 'sister', 'relative'],
        'relationship': ['relationship', 'marriage', 'partner', 'spouse', 'boyfriend', 'girlfriend', 'husband', 'wife', 'dating', 'romance'],
        'exercise': ['exercise', 'workout', 'fitness', 'gym', 'run', 'jog', 'training', 'sport', 'yoga', 'physical activity'],
        'meditation': ['meditation', 'mindfulness', 'zen', 'calm', 'breathing', 'focus', 'relaxation', 'awareness'],
        'anxiety': ['anxiety', 'anxious', 'worry', 'fear', 'nervous', 'apprehension', 'panic', 'stress'],
        'stress': ['stress', 'pressure', 'burden', 'tension', 'overwhelm', 'stressful', 'strain'],
        'diet': ['diet', 'food', 'eating', 'nutrition', 'meal', 'weight', 'healthy eating'],
        'social': ['social', 'friend', 'community', 'people', 'socializing', 'gathering', 'social media', 'interaction'],
        'finance': ['finance', 'money', 'financial', 'budget', 'spending', 'income', 'debt', 'savings', 'investment'],
        'happiness': ['happiness', 'happy', 'joy', 'content', 'pleased', 'satisfied', 'cheerful', 'bliss'],
        'sadness': ['sadness', 'sad', 'unhappy', 'depressed', 'depression', 'down', 'blue', 'gloomy'],
        'feeling': ['feeling', 'feel', 'emotion', 'mood', 'emotional', 'state of mind', 'sentiment']
      };
      
      // Enhanced topic detection
      Object.entries(topicsWithSynonyms).forEach(([topic, synonyms]) => {
        let count = 0;
        
        synonyms.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = allText.match(regex);
          if (matches && matches.length > 0) {
            count += matches.length;
          }
        });
        
        if (count > 0) {
          topicCounts[topic] = count;
          console.log(`Detected topic ${topic} with count ${count}`);
        }
      });
      
      // Check for phrases like "I want to talk about..."
      const talkAboutPattern = /\b(?:i want to|let's|i'd like to|can we) (?:talk|chat|discuss) about\s+(\w+)\b/gi;
      let match;
      while ((match = talkAboutPattern.exec(allText)) !== null) {
        const topic = match[1].toLowerCase();
        // Find the most similar topic in our list
        const matchedTopic = Object.keys(topicsWithSynonyms).find(t => 
          topicsWithSynonyms[t as keyof typeof topicsWithSynonyms].some(syn => 
            syn.includes(topic) || topic.includes(syn)
          )
        );
        
        if (matchedTopic) {
          topicCounts[matchedTopic] = (topicCounts[matchedTopic] || 0) + 3; // Higher weight
          console.log(`Found explicit topic mention: ${topic} -> ${matchedTopic}`);
        } else {
          // Add as new topic if not matched
          topicCounts[topic] = (topicCounts[topic] || 0) + 2;
          console.log(`Found new topic mention: ${topic}`);
        }
      }
      
      // If no topics detected, look for general topics from sentences
      if (Object.keys(topicCounts).length === 0) {
        // Basic sentence extraction
        const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        sentences.forEach(sentence => {
          // Try to extract keywords from longer sentences
          const words = sentence.toLowerCase().split(/\s+/)
            .filter(word => word.length > 3) // Only consider longer words
            .filter(word => !['this', 'that', 'these', 'those', 'with', 'from', 'about', 'have', 'would'].includes(word));
          
          if (words.length > 0) {
            // Use the first meaningful word as potential topic
            const potentialTopic = words[0];
            topicCounts[potentialTopic] = (topicCounts[potentialTopic] || 0) + 1;
          }
        });
      }
      
      // Generate topic insights
      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic);
      
      // Calculate wellness score (1-10)
      // Default to average if no sentiment detected
      let wellnessScore = 5;
      const totalSentiment = positiveScore + negativeScore;
      
      console.log(`Sentiment scores - Positive: ${positiveScore}, Negative: ${negativeScore}, Total: ${totalSentiment}`);
      
      if (totalSentiment > 0) {
        // Calculate ratio (0-1) of positive to total sentiment
        const positiveRatio = positiveScore / totalSentiment;
        console.log(`Positive ratio: ${positiveRatio}`);
        
        // Scale to 1-10 range with a slight center bias
        wellnessScore = Math.max(1, Math.min(10, Math.round(positiveRatio * 9 + 1)));
      } else if (positiveScore > 0) {
        // If we only have positive indicators and no negative, score should be high
        wellnessScore = Math.min(10, 7 + Math.min(positiveScore, 3));
      }
      
      console.log(`Calculated wellness score: ${wellnessScore}`);
      
      // Generate mood trends
      const moodTrends: Record<string, number> = {};
      
      // Check for specific emotions in the text
      const emotions = [
        { name: 'calm', keywords: ['calm', 'peaceful', 'relaxed', 'serene'], score: 0 },
        { name: 'anxious', keywords: ['anxious', 'worried', 'nervous', 'fear'], score: 0 },
        { name: 'happy', keywords: ['happy', 'joy', 'pleased', 'delighted', 'great', 'good', 'wonderful', 'excellent', 'amazing', 'fantastic'], score: 0 },
        { name: 'sad', keywords: ['sad', 'down', 'unhappy', 'depressed'], score: 0 },
        { name: 'energetic', keywords: ['energy', 'active', 'motivated', 'excited'], score: 0 },
        { name: 'tired', keywords: ['tired', 'exhausted', 'fatigue', 'drained'], score: 0 }
      ];
      
      // First check for direct emotion statements like "I am happy"
      const happyPhrases = [
        /\bi(?:'m| am) happy\b/i,
        /\bi(?:'m| am) feeling (?:good|great|wonderful|fantastic|excellent|amazing)/i,
        /\bi feel (?:good|great|wonderful|fantastic|excellent|amazing|happy)/i,
        /\bi(?:'m| am) having a (?:good|great|wonderful|fantastic) day/i,
        /\bfeeling (?:good|great|happy|positive)/i
      ];
      
      happyPhrases.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          // Found direct happy statement
          emotions.find(e => e.name === 'happy')!.score += matches.length * 5;
          console.log(`Found direct happy statement: ${matches.join(', ')}`);
        }
      });
      
      emotions.forEach(emotion => {
        emotion.keywords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = allText.match(regex);
          if (matches) {
            emotion.score += matches.length;
            console.log(`Found emotion keyword "${word}" for ${emotion.name}: ${matches.length} times`);
          }
        });
        
        if (emotion.score > 0) {
          // Normalize to 0-1 range with a max of 5 occurrences considered "full strength"
          moodTrends[emotion.name] = Math.min(1, emotion.score / 5);
        }
      });
      
      // For happy specifically, check for positive sentiment
      if (positiveScore > negativeScore * 2) {
        if (!moodTrends['happy'] || moodTrends['happy'] < 0.5) {
          moodTrends['happy'] = Math.min(1, positiveScore / 10);
          console.log(`Added happy mood based on positive sentiment: ${moodTrends['happy']}`);
        }
      }
      
      console.log("Detected mood trends:", moodTrends);
      
      // If no moods detected, derive from wellness score
      if (Object.keys(moodTrends).length === 0) {
        if (wellnessScore >= 7) {
          moodTrends['happy'] = (wellnessScore - 5) / 5;
          moodTrends['calm'] = 0.6;
          console.log("No moods detected, adding happy and calm based on wellness score");
        } else if (wellnessScore <= 4) {
          moodTrends['sad'] = (6 - wellnessScore) / 5;
          moodTrends['anxious'] = 0.5;
          console.log("No moods detected, adding sad and anxious based on wellness score");
        } else {
          moodTrends['neutral'] = 0.7;
          moodTrends['calm'] = 0.4;
          console.log("No moods detected, adding neutral and calm based on wellness score");
        }
      }
      
      // Generate strengths and areas for growth based on sentiment analysis
      const strengths: string[] = [];
      const areasForGrowth: string[] = [];
      
      // Sample strength/growth area templates
      const strengthTemplates = [
        "Self-awareness in discussing %s",
        "Open communication about %s",
        "Positive approach to %s",
        "Seeking support with %s",
        "Consistency in %s practices"
      ];
      
      const growthTemplates = [
        "Managing %s more effectively",
        "Developing better %s habits",
        "Finding balance with %s",
        "Building resilience against %s",
        "Creating healthier boundaries around %s"
      ];
      
      // Generate 2-3 strengths based on positive topics
      const positiveTopics = sortedTopics.filter(topic => {
        const topicText = userMessages.filter(msg => 
          msg.toLowerCase().includes(topic)
        ).join(' ');
        
        // Check if this topic appears more with positive than negative words
        let posCount = 0, negCount = 0;
        keywords.positive.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = topicText.match(regex);
          if (matches) posCount += matches.length;
        });
        
        keywords.negative.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = topicText.match(regex);
          if (matches) negCount += matches.length;
        });
        
        return posCount > negCount;
      });
      
      // Generate 2-3 growth areas based on negative topics
      const negativeTopics = sortedTopics.filter(topic => {
        const topicText = userMessages.filter(msg => 
          msg.toLowerCase().includes(topic)
        ).join(' ');
        
        let posCount = 0, negCount = 0;
        keywords.positive.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = topicText.match(regex);
          if (matches) posCount += matches.length;
        });
        
        keywords.negative.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = topicText.match(regex);
          if (matches) negCount += matches.length;
        });
        
        return negCount > posCount;
      });
      
      // Generate strengths
      for (let i = 0; i < Math.min(3, positiveTopics.length); i++) {
        const template = strengthTemplates[Math.floor(Math.random() * strengthTemplates.length)];
        strengths.push(template.replace('%s', positiveTopics[i]));
      }
      
      // Default strengths if none detected
      if (strengths.length === 0) {
        strengths.push("Self-awareness in seeking support");
        strengths.push("Openness to personal growth");
      }
      
      // Generate growth areas
      for (let i = 0; i < Math.min(3, negativeTopics.length); i++) {
        const template = growthTemplates[Math.floor(Math.random() * growthTemplates.length)];
        areasForGrowth.push(template.replace('%s', negativeTopics[i]));
      }
      
      // Default growth areas if none detected
      if (areasForGrowth.length === 0) {
        areasForGrowth.push("Building consistent wellness routines");
        areasForGrowth.push("Managing daily stressors more effectively");
      }
      
      // Generate recommended practices
      const recommendedPractices = [];
      
      // Common wellness practices with their applicable conditions
      const practiceLibrary = [
        {
          title: "Daily Mindfulness Meditation",
          description: "Start with 5-10 minutes of mindfulness meditation each day to reduce stress and improve focus.",
          frequency: "Daily",
          conditions: ["stress", "anxiety", "focus", "general"]
        },
        {
          title: "Breathing Exercises",
          description: "Practice deep breathing techniques like 4-7-8 breathing when feeling overwhelmed or anxious.",
          frequency: "As needed",
          conditions: ["anxiety", "stress", "overwhelm", "general"]
        },
        {
          title: "Gratitude Journaling",
          description: "Write down three things you're grateful for each day to improve mood and perspective.",
          frequency: "Daily",
          conditions: ["depression", "negative outlook", "general"]
        },
        {
          title: "Digital Detox",
          description: "Take regular breaks from screens and social media to reduce stress and improve sleep.",
          frequency: "Weekly",
          conditions: ["sleep", "stress", "technology", "general"]
        },
        {
          title: "Progressive Muscle Relaxation",
          description: "Tense and release muscle groups to reduce physical tension and promote relaxation.",
          frequency: "Daily",
          conditions: ["tension", "anxiety", "stress", "general"]
        },
        {
          title: "Sleep Hygiene Routine",
          description: "Create a consistent bedtime routine and environment to improve sleep quality.",
          frequency: "Daily",
          conditions: ["sleep", "fatigue", "general"]
        },
        {
          title: "Weekly Physical Activity",
          description: "Engage in moderate exercise for at least 150 minutes per week to boost mood and energy.",
          frequency: "Weekly",
          conditions: ["energy", "mood", "general"]
        },
        {
          title: "Social Connection Time",
          description: "Schedule regular time to connect with supportive friends or family members.",
          frequency: "Weekly",
          conditions: ["isolation", "depression", "general"]
        }
      ];
      
      // Select practices based on detected issues
      const detectedIssues = new Set<string>();
      
      // Add general for everyone
      detectedIssues.add("general");
      
      // Add specific issues based on mood trends and topics
      if (moodTrends.anxious && moodTrends.anxious > 0.3) detectedIssues.add("anxiety");
      if (moodTrends.sad && moodTrends.sad > 0.3) detectedIssues.add("depression");
      if (moodTrends.tired && moodTrends.tired > 0.3) detectedIssues.add("fatigue");
      
      sortedTopics.forEach(topic => {
        if (topic === "sleep") detectedIssues.add("sleep");
        if (topic === "stress") detectedIssues.add("stress");
        if (topic === "anxiety") detectedIssues.add("anxiety");
        if (topic === "social" || topic === "relationship") detectedIssues.add("isolation");
        if (topic === "work") detectedIssues.add("stress");
      });
      
      // Select relevant practices (up to 3)
      const relevantPractices = practiceLibrary.filter(practice => 
        practice.conditions.some(condition => detectedIssues.has(condition))
      );
      
      // Random selection if we have more than 3 relevant practices
      const shuffled = relevantPractices.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      recommendedPractices.push(...selected);
      
      return {
        user_id: '',
        mood_trends: moodTrends,
        common_topics: sortedTopics.length > 0 ? sortedTopics : ["mental wellness", "self-care"],
        wellness_score: wellnessScore,
        strengths,
        areas_for_growth: areasForGrowth,
        recommended_practices: recommendedPractices.map(({title, description, frequency}) => ({
          title,
          description,
          frequency
        })),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing user messages:', error);
      return null;
    }
  }
  
  /**
   * Gets or creates a user analysis record
   */
  async getUserAnalysis(userId: string): Promise<UserAnalysis | null> {
    try {
      // Check if analysis already exists
      const { data, error } = await this.supabase
        .from('user_analysis')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If error is not "no rows returned", throw it
        if (error.code !== 'PGRST116') {
          console.error('Supabase error:', error);
          throw error;
        }
        
        // No existing analysis, create a default one
        const defaultAnalysis: UserAnalysis = {
          user_id: userId,
          mood_trends: {
            "calm": 0.7,
            "focused": 0.5
          },
          common_topics: ["mental wellness", "self-improvement"],
          wellness_score: 5, // Default middle score
          strengths: ["Seeking support", "Self-awareness"],
          areas_for_growth: ["Regular practice", "Stress management"],
          recommended_practices: [
            {
              title: "Daily Mindfulness",
              description: "Start with 5 minutes of mindfulness meditation each day.",
              frequency: "Daily"
            },
            {
              title: "Deep Breathing",
              description: "Practice deep breathing when feeling stressed.",
              frequency: "As needed"
            }
          ],
          last_updated: new Date().toISOString()
        };
        
        // Safety check if user_analysis table exists
        try {
          const { data: newData, error: insertError } = await this.supabase
            .from('user_analysis')
            .insert(defaultAnalysis)
            .select()
            .single();
          
          if (insertError) {
            console.error('Insert error:', insertError);
            // If table doesn't exist or other error, just return the default
            return defaultAnalysis;
          }
          
          return newData as UserAnalysis;
        } catch (insertErr) {
          console.error('Insert operation failed:', insertErr);
          // Return default analysis if insert fails
          return defaultAnalysis;
        }
      }
      
      return data as UserAnalysis;
    } catch (error) {
      console.error('Error getting user analysis:', error);
      
      // Return default analysis on error
      return {
        user_id: userId,
        mood_trends: {},
        common_topics: [],
        wellness_score: 5,
        strengths: [],
        areas_for_growth: [],
        recommended_practices: [
          {
            title: "Daily Mindfulness",
            description: "Start with 5 minutes of mindfulness meditation each day.",
            frequency: "Daily"
          }
        ],
        last_updated: new Date().toISOString()
      };
    }
  }
  
  /**
   * Updates a user's analysis
   */
  async updateUserAnalysis(userId: string, analysis: Partial<UserAnalysis>): Promise<UserAnalysis | null> {
    try {
      analysis.last_updated = new Date().toISOString();
      
      // Ensure wellness_score is a valid number
      if (analysis.wellness_score !== undefined) {
        analysis.wellness_score = Math.min(10, Math.max(1, Math.round(analysis.wellness_score)));
      }
      
      // Check if record exists first
      const { data: existingRecord, error: checkError } = await this.supabase
        .from('user_analysis')
        .select('id')
        .eq('user_id', userId);
      
      if (checkError) {
        console.error('Error checking if user analysis exists:', checkError);
        throw checkError;
      }
      
      // Create a copy of the analysis to avoid mutation problems
      const analysisCopy = { ...analysis };
      
      if (!existingRecord || existingRecord.length === 0) {
        // Record doesn't exist, create it
        console.log('Creating new user analysis record');
        const { data, error } = await this.supabase
          .from('user_analysis')
          .insert({
            ...analysisCopy,
            user_id: userId
          })
          .select();
        
        if (error) {
          console.error('Error inserting user analysis:', error);
          throw error;
        }
        
        return data && data.length > 0 ? data[0] as UserAnalysis : null;
      }
      
      // Record exists, update it
      console.log('Updating existing user analysis record');
      const { data, error } = await this.supabase
        .from('user_analysis')
        .update(analysisCopy)
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error('Error updating user analysis:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] as UserAnalysis : null;
    } catch (error) {
      console.error('Error updating user analysis:', error);
      
      // Return the original analysis as fallback
      return {
        user_id: userId,
        mood_trends: analysis.mood_trends || {},
        common_topics: analysis.common_topics || [],
        wellness_score: analysis.wellness_score || 5,
        strengths: analysis.strengths || [],
        areas_for_growth: analysis.areas_for_growth || [],
        recommended_practices: analysis.recommended_practices || [{
          title: "Daily Mindfulness",
          description: "Start with 5 minutes of mindfulness meditation each day.",
          frequency: "Daily"
        }],
        last_updated: new Date().toISOString()
      };
    }
  }
  
  /**
   * Gets a user's wellness activities
   */
  async getUserActivities(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  }
  
  /**
   * Calculate activity contribution to wellness score
   */
  calculateActivityScore(activities: any[]): number {
    // If no activities, no contribution
    if (!activities || activities.length === 0) return 0;
    
    try {
      // Calculate activity score based on completions and streaks
      let activityScore = 0;
      
      // Count completed activities
      const completedCount = activities.filter(a => a.completed).length;
      
      // Calculate total streak days safely
      const totalStreak = activities.reduce((sum, activity) => {
        const streak = activity.streak || 0;
        // Ensure we're adding a valid number
        return sum + (isNaN(streak) ? 0 : streak);
      }, 0);
      
      // Get highest streak safely
      const highestStreak = activities.reduce((max, activity) => {
        const streak = activity.streak || 0;
        return Math.max(max, isNaN(streak) ? 0 : streak);
      }, 0);
      
      // Award points for completions (max 1.5 points)
      activityScore += Math.min(1.5, completedCount * 0.3);
      
      // Award points for total streaks (max 1 point)
      activityScore += Math.min(1, totalStreak * 0.05);
      
      // Award bonus for high streaks (max 0.5 points)
      activityScore += Math.min(0.5, highestStreak * 0.1);
      
      // Award points for activity variety (max 1 point)
      const uniqueActivitiesCompleted = new Set(
        activities.filter(a => a.completed && a.title).map(a => a.title)
      ).size;
      activityScore += Math.min(1, uniqueActivitiesCompleted * 0.2);
      
      // Cap the total contribution at 3 points
      const finalScore = Math.min(3, activityScore);
      
      console.log(`Activity score contribution: ${finalScore.toFixed(2)} (${completedCount} completed, ${totalStreak} total streak days, ${highestStreak} highest streak, ${uniqueActivitiesCompleted} unique activities)`);
      
      return finalScore;
    } catch (err) {
      console.error('Error calculating activity score:', err);
      // Return a safe default value
      return 0;
    }
  }
  
  /**
   * Analyzes user and updates their profile
   */
  async analyzeAndUpdateUserProfile(userId: string): Promise<UserAnalysis | null> {
    try {
      // Get user messages
      const messages = await this.getUserChatHistory(userId);
      
      // Get user activities
      const activities = await this.getUserActivities(userId);
      console.log(`Found ${activities.length} activities for user ${userId}`);
      
      // Get existing analysis
      let existingAnalysis = await this.getUserAnalysis(userId);
      
      if (!existingAnalysis) {
        // If no existing analysis, create a default one
        existingAnalysis = {
          user_id: userId,
          mood_trends: {},
          common_topics: [],
          wellness_score: 5,
          strengths: [],
          areas_for_growth: [],
          recommended_practices: [
            {
              title: "Daily Mindfulness",
              description: "Start with 5 minutes of mindfulness meditation each day.",
              frequency: "Daily"
            }
          ],
          last_updated: new Date().toISOString()
        };
      }
      
      // Calculate activity score contribution
      const activityScore = this.calculateActivityScore(activities);
      console.log(`Activity score contribution for user ${userId}: ${activityScore}`);
      
      if (!messages || messages.length === 0) {
        // Even with no messages, calculate score based on activities
        if (activities.length > 0) {
          // If we have activities but no messages, use a base score plus activity contribution
          existingAnalysis.wellness_score = Math.min(10, Math.max(1, 5 + activityScore));
          existingAnalysis.last_updated = new Date().toISOString();
          console.log(`Updating wellness score based on activities only: ${existingAnalysis.wellness_score}`);
          return await this.updateUserAnalysis(userId, existingAnalysis);
        }
        
        // No messages or activities, just return the default or existing analysis
        return existingAnalysis;
      }
      
      // Analyze messages
      const analysisResults = await this.analyzeUserMessages(messages);
      
      if (!analysisResults) {
        // If analysis fails but we have activities, adjust existing score
        if (activities.length > 0) {
          existingAnalysis.wellness_score = Math.min(10, Math.max(1, existingAnalysis.wellness_score + activityScore));
          existingAnalysis.last_updated = new Date().toISOString();
          console.log(`Updating existing wellness score with activities: ${existingAnalysis.wellness_score}`);
          return await this.updateUserAnalysis(userId, existingAnalysis);
        }
        return existingAnalysis;
      }
      
      // Start with message-based score
      let wellnessScore = analysisResults.wellness_score;
      
      // Include activity data in wellness score calculation
      if (activities.length > 0) {
        // Base the new score on the sentiment analysis but boost it with activity data
        // Limit the maximum contribution to ensure balance
        wellnessScore = Math.min(10, Math.max(1, wellnessScore + activityScore));
        
        // Update the wellness score in the results
        analysisResults.wellness_score = wellnessScore;
        
        console.log(`Final wellness score including activities: ${wellnessScore}`);
      }
      
      // Merge with existing analysis
      const updatedAnalysis = {
        ...analysisResults,
        user_id: userId,
        last_updated: new Date().toISOString()
      };
      
      // Update or create the record
      return await this.updateUserAnalysis(userId, updatedAnalysis);
    } catch (error) {
      console.error('Error analyzing and updating user profile:', error);
      // Return default on error
      return {
        user_id: userId,
        mood_trends: {},
        common_topics: [],
        wellness_score: 5,
        strengths: [],
        areas_for_growth: [],
        recommended_practices: [
          {
            title: "Daily Mindfulness",
            description: "Start with 5 minutes of mindfulness meditation each day.",
            frequency: "Daily"
          }
        ],
        last_updated: new Date().toISOString()
      };
    }
  }
} 