/**
 * verify:contract - the HTTP API conforms to the contract in formal/invariants.ts:
 * 200s match the search response schema (and every search invariant), every 4xx
 * uses { error: { code, message } }, and no input can cause a 5xx.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import fc from 'fast-check';

vi.mock('../src/utils/embeddings.js', async () => (await import('./helpers.ts')).embeddingsMock());

import { prepareDb, RUNS } from './helpers.ts';
import {
  allSearchInvariants, errorInvariants, validateSearchResponse, type WireSearchResponse,
} from '../../formal/invariants.ts';

let app: import('express').Express;
beforeAll(async () => {
  prepareDb(); // sets DATABASE_PATH to a temp copy before the app opens the DB
  const { createApp } = await import('../src/server.ts');
  app = createApp();
});

const api = () => request(app);
const expectConformingError = (status: number, body: unknown) =>
  expect(errorInvariants.errorConforms.holds({ status, body }), `❌ errorConforms violated: ${status} ${JSON.stringify(body)}`).toBe(true);

describe('verify:contract', () => {
  it('POST /api/v1/search -> 200 conforms to the schema and all search invariants', async () => {
    for (const query of ['red chest with grey back', 'small robin in my yard', 'blue jay', 'sounds like a drum roll']) {
      const res = await api().post('/api/v1/search').send({ query });
      expect(res.status, JSON.stringify(res.body)).toBe(200);
      expect(validateSearchResponse(res.body), `schema violations for ${JSON.stringify(query)}`).toEqual([]);
      for (const inv of allSearchInvariants) {
        expect(inv.holds({ query, response: res.body as WireSearchResponse }), `❌ ${inv.id} violated for ${JSON.stringify(query)}`).toBe(true);
      }
    }
  });

  it('rejected requests use the standard error body', async () => {
    const cases: [string, () => request.Test, number][] = [
      ['empty body', () => api().post('/api/v1/search').send({}), 400],
      ['non-string query', () => api().post('/api/v1/search').send({ query: 42 }), 400],
      ['too short', () => api().post('/api/v1/search').send({ query: 'ab' }), 400],
      ['too long', () => api().post('/api/v1/search').send({ query: 'x'.repeat(501) }), 400],
      ['wrong content type', () => api().post('/api/v1/search').set('Content-Type', 'text/plain').send('red bird'), 415],
      ['GET not allowed', () => api().get('/api/v1/search?query=red'), 405],
      ['unknown route', () => api().get('/api/v1/nope'), 404],
    ];
    for (const [name, call, status] of cases) {
      const res = await call();
      expect(res.status, name).toBe(status);
      expectConformingError(res.status, res.body);
    }
  });

  it('GET /api/v1/taxonomy and /health respond with their documented shapes', async () => {
    const tax = await api().get('/api/v1/taxonomy');
    expect(tax.status).toBe(200);
    expect(tax.body).toMatchObject({ version: expect.any(String), source: 'eBird' });
    const health = await api().get('/health');
    expect(health.status).toBe(200);
    expect(health.body).toMatchObject({ status: 'ok' });
  });

  it('no JSON body can cause a 5xx; every 4xx is a conforming error', async () => {
    await fc.assert(fc.asyncProperty(fc.jsonValue(), async body => {
      const res = await api().post('/api/v1/search').send(JSON.stringify(body)).set('Content-Type', 'application/json');
      if (res.status >= 500) throw new Error(`❌ noServerErrors violated\n   body: ${JSON.stringify(body)}\n   status: ${res.status} ${JSON.stringify(res.body)}`);
      if (res.status === 200) expect(validateSearchResponse(res.body)).toEqual([]);
      else expectConformingError(res.status, res.body);
    }), { numRuns: Math.min(RUNS, 150) });
  });

  // GET /api/v1/birds/:id is part of the intended contract (constitution, "API: RESTful
  // endpoints") but the route is not implemented yet (see server.ts).
  it.todo('GET /api/v1/birds/:id conforms to the bird detail schema');
});
