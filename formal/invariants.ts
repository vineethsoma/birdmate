/**
 * Birdmate formal invariants (HUMAN-OWNED, read-only for agents; see CODEOWNERS)
 *
 * Properties that must hold for ANY query, ANY database row and ANY audit entry.
 * They turn constitution principles into executable checks:
 *   II  Accurate Bird Taxonomy  -> searchInvariants.noHallucinatedBirds / taxonomyConsistent / ambiguityFlagged
 *   III Test-First              -> backend/verify/*.verify.ts generate property tests from these
 *   IV  Audit Trail             -> auditInvariants
 *   V   API First               -> searchInvariants.contractConforms / errorInvariants
 *
 * Each invariant is a pure predicate returning true when the property holds.
 * The verifiers print the invariant id, principle and counterexample on failure.
 *
 * NOTE: these are written against the *wire* contract of POST /api/v1/search as
 * implemented by backend/src/services/SearchService.ts (flat result items), not
 * the richer SearchResponse in shared/types, which the API does not return yet.
 */
import { taxonomy, type Taxonomy } from './ontology.ts';

// ---------------------------------------------------------------------------
// Wire types (what the API actually returns)
// ---------------------------------------------------------------------------
export interface WireSearchResult {
  id: string;
  commonName: string;
  scientificName: string;
  score: number;
  thumbnailUrl: string | null;
  fieldMarks: string[];
}
export interface WireSearchResponse {
  results: WireSearchResult[];
  totalCount: number;
  queryId: string;
  message?: string;
}
export interface AuditEntry {
  timestamp: string;
  event: string;
  queryId: string;
  queryHash: string;
  queryLength: number;
  resultCount: number;
  topResults: { id: string; score: number }[];
  ambiguous: boolean;
  failed: boolean;
}
export interface DbBird {
  id: string;
  commonName: string;
  scientificName: string;
  family: string | null;
  sizeMinCm: number | null;
  sizeMaxCm: number | null;
}

export interface Invariant<C> {
  id: string;
  principle: string;
  description: string;
  holds: (ctx: C) => boolean;
}
const inv = <C>(id: string, principle: string, description: string, holds: (ctx: C) => boolean): Invariant<C> =>
  ({ id, principle, description, holds });

// ---------------------------------------------------------------------------
// Constants of the contract
// ---------------------------------------------------------------------------
/** Spec clarification: display 5-10 results maximum. */
export const MAX_RESULTS = 10;
export const QUERY_MIN_LENGTH = 3;
export const QUERY_MAX_LENGTH = 500;
export const AUDIT_ALLOWED_KEYS = [
  'timestamp', 'event', 'queryId', 'queryHash', 'queryLength',
  'resultCount', 'topResults', 'ambiguous', 'failed',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const isSortedDesc = (xs: number[]): boolean => xs.every((x, i) => i === 0 || xs[i - 1]! >= x);
export const mentionsAmbiguousName = (query: string, t: Taxonomy = taxonomy): boolean =>
  t.ambiguousNamesIn(query).length > 0;

const PII_PATTERNS: RegExp[] = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,          // email
  /(?:\+?\d[\s().-]?){9,}/,                          // phone-like digit runs
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,                     // IPv4
  /\b[0-9a-f]{1,4}(?::[0-9a-f]{0,4}){5,7}\b/i,       // IPv6
];
/** An audit entry leaks PII if it has an unexpected field or any PII-shaped value. */
export const containsPII = (entry: object): boolean => {
  const allowed = new Set<string>(AUDIT_ALLOWED_KEYS);
  if (Object.keys(entry).some(k => !allowed.has(k))) return true;
  // opaque identifiers (uuid / hex digest) are exempt: digit runs inside them are not phone numbers
  const { timestamp: _t, queryId: _q, queryHash: _h, ...rest } = entry as Record<string, unknown>;
  const text = JSON.stringify(rest);
  return PII_PATTERNS.some(re => re.test(text));
};

/** Structural validation of a search response; returns violations (empty = conforms). */
export function validateSearchResponse(x: unknown): string[] {
  const errs: string[] = [];
  const o = x as Record<string, unknown> | null;
  if (typeof o !== 'object' || o === null || Array.isArray(o)) return ['response is not an object'];
  if (!Array.isArray(o.results)) errs.push('results is not an array');
  if (!Number.isInteger(o.totalCount)) errs.push('totalCount is not an integer');
  if (typeof o.queryId !== 'string' || o.queryId.length === 0) errs.push('queryId is not a non-empty string');
  if (o.message !== undefined && typeof o.message !== 'string') errs.push('message is not a string');
  const known = new Set(['results', 'totalCount', 'queryId', 'message']);
  for (const k of Object.keys(o)) if (!known.has(k)) errs.push(`unexpected field "${k}"`);
  if (Array.isArray(o.results)) {
    o.results.forEach((r, i) => {
      const it = r as Record<string, unknown>;
      for (const f of ['id', 'commonName', 'scientificName'] as const)
        if (typeof it?.[f] !== 'string' || (it[f] as string).length === 0) errs.push(`results[${i}].${f} is not a non-empty string`);
      if (typeof it?.score !== 'number' || Number.isNaN(it.score)) errs.push(`results[${i}].score is not a number`);
      if (it?.thumbnailUrl !== null && typeof it?.thumbnailUrl !== 'string') errs.push(`results[${i}].thumbnailUrl is not string|null`);
      if (!Array.isArray(it?.fieldMarks) || !(it.fieldMarks as unknown[]).every(m => typeof m === 'string'))
        errs.push(`results[${i}].fieldMarks is not string[]`);
    });
  }
  return errs;
}
export function validateErrorResponse(x: unknown): string[] {
  const e = (x as { error?: Record<string, unknown> } | null)?.error;
  const errs: string[] = [];
  if (typeof e !== 'object' || e === null) return ['missing "error" object'];
  if (typeof e.code !== 'string' || !e.code) errs.push('error.code is not a non-empty string');
  if (typeof e.message !== 'string' || !e.message) errs.push('error.message is not a non-empty string');
  return errs;
}

// ---------------------------------------------------------------------------
// Search invariants: must hold for every successful search
// ---------------------------------------------------------------------------
export interface SearchCtx { query: string; response: WireSearchResponse }

export const searchInvariants = {
  noHallucinatedBirds: inv<SearchCtx>('noHallucinatedBirds', 'II', 'every returned bird exists in the eBird taxonomy',
    ({ response: r }) => r.results.every(x => taxonomy.has(x.id))),
  taxonomyConsistent: inv<SearchCtx>('taxonomyConsistent', 'II', 'returned names match the eBird record for that species code',
    ({ response: r }) => r.results.every(x => {
      const t = taxonomy.get(x.id);
      return !!t && t.scientificName === x.scientificName && t.commonName === x.commonName;
    })),
  uniqueResults: inv<SearchCtx>('uniqueResults', 'II', 'a species appears at most once',
    ({ response: r }) => new Set(r.results.map(x => x.id)).size === r.results.length),
  scoresBounded: inv<SearchCtx>('scoresBounded', 'V', 'scores are within [0, 1]',
    ({ response: r }) => r.results.every(x => x.score >= 0 && x.score <= 1)),
  rankedDescending: inv<SearchCtx>('rankedDescending', 'V', 'results are ranked by descending score',
    ({ response: r }) => isSortedDesc(r.results.map(x => x.score))),
  limitRespected: inv<SearchCtx>('limitRespected', 'V', `at most ${MAX_RESULTS} results`,
    ({ response: r }) => r.results.length <= MAX_RESULTS),
  totalCountMatches: inv<SearchCtx>('totalCountMatches', 'V', 'totalCount equals the number of results returned',
    ({ response: r }) => r.totalCount === r.results.length),
  ambiguityFlagged: inv<SearchCtx>('ambiguityFlagged', 'II',
    'a query mentioning an ambiguous common name (e.g. "robin") carries a message; an unambiguous query carries none',
    ({ query, response: r }) => mentionsAmbiguousName(query) === (r.message !== undefined && r.message.length > 0)),
  contractConforms: inv<SearchCtx>('contractConforms', 'V', 'response conforms to the search response schema',
    ({ response: r }) => validateSearchResponse(r).length === 0),
};

// ---------------------------------------------------------------------------
// Audit invariants: must hold for every valid search (3-500 chars)
// ---------------------------------------------------------------------------
export interface AuditCtx { query: string; response: WireSearchResponse; log: AuditEntry[] }
const entryFor = ({ response, log }: AuditCtx) => log.find(e => e.queryId === response.queryId);

export const auditInvariants = {
  everySearchLogged: inv<AuditCtx>('everySearchLogged', 'IV', 'every search produces exactly one audit entry carrying its queryId',
    c => c.log.filter(e => e.queryId === c.response.queryId).length === 1),
  top3Recorded: inv<AuditCtx>('top3Recorded', 'IV', 'the audit entry records the top-3 results with their scores',
    c => {
      const e = entryFor(c);
      const top = c.response.results.slice(0, 3).map(r => ({ id: r.id, score: r.score }));
      return !!e && e.resultCount === c.response.results.length && JSON.stringify(e.topResults) === JSON.stringify(top);
    }),
  timestampValid: inv<AuditCtx>('timestampValid', 'IV', 'the audit entry has an ISO-8601 timestamp',
    c => { const e = entryFor(c); return !!e && !Number.isNaN(Date.parse(e.timestamp)) && new Date(e.timestamp).toISOString() === e.timestamp; }),
  noPII: inv<AuditCtx>('noPII', 'IV', 'the audit entry never contains the raw query or PII-shaped values',
    c => { const e = entryFor(c); return !!e && !containsPII(e); }),
};

// ---------------------------------------------------------------------------
// Error invariants: every rejected request returns the standard error body
// ---------------------------------------------------------------------------
export const errorInvariants = {
  errorConforms: inv<{ status: number; body: unknown }>('errorConforms', 'V',
    '4xx/5xx responses use { error: { code, message } }',
    ({ status, body }) => status < 400 || validateErrorResponse(body).length === 0),
};

// ---------------------------------------------------------------------------
// Data invariants: every bird row in the database
// ---------------------------------------------------------------------------
export const dataInvariants = {
  everyDbBirdInTaxonomy: inv<DbBird>('everyDbBirdInTaxonomy', 'II', 'bird id is an eBird species code',
    b => taxonomy.has(b.id)),
  dbTaxonomyConsistent: inv<DbBird>('dbTaxonomyConsistent', 'II', 'names and family match the eBird record',
    b => {
      const t = taxonomy.get(b.id);
      return !!t && t.scientificName === b.scientificName && t.commonName === b.commonName && (b.family === null || b.family === t.family);
    }),
  sizeRangeValid: inv<DbBird>('sizeRangeValid', 'II', 'size range is non-negative and min <= max',
    b => (b.sizeMinCm === null && b.sizeMaxCm === null) ||
         (b.sizeMinCm !== null && b.sizeMaxCm !== null && b.sizeMinCm >= 0 && b.sizeMinCm <= b.sizeMaxCm)),
};

export const allSearchInvariants = Object.values(searchInvariants);
export const allAuditInvariants = Object.values(auditInvariants);
export const allDataInvariants = Object.values(dataInvariants);
