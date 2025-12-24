/**
 * OpenAI Embeddings Generation Script
 * 
 * Generates vector embeddings for all birds in the database
 * using OpenAI's text-embedding-3-small model
 */

import OpenAI from 'openai';
import { getDatabase, transaction } from '../client.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Bird {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string | null;
  description: string | null;
  habitat: string | null;
  range: string | null;
}

/**
 * Generate embedding text from bird data
 */
function generateEmbeddingText(bird: Bird): string {
  const parts: string[] = [
    `Common name: ${bird.common_name}`,
    `Scientific name: ${bird.scientific_name}`,
  ];
  
  if (bird.family) {
    parts.push(`Family: ${bird.family}`);
  }
  
  if (bird.description) {
    parts.push(bird.description);
  }
  
  if (bird.habitat) {
    parts.push(`Habitat: ${bird.habitat}`);
  }
  
  if (bird.range) {
    parts.push(`Range: ${bird.range}`);
  }
  
  return parts.join('. ');
}

/**
 * Generate embeddings for all birds
 */
export async function generateEmbeddings(): Promise<number> {
  console.log('🤖 Generating embeddings...');
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  try {
    const db = getDatabase();
    
    // Get all birds without embeddings
    const birds = db.prepare(`
      SELECT id, common_name, scientific_name, family, description, habitat, range
      FROM birds
      WHERE embedding IS NULL
    `).all() as Bird[];
    
    console.log(`📊 Generating embeddings for ${birds.length} birds...`);
    
    let processed = 0;
    const batchSize = 100; // OpenAI allows up to 2048 inputs per request
    
    for (let i = 0; i < birds.length; i += batchSize) {
      const batch = birds.slice(i, i + batchSize);
      const texts = batch.map(generateEmbeddingText);
      
      // Generate embeddings in batch
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float',
      });
      
      // Store embeddings
      transaction((txDb) => {
        const stmt = txDb.prepare(`
          UPDATE birds SET embedding = ? WHERE id = ?
        `);
        
        response.data.forEach((item, index) => {
          const bird = batch[index]!;
          const embedding = Buffer.from(new Float32Array(item.embedding).buffer);
          stmt.run(embedding, bird.id);
        });
      });
      
      processed += batch.length;
      console.log(`  Progress: ${processed}/${birds.length} (${Math.round(processed / birds.length * 100)}%)`);
      
      // Rate limiting: wait 1 second between batches
      if (i + batchSize < birds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Generated ${processed} embeddings`);
    return processed;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmbeddings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
