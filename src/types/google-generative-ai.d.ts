declare module '@google/generative-ai' {
  // A simplified Part interface, primarily for text-based inputs.
  // Can be expanded later if inlineData (for images, etc.) or other fields are needed.
  export interface Part {
    text: string;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): GenerativeModel;
  }

  export class GenerativeModel {
    // Updated to allow more flexible prompt types.
    generateContent(prompt: string | Part | Array<string | Part>): Promise<{
      response: {
        text(): string;
      };
    }>;
  }
}
