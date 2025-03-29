import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Use the API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Define the AI's system prompt and context for mental wellness
const SYSTEM_PROMPT = `You are a compassionate and thoughtful AI mental wellness assistant named Zen. Your purpose is to provide emotional support, guidance, and evidence-based strategies to help users improve their mental well-being. 

Please adhere to these guidelines:

1. Prioritize empathy and understanding. Always acknowledge the user's feelings first before offering advice.
2. Use evidence-based techniques from positive psychology, CBT, mindfulness, and other research-backed approaches.
3. Speak in a warm, supportive voice that's conversational but professional.
4. If someone expresses serious mental health concerns, gently encourage them to seek professional help while offering support.
5. Suggest practical, actionable steps the user can take to address their concerns.
6. Focus on promoting overall wellness including emotional, social, and physical health.
7. Avoid clinical diagnoses or definitive medical advice.
8. Respect privacy and maintain confidentiality in your responses.
9. If a user expresses thoughts of self-harm or harm to others, emphasize the importance of reaching out to crisis services.

Important: You should never claim to be a human, therapist, or licensed professional. Always make it clear you are an AI assistant designed to provide support but not replace professional care.`;

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

/**
 * Formats chat history for the Gemini API
 */
export function formatChatHistory(messages: Message[]): { role: string; parts: string[] }[] {
  // Gemini doesn't support a system role, so we'll prepend the system prompt as a model message
  const formattedMessages: { role: string; parts: string[] }[] = [
    { role: 'model', parts: [SYSTEM_PROMPT] }
  ];

  messages.forEach(message => {
    formattedMessages.push({
      role: message.sender === 'user' ? 'user' : 'model',
      parts: [message.text]
    });
  });

  return formattedMessages;
}

/**
 * Sends a message to the Gemini API
 */
export async function sendMessageToGemini(
  message: string, 
  chatHistory: { role: string; parts: string[] }[] = []
): Promise<string> {
  if (!apiKey) {
    console.error('Google AI API key is missing');
    return "I'm sorry, I'm having trouble connecting. Please try again later.";
  }

  try {
    console.log("Using API key:", apiKey ? "Present" : "Missing");
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a simplified context with instructions to avoid asterisks
    let prompt = `You are a compassionate mental wellness assistant named Zen. 
                Provide a helpful, empathetic response to the following message.
                
                IMPORTANT FORMATTING RULES:
                - Do not use asterisks (*) in your response
                - Do not use markdown formatting
                - Use simple, clean text
                - Keep responses concise but thoughtful
                - Use clear paragraph breaks for readability
                - When listing items, use numbers (1, 2, 3) instead of bullets
                
                User message: ${message}`;

    console.log("Sending prompt to Gemini API...");
    
    // Generate content with simple prompt approach for Gemini 2.0 Flash
    const result = await model.generateContent(prompt);
    console.log("Got result from API");
    
    // Get the response text and clean it if needed
    let response = result.response.text();
    // Additional cleaning to remove any remaining asterisks
    response = response.replace(/\*/g, '');
    
    return response;
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return "I'm sorry, I'm having trouble processing your request. Please try again later.";
  }
}

/**
 * Saves chat messages to Supabase
 */
export async function saveChatMessage(message: {
  user_id: string;
  chat_session_id: string;
  content: string;
  is_from_user: boolean;
}) {
  try {
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase.from('chat_messages').insert([message]);
    
    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveChatMessage:', error);
    return null;
  }
}

/**
 * Analyzes text for sentiment and emotional content
 * @param text - The text to analyze
 * @returns Analysis of the emotional content
 */
export async function analyzeEmotion(text: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
    Analyze the emotional content of the following text. Identify the primary emotion and intensity.
    
    Text to analyze: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Return the text analysis directly
    return {
      analysis: response,
      text: text
    };
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
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
    
    Format each suggestion as a separate line with a number.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Split the response into lines and filter empty lines
    const suggestions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && /^\d/.test(line))
      .map(line => line.replace(/^\d+[\.\)]\s*/, ''));
    
    return suggestions.length > 0 ? suggestions : 
      ["Take a short walk outside", 
       "Practice deep breathing for 5 minutes", 
       "Write down three things you're grateful for", 
       "Connect with a friend or family member", 
       "Listen to music that improves your mood"];
  } catch (error) {
    console.error('Error getting wellbeing suggestions:', error);
    return [
      "Take a short walk outside", 
      "Practice deep breathing for 5 minutes", 
      "Write down three things you're grateful for", 
      "Connect with a friend or family member", 
      "Listen to music that improves your mood"
    ];
  }
} 