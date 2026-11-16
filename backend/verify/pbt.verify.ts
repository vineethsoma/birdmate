/**
 * verify:pbt - property-based tests: random and adversarial queries against
 * SearchService must satisfy every search + audit invariant in formal/.
 * fast-check shrinks failures to a minimal counterexample.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';

vi.mock('../src/utils/embeddings.js', async () => (await import('./helpers.ts')).embeddingsMock());

import { SearchService } from '../src/services/SearchService.ts';
import { BirdService } from '../src/services/BirdService.ts';
import { openDb, RUNS, FAIL_MARKER } from './helpers.ts';
import {
  allSearchInvariants, allAuditInvariants, QUERY_MIN_LENGTH, QUERY_MAX_LENGTH,
  type AuditEntry, type WireSearchResponse,
} from '../../formal/invariants.ts';

const db = openDb();
// Keep embeddings for ~10% of species in this throw-away copy: search cost is linear in
// indexed birds, and the invariants do not depend on how many are indexed. Ambiguity
// is computed over all species, so it is unaffected.
db.exec('UPDATE birds SET embedding = NULL WHERE rowid % 10 != 0');
const log: AuditEntry[] = [];
const service = new SearchService(new BirdService(db), e => log.push(e as AuditEntry));
afterAll(() => db.close());
beforeAll(() => { log.length = 0; });

// --- generators ------------------------------------------------------------
const word = (xs: string[]) => fc.constantFrom(...xs);
const colors = word(['red', 'blue', 'yellow', 'grey', 'black', 'white', 'brown', 'orange', 'olive', 'rufous']);
const parts = word(['head', 'chest', 'back', 'wings', 'tail', 'bill', 'belly', 'throat', 'crest', 'eye', 'legs']);
const sizes = word(['tiny', 'small', 'medium', 'large', 'sparrow-sized', 'crow-sized']);
const behaviors = word(['hopping on the lawn', 'sounds like a drum roll', 'sings at dawn', 'hovering', 'flocking', 'drilling a tree']);
const habitats = word(['in my yard', 'near a lake', 'in the forest', 'at the feeder', 'on the beach', 'in a marsh']);
// ambiguous, unambiguous and regional names; full names resolve the ambiguity of their tail word
const names = word(['robin', 'sparrow', 'jay', 'hawk', 'finch', 'warbler', 'duck', 'blue jay', 'american robin', 'european robin',
  'northern cardinal', 'bald eagle', 'robin redbreast', 'bird', 'owl']);
// PII canaries that must never reach the audit log
const pii = word(['john.doe@example.com', '555-867-5309', '+1 (415) 555-0100', '192.168.10.24', 'at 123 Main Street']);

const phrase = fc.array(fc.oneof(
  fc.tuple(colors, parts).map(([c, p]) => `${c} ${p}`),
  sizes, behaviors, habitats, names, names, pii,
), { minLength: 1, maxLength: 7 }).chain(xs => fc.constantFrom(' ', ', ', ' and ').map(sep => xs.join(sep)));

const adversarial = fc.oneof(
  fc.string({ minLength: 0, maxLength: 600 }),
  fc.fullUnicodeString({ minLength: 0, maxLength: 200 }),
  fc.constantFrom('<script>alert(1)</script> robin', "'; DROP TABLE birds;-- robin", '🐦🐦🐦', 'ROBIN', '   robin   ', 'robin\n\trobin', 'a'.repeat(QUERY_MAX_LENGTH), 'rob' + 'in'.repeat(249)),
  phrase.map(p => `  ${p}  `),
);
const anyQuery = fc.oneof({ weight: 3, arbitrary: phrase }, { weight: 2, arbitrary: adversarial });
const validQuery = anyQuery.filter(q => q.trim().length >= QUERY_MIN_LENGTH && q.trim().length <= QUERY_MAX_LENGTH);
const invalidQuery = fc.oneof(
  fc.string({ minLength: 0, maxLength: 2 }),
  fc.constant('').map(() => ' '.repeat(10)),
  fc.integer({ min: QUERY_MAX_LENGTH + 1, max: 2000 }).map(n => 'x'.repeat(n)),
);

// --- reporting ---------------------------------------------------------------
const brief = (r: WireSearchResponse) => r.results.map(x => `${x.id} (${x.score})`).join(', ') || '(none)';

describe('verify:pbt', () => {
  it(`every search invariant holds for ${RUNS} random/adversarial queries`, async () => {
    await fc.assert(fc.asyncProperty(validQuery, async query => {
      const response = (await service.search(query)) as WireSearchResponse;
      for (const inv of allSearchInvariants) {
        if (!inv.holds({ query, response })) {
          throw new Error(
            `❌ ${inv.id} violated (principle ${inv.principle}): ${inv.description}\n` +
            `   query:   ${JSON.stringify(query)}\n   results: [${brief(response)}]\n` +
            `   message: ${JSON.stringify(response.message)}   totalCount: ${response.totalCount}`);
        }
      }
    }), { numRuns: RUNS, verbose: 0 });
  });

  it(`every audit invariant holds for ${RUNS} random/adversarial queries`, async () => {
    await fc.assert(fc.asyncProperty(validQuery, async query => {
      log.length = 0;
      const response = (await service.search(query)) as WireSearchResponse;
      for (const inv of allAuditInvariants) {
        if (!inv.holds({ query, response, log })) {
          throw new Error(
            `❌ ${inv.id} violated (principle ${inv.principle}): ${inv.description}\n` +
            `   query:     ${JSON.stringify(query)}\n   results:   [${brief(response)}]\n` +
            `   audit log: ${JSON.stringify(log)}`);
        }
      }
    }), { numRuns: RUNS, verbose: 0 });
  });

  it('queries outside 3-500 characters are rejected and never reach the index', async () => {
    await fc.assert(fc.asyncProperty(invalidQuery, async query => {
      log.length = 0;
      await expect(service.search(query), `query ${JSON.stringify(query.slice(0, 40))}`).rejects.toThrow(/3-500 characters/);
      expect(log).toHaveLength(0);
    }), { numRuns: Math.min(RUNS, 200) });
  });

  it('failed searches are still audit-logged (failed:true) so index gaps can be analysed', async () => {
    log.length = 0;
    await expect(service.search(`robin ${FAIL_MARKER}`)).rejects.toThrow();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ failed: true, resultCount: 0, topResults: [], ambiguous: true });
  });

  it('known cases: "robin" is flagged, a full species name is not', async () => {
    const robin = await service.search('small robin in my yard');
    expect(robin.message, 'ambiguityFlagged violated for "small robin in my yard"').toBeDefined();
    const jay = await service.search('blue jay');
    expect(jay.message, 'unambiguous "blue jay" must not be flagged').toBeUndefined();
  });
});
