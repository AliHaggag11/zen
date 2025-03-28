import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with your API key
// In production, this would be stored in an environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'your-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

// Mental health assistant instruction prompt
const SYSTEM_INSTRUCTION = `You are a compassionate mental health assistant named Zen. 
Your purpose is to provide emotional support, practical advice, and resources for mental wellbeing.

Guidelines:
- Respond with empathy and understanding
- Avoid making medical diagnoses
- Suggest healthy coping strategies when appropriate
- Recognize signs of serious distress and suggest professional help when needed
- Maintain a calm, supportive tone
- Focus on validating emotions and providing constructive guidance
- Always maintain user privacy and confidentiality

If the user is in crisis or expresses thoughts of self-harm, direct them to emergency services 
and crisis resources.`;

// Model configuration
const MODEL_NAME = 'gemini-pro';

// Define types for chat message history
interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

/**
 * Sends a message to the Gemini AI and returns the response
 * @param message - The user's message
 * @param chatHistory - Optional array of previous chat messages
 * @returns The AI response
 */
export async function sendMessageToGemini(
  message: string, 
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Add system instruction as first message if there's no history
    let history = [...chatHistory];
    if (history.length === 0) {
      // We'll add the system instruction as content from the model
      const initialMessage: ChatMessage = {
        role: 'model',
        parts: SYSTEM_INSTRUCTION
      };
      history = [initialMessage];
    }
    
    // Start a chat session
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Send message to Gemini API
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    // Return the text response
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}

/**
 * Converts our app's chat format to Gemini API format
 * @param history - Array of chat messages in app format
 * @returns Array of messages in Gemini API format
 */
export function formatChatHistory(
  history: Array<{ sender: 'user' | 'ai'; text: string }>
): ChatMessage[] {
  return history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: msg.text
  }));
}

/**
 * Analyzes text for sentiment and emotional content
 * @param text - The text to analyze
 * @returns Analysis of the emotional content
 */
export async function analyzeEmotion(text: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
    Analyze the emotional content of the following text. Identify:
    1. Primary emotion (e.g., happiness, sadness, anger, fear, etc.)
    2. Emotional intensity (scale of 1-5)
    3. Key emotional triggers mentioned
    
    Return the analysis as a JSON object with the following structure:
    {
      "primaryEmotion": string,
      "intensity": number,
      "triggers": string[],
      "summary": string
    }
    
    Text to analyze: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse emotion analysis results');
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    throw new Error('Failed to analyze emotional content');
  }
}

/**
 * Gets personalized mental well-being suggestions
 * @param context - User context and preferences
 * @returns Personalized suggestions
 */
export async function getWellbeingSuggestions(context: {
  recentMoods?: number[],
  interests?: string[],
  preferredActivities?: string[]
}): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    let moodContext = '';
    if (context.recentMoods && context.recentMoods.length > 0) {
      const avgMood = context.recentMoods.reduce((sum, m) => sum + m, 0) / context.recentMoods.length;
      moodContext = `Recent mood average: ${avgMood.toFixed(1)} out of 5. `;
    }
    
    let interestsContext = '';
    if (context.interests && context.interests.length > 0) {
      interestsContext = `User interests: ${context.interests.join(', ')}. `;
    }
    
    let activitiesContext = '';
    if (context.preferredActivities && context.preferredActivities.length > 0) {
      activitiesContext = `Preferred activities: ${context.preferredActivities.join(', ')}. `;
    }
    
    const prompt = `
    Based on the following user context, provide 5 personalized suggestions for improving mental well-being:
    ${moodContext}${interestsContext}${activitiesContext}
    
    Provide the suggestions as a JSON array of strings.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestionsText = response.text();
    
    // Extract the JSON array from the response
    const jsonMatch = suggestionsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse wellbeing suggestions');
  } catch (error) {
    console.error('Error getting wellbeing suggestions:', error);
    throw new Error('Failed to generate wellbeing suggestions');
  }
} 