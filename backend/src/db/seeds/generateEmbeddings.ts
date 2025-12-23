import OpenAI from 'openai';
import { db } from '../client.js';
import { logger } from '../../utils/logging.js';

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const BATCH_SIZE = 50;

interface Bird {
  id: number;
  common_name: string;
  scientific_name: string;
  family_name: string;
  description?: string;
  habitat?: string;
  diet?: string;
  behavior?: string;
}

export async function generateEmbeddings(): Promise<void> {
  logger.info('Starting embeddings generation');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const openai = new OpenAI({ apiKey });

  const birds = db.prepare('SELECT * FROM birds WHERE embedding IS NULL').all() as Bird[];

  logger.info('Found birds without embeddings', { count: birds.length });

  const updateEmbedding = db.prepare('UPDATE birds SET embedding = ? WHERE id = ?');

  for (let i = 0; i < birds.length; i += BATCH_SIZE) {
    const batch = birds.slice(i, i + BATCH_SIZE);

    const texts = batch.map((bird) => createEmbeddingText(bird));

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      });

      const transaction = db.transaction(() => {
        response.data.forEach((embedding, index) => {
          const bird = batch[index];
          const embeddingBuffer = Buffer.from(
            new Float32Array(embedding.embedding).buffer
          );
          updateEmbedding.run(embeddingBuffer, bird.id);
        });
      });

      transaction();

      logger.info('Processed batch', {
        batch: Math.floor(i / BATCH_SIZE) + 1,
        processed: Math.min(i + BATCH_SIZE, birds.length),
        total: birds.length,
      });

      // Rate limit: wait 1 second between batches
      if (i + BATCH_SIZE < birds.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error('Failed to generate embeddings for batch', {
        batchStart: i,
        batchSize: batch.length,
      }, error as Error);
      throw error;
    }
  }

  logger.info('Embeddings generation completed', { totalBirds: birds.length });
}

function createEmbeddingText(bird: Bird): string {
  const parts = [
    `Common Name: ${bird.common_name}`,
    `Scientific Name: ${bird.scientific_name}`,
    `Family: ${bird.family_name}`,
  ];

  if (bird.description) parts.push(`Description: ${bird.description}`);
  if (bird.habitat) parts.push(`Habitat: ${bird.habitat}`);
  if (bird.diet) parts.push(`Diet: ${bird.diet}`);
  if (bird.behavior) parts.push(`Behavior: ${bird.behavior}`);

  return parts.join('. ');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmbeddings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
