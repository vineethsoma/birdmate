/**
 * verify:data - every bird row satisfies formal/dataInvariants and matches eBird
 */
import { describe, it, expect, afterAll } from 'vitest';
import { openDb } from './helpers.ts';
import { allDataInvariants, type DbBird } from '../../formal/invariants.ts';
import { taxonomy } from '../../formal/ontology.ts';

const db = openDb();
afterAll(() => db.close());

describe('verify:data', () => {
  const birds = (db.prepare(
    'SELECT id, common_name, scientific_name, family, size_min_cm, size_max_cm FROM birds'
  ).all() as Record<string, unknown>[]).map((r): DbBird => ({
    id: r.id as string, commonName: r.common_name as string, scientificName: r.scientific_name as string,
    family: r.family as string | null, sizeMinCm: r.size_min_cm as number | null, sizeMaxCm: r.size_max_cm as number | null,
  }));

  it('database is not empty and taxonomy loaded', () => {
    expect(birds.length).toBeGreaterThan(0);
    expect(taxonomy.size).toBeGreaterThan(10_000);
  });

  for (const invariant of allDataInvariants) {
    it(`${invariant.id} (principle ${invariant.principle}): ${invariant.description}`, () => {
      const violations = birds.filter(b => !invariant.holds(b));
      const shown = violations.slice(0, 5).map(b => `   ${JSON.stringify(b)}`).join('\n');
      expect(violations.length, `❌ ${invariant.id} violated by ${violations.length} bird(s)\n${shown}`).toBe(0);
    });
  }

  it('taxonomy metadata row exists (version indicator, FR-016)', () => {
    const row = db.prepare('SELECT version, source FROM taxonomy_metadata WHERE id = 1').get() as { version: string; source: string } | undefined;
    expect(row?.version).toBeTruthy();
    expect(row?.source).toBe('eBird');
  });
});
