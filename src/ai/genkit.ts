import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

// Create the Gemini model instance
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * AI helper that provides access to the LLM capabilities
 */
export const ai = {
  /**
   * Run a prompt through the language model
   * @param prompt The prompt to process
   * @returns The generated text response
   */
  async runLLM(prompt: string): Promise<string> {
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
