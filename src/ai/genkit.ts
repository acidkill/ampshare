import { genkit } from 'genkit';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Create the Gemini model instance
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Create base genkit instance with empty config
const genkitInstance = genkit({});

// Add Gemini integration capabilities
const enhancedGenkit = {
  ...genkitInstance,
  async runLLM(prompt: string) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
};

// Export the enhanced genkit instance
export const ai = enhancedGenkit;
