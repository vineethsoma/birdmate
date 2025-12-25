/**
 * OpenAI embeddings wrapper
 * 
 * Generates text embeddings for semantic search
 */

import 'dotenv/config';
import OpenAI from 'openai';

// Validate API key on startup (S-2)
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanedText,
      encoding_format: 'float',
    });
    
    return {
      embedding: response.data[0].embedding,
      model: response.model,
      tokens: response.usage.prompt_tokens,
    };
  } catch (error: any) {
    // Add context to error (E-4)
    throw new Error(`Failed to generate embedding: ${error.message}`, { cause: error });
  }
}
