/**
 * Ambiguous-name detection (Constitution Principle II)
 *
 * A common name such as "robin" can refer to many species (American Robin,
 * European Robin, ...). When a query mentions such a name we must flag the
 * ambiguity to the user instead of silently picking one.
 *
 * A name "form" is a full common name or any trailing word sequence of it
 * ("Eurasian Blue Tit" -> "eurasian blue tit", "blue tit", "tit"). A name that
 * is only part of a longer matching name is resolved ("blue jay" is one species,
 * so "jay" inside it is not ambiguous).
 *
 * Intentionally independent of formal/ontology.ts: formal/ states the property
 * and verify:pbt checks this implementation against it.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_NGRAM = 3;

export function normalizeName(name: string): string {
  return name
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class AmbiguityDetector {
  private readonly speciesByForm = new Map<string, Set<string>>();

  /** @param species - id + common name for every searchable species */
  constructor(species: Iterable<{ id: string; commonName: string }>) {
    for (const { id, commonName } of species) {
      const words = normalizeName(commonName).split(' ').filter(Boolean);
      for (let i = 0; i < words.length; i++) {
        const form = words.slice(i).join(' ');
        let ids = this.speciesByForm.get(form);
        if (!ids) this.speciesByForm.set(form, (ids = new Set()));
        ids.add(id);
      }
    }
  }

  /** Ambiguous names mentioned in a free-text query, e.g. ["robin"]. */
  find(query: string): { name: string; speciesCount: number }[] {
    const words = normalizeName(query).split(' ').filter(Boolean);
    const spans: { start: number; end: number; name: string; count: number }[] = [];
    for (let n = 1; n <= MAX_NGRAM; n++) {
      for (let i = 0; i + n <= words.length; i++) {
        const name = words.slice(i, i + n).join(' ');
        const count = this.speciesByForm.get(name)?.size ?? 0;
        if (count > 0) spans.push({ start: i, end: i + n, name, count });
      }
    }
    const seen = new Set<string>();
    const out: { name: string; speciesCount: number }[] = [];
    for (const s of spans) {
      if (s.count < 2 || seen.has(s.name)) continue;
      const resolved = spans.some(o => o !== s && o.start <= s.start && o.end >= s.end && o.end - o.start > s.end - s.start);
      if (resolved) continue;
      seen.add(s.name);
      out.push({ name: s.name, speciesCount: s.count });
    }
    return out;
  }
}

export function ambiguityMessage(found: { name: string; speciesCount: number }[]): string {
  const names = found.map(f => `"${f.name}" (${f.speciesCount} species)`).join(', ');
  return `Ambiguous name: ${names}. Many birds match this description; add region, color or size to narrow results.`;
}

// ---------------------------------------------------------------------------
// Taxonomy source: ambiguity is judged against the full eBird taxonomy, not just
// the species that happen to be indexed ("european robin" names exactly one
// species even if the index lacks it).
// ---------------------------------------------------------------------------

/** Split one CSV line, honoring double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(field); field = ''; }
    else field += ch;
  }
  out.push(field);
  return out;
}

export function parseTaxonomyCsv(text: string): { id: string; commonName: string }[] {
  const [header, ...lines] = text.split(/\r?\n/);
  if (!header) return [];
  const cols = splitCsvLine(header);
  const [com, code, cat] = ['COMMON_NAME', 'SPECIES_CODE', 'CATEGORY'].map(c => cols.indexOf(c));
  if (com === undefined || code === undefined || cat === undefined || com < 0 || code < 0 || cat < 0) return [];
  const out: { id: string; commonName: string }[] = [];
  for (const line of lines) {
    if (!line) continue;
    const f = splitCsvLine(line);
    if (f[cat] === 'species' && f[com] && f[code]) out.push({ id: f[code], commonName: f[com] });
  }
  return out;
}

let cachedTaxonomyNames: { id: string; commonName: string }[] | null | undefined;

/** Species names from the eBird snapshot, or null if the CSV cannot be located. */
export function loadTaxonomyNames(): { id: string; commonName: string }[] | null {
  if (cachedTaxonomyNames !== undefined) return cachedTaxonomyNames;
  const candidates = [
    process.env.TAXONOMY_CSV_PATH,
    resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../database/ebird-taxonomy.csv'),
    resolve(process.cwd(), '../database/ebird-taxonomy.csv'),
    resolve(process.cwd(), 'database/ebird-taxonomy.csv'),
  ].filter((p): p is string => !!p);
  const found = candidates.find(p => existsSync(p));
  cachedTaxonomyNames = found ? parseTaxonomyCsv(readFileSync(found, 'utf8')) : null;
  if (!cachedTaxonomyNames) {
    console.warn(JSON.stringify({ level: 'warn', message: 'eBird taxonomy CSV not found; ambiguity detection limited to indexed species' }));
  }
  return cachedTaxonomyNames;
}
