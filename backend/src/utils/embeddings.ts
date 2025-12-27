/**
 * OpenAI embeddings wrapper
 * 
 * Generates text embeddings for semantic search
 */

import 'dotenv/config';
import OpenAI from 'openai';

// Lazy initialization - only validate when needed (allows tests to run without API key)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

/**
 * Generate embedding for text query
 * @param text - Input text to embed
 * @returns Embedding result with 1536-dim vector
 * @throws Error if text is empty or API fails
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // Clean and validate input
  const cleanedText = text.trim().replace(/\s+/g, ' ');
  
  if (!cleanedText) {
    throw new Error('Text cannot be empty');
  }
  
  const openai = getOpenAIClient(); // Get client lazily
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanedText,
      encoding_format: 'float',
    });
    
    if (!response.data[0]?.embedding) {
      throw new Error('No embedding returned from OpenAI');
    }
    
    return {
      embedding: response.data[0].embedding,
      model: response.model,
      tokens: response.usage.prompt_tokens,
    };
  } catch (error: unknown) {
    // Add context to error (E-4)
    const err = error as Error;
    throw new Error(`Failed to generate embedding: ${err.message}`, { cause: error });
  }
}
