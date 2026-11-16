/**
 * Shared helpers for verifiers: an isolated DB copy and a deterministic,
 * offline stand-in for the OpenAI embeddings API.
 */
import Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SOURCE_DB = resolve(HERE, '../database/birdmate.db');

/** Number of property-test runs; `npm run verify:all -- --runs N` sets VERIFY_RUNS. */
export const RUNS = Math.max(1, parseInt(process.env.VERIFY_RUNS ?? '100', 10) || 100);

let tmpDbPath: string | null = null;

/**
 * Copy the tracked SQLite DB (incl. WAL) to a temp dir so verification never
 * modifies files under version control. Sets DATABASE_PATH for code that
 * opens the DB itself (the Express app).
 */
export function prepareDb(): string {
  if (tmpDbPath) return tmpDbPath;
  const dir = mkdtempSync(join(tmpdir(), 'birdmate-verify-'));
  for (const suffix of ['', '-wal', '-shm']) {
    if (existsSync(SOURCE_DB + suffix)) copyFileSync(SOURCE_DB + suffix, join(dir, 'birdmate.db' + suffix));
  }
  tmpDbPath = join(dir, 'birdmate.db');
  process.env.DATABASE_PATH = tmpDbPath;
  return tmpDbPath;
}

export function openDb(): Database.Database {
  return new Database(prepareDb(), { readonly: false });
}

// ---------------------------------------------------------------------------
// Offline embeddings: map a query to the stored embedding of one of a fixed
// set of birds, plus small deterministic noise. This yields realistic result
// sets (a few strong matches among many weak ones) without network access.
// ---------------------------------------------------------------------------
export const FAIL_MARKER = '__EMBEDDING_PROVIDER_DOWN__';
let anchors: Float32Array[] | null = null;

function fnv(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function loadAnchors(): Float32Array[] {
  if (anchors) return anchors;
  const db = openDb();
  const rows = db.prepare('SELECT embedding FROM birds WHERE embedding IS NOT NULL ORDER BY id LIMIT 400').all() as { embedding: Buffer }[];
  anchors = rows.filter((_, i) => i % 5 === 0).map(r =>
    new Float32Array(r.embedding.buffer, r.embedding.byteOffset, r.embedding.byteLength / 4).slice());
  db.close();
  return anchors;
}

export function embeddingsMock() {
  return {
    generateEmbedding: async (text: string) => {
      if (text.includes(FAIL_MARKER)) throw new Error('Embeddings provider unavailable');
      const a = loadAnchors();
      const h = fnv(text);
      const base = a[h % a.length]!;
      let seed = h;
      const embedding = Array.from(base, v => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return v + ((seed / 0xffffffff) - 0.5) * 0.02;
      });
      return { embedding, model: 'offline-verify', tokens: text.split(/\s+/).length };
    },
  };
}
