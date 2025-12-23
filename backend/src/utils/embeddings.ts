import OpenAI from 'openai';
import { logger } from './logging.js';

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const startTime = Date.now();
    const client = getOpenAIClient();

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    const embedding = response.data[0].embedding;
    const duration = Date.now() - startTime;

    logger.debug('Generated embedding', {
      model: EMBEDDING_MODEL,
      textLength: text.length,
      embeddingDimensions: embedding.length,
      durationMs: duration,
    });

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      logger.warn('Unexpected embedding dimensions', {
        expected: EMBEDDING_DIMENSIONS,
        actual: embedding.length,
      });
    }

    return embedding;
  } catch (error) {
    logger.error('Failed to generate embedding', {
      error: error instanceof Error ? error.message : 'Unknown error',
      textLength: text.length,
    });
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function embeddingToBuffer(embedding: number[]): Buffer {
  const buffer = Buffer.alloc(embedding.length * 4);
  embedding.forEach((value, index) => {
    buffer.writeFloatLE(value, index * 4);
  });
  return buffer;
}

export function bufferToEmbedding(buffer: Buffer): number[] {
  const embedding: number[] = [];
  for (let i = 0; i < buffer.length; i += 4) {
    embedding.push(buffer.readFloatLE(i));
  }
  return embedding;
}
