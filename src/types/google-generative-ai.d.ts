declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): GenerativeModel;
  }

  export class GenerativeModel {
    generateContent(prompt: string): Promise<{
      response: {
        text(): string;
      };
    }>;
  }
}