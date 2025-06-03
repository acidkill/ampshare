import { genkit } from 'genkit';
import type { ActionContext } from 'genkit';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Create the Gemini model instance
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Create base genkit instance with required context
const genkitInstance = genkit({
  context: {} as ActionContext
});

// Add Gemini AI integration
const withGemini = {
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

// Export the enhanced genkit instance with Gemini integration
export const ai = withGemini;
