/**
 * Debug script to test similarity calculations
 */

import 'dotenv/config';
import { generateEmbedding } from './src/utils/embeddings.js';
import { cosineSimilarity } from './src/utils/similarity.js';
import { getDatabase } from './src/db/client.js';

async function debugSimilarity() {
  // Use main database for testing
  process.env.DATABASE_PATH = '../../../backend/database/birdmate.db';
  const db = getDatabase();
  
  // Test query
  const query = "blue jay";
  console.log(`\n🔍 Testing query: "${query}"\n`);
  
  // Generate query embedding
  const { embedding: queryEmbedding } = await generateEmbedding(query);
  console.log(`✅ Query embedding generated: ${queryEmbedding.length} dimensions\n`);
  
  // Get Blue Jay embedding
  const blueJayRow = db.prepare(`
    SELECT id, common_name, embedding 
    FROM birds 
    WHERE id = 'blujay'
  `).get() as any;
  
  if (!blueJayRow) {
    console.error('❌ Blue Jay not found in database');
    return;
  }
  
  const blueJayEmbedding = Array.from(new Float32Array(blueJayRow.embedding.buffer));
  console.log(`✅ Blue Jay embedding loaded: ${blueJayEmbedding.length} dimensions`);
  
  // Calculate similarity with Blue Jay
  const blueJaySimilarity = cosineSimilarity(queryEmbedding, blueJayEmbedding);
  console.log(`\n📊 Similarity with Blue Jay: ${blueJaySimilarity.toFixed(4)}`);
  
  // Get a random unrelated bird for comparison
  const randomBirdRow = db.prepare(`
    SELECT id, common_name, embedding 
    FROM birds 
    WHERE id = 'madsan'
    LIMIT 1
  `).get() as any;
  
  if (randomBirdRow) {
    const randomEmbedding = Array.from(new Float32Array(randomBirdRow.embedding.buffer));
    const randomSimilarity = cosineSimilarity(queryEmbedding, randomEmbedding);
    console.log(`📊 Similarity with ${randomBirdRow.common_name}: ${randomSimilarity.toFixed(4)}`);
  }
  
  // Get top 10 results
  console.log(`\n🔝 Top 10 results:\n`);
  
  const allBirds = db.prepare(`
    SELECT id, common_name, scientific_name, embedding
    FROM birds
    WHERE embedding IS NOT NULL
  `).all() as any[];
  
  const results = allBirds.map(bird => {
    const birdEmbedding = Array.from(new Float32Array(bird.embedding.buffer));
    const score = cosineSimilarity(queryEmbedding, birdEmbedding);
    return {
      id: bird.id,
      commonName: bird.common_name,
      scientificName: bird.scientific_name,
      score,
    };
  });
  
  const topResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  topResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.commonName} (${result.id}) - Score: ${result.score.toFixed(4)}`);
  });
  
  // Check Blue Jay's rank
  const blueJayRank = results
    .sort((a, b) => b.score - a.score)
    .findIndex(r => r.id === 'blujay') + 1;
  
  console.log(`\n🎯 Blue Jay ranked: #${blueJayRank} out of ${results.length}`);
}

debugSimilarity()
  .then(() => {
    console.log('\n✨ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
