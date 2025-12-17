// backend/config/langchain.js
// Minimal LangChain / LLM setup for future agent logic.
// For this prototype phase, the backend must run even without OpenAI key.[web:28][web:34][web:37]

let llmClient = null;

/**
 * Get a basic LLM client (mock if no API key set).
 * The real agents in later phases can import this.
 */
export const getLLMClient = () => {
  if (llmClient) return llmClient;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Simple mock that echoes user messages; enough for offline demo
    console.warn(
      '⚠️ OPENAI_API_KEY not set. Using mock LLM client for responses.'
    );

    llmClient = {
      async generateResponse(prompt) {
        return `Mock response based on: ${prompt.slice(0, 120)}...`;
      }
    };

    return llmClient;
  }

  // If you want real LLM integration later, install LangChain + OpenAI:
  // npm install langchain @langchain/openai @langchain/core
  // And uncomment this code:
  /*
  import { OpenAI } from '@langchain/openai';

  llmClient = new OpenAI({
    apiKey,
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  });
  */

  // For now, keep implementation minimal but non-breaking.
  llmClient = {
    async generateResponse(prompt) {
      // Placeholder that clearly indicates real LLM path
      return `LLM stub: received prompt of length ${prompt.length}`;
    }
  };

  return llmClient;
};
