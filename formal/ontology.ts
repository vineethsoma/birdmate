/**
 * Birdmate formal ontology (HUMAN-OWNED, read-only for agents; see CODEOWNERS)
 *
 * Source of truth for "what exists" in the bird domain, derived from the eBird
 * taxonomy snapshot in database/ebird-taxonomy.csv. Invariants (invariants.ts)
 * define what must always be true about it.
 *
 * Concepts:   Species (eBird code), Family, ScientificName, CommonName, Synonym
 * Relations:
 *   speciesCode  <-> scientificName   one-to-one
 *   species      ->  family           functional, must match eBird
 *   name         ->  species[]        1..n  (e.g. "robin" -> American Robin, European Robin, ...)
 *
 * This file is deliberately dependency-free (node:fs only) so it can be loaded
 * by Vitest, hooks and CI without extra installs.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface TaxonRow {
  code: string;
  scientificName: string;
  commonName: string;
  category: string;
  family: string;
  familyScientific: string;
}

/** Minimal RFC 4180 CSV parser (handles quoted fields with commas/newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += ch; }
    } else if (ch === '"') { inQuotes = true; }
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else { field += ch; }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Lowercase, strip diacritics/punctuation noise, collapse whitespace. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * All name forms by which a common name may be referred to: the full name and
 * every trailing word sequence ("Eurasian Blue Tit" -> "eurasian blue tit",
 * "blue tit", "tit"). Hyphenated words stay whole: splitting "White-eye" would make
 * the descriptive word "eye" look like a bird name.
 */
export function nameForms(commonName: string): string[] {
  const words = normalizeName(commonName).split(' ').filter(Boolean);
  const forms = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    forms.add(words.slice(i).join(' '));
  }
  return [...forms];
}

export class Taxonomy {
  private byCode = new Map<string, TaxonRow>();
  private byName = new Map<string, Set<string>>();

  constructor(rows: TaxonRow[]) {
    for (const r of rows) {
      if (r.category !== 'species') continue; // slashes, spuhs, hybrids, forms are not species
      this.byCode.set(r.code, r);
      for (const form of nameForms(r.commonName)) {
        let set = this.byName.get(form);
        if (!set) this.byName.set(form, (set = new Set()));
        set.add(r.code);
      }
    }
  }

  get size(): number { return this.byCode.size; }
  has(code: string): boolean { return this.byCode.has(code); }
  get(code: string): TaxonRow | undefined { return this.byCode.get(code); }
  /** Species a (possibly partial / regional) common name may refer to. */
  speciesForName(name: string): string[] { return [...(this.byName.get(normalizeName(name)) ?? [])]; }
  isAmbiguous(name: string): boolean { return this.speciesForName(name).length > 1; }

  /**
   * Ambiguous names (1-3 word n-grams) mentioned in a free-text query. A name
   * that is only part of a longer, matching name is resolved, not ambiguous:
   * "blue jay" is one species, so "jay" inside it is not reported.
   */
  ambiguousNamesIn(query: string): string[] {
    const words = normalizeName(query).split(' ').filter(Boolean);
    const spans: { start: number; end: number; gram: string; count: number }[] = [];
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i + n <= words.length; i++) {
        const gram = words.slice(i, i + n).join(' ');
        const count = this.speciesForName(gram).length;
        if (count > 0) spans.push({ start: i, end: i + n, gram, count });
      }
    }
    const found = new Set<string>();
    for (const s of spans) {
      if (s.count < 2) continue;
      const covered = spans.some(o => o !== s && o.start <= s.start && o.end >= s.end && o.end - o.start > s.end - s.start);
      if (!covered) found.add(s.gram);
    }
    return [...found];
  }
}

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_TAXONOMY_PATH = resolve(HERE, '../database/ebird-taxonomy.csv');

export function loadEbirdTaxonomy(path: string = DEFAULT_TAXONOMY_PATH): Taxonomy {
  const [header, ...body] = parseCsv(readFileSync(path, 'utf8'));
  if (!header) throw new Error(`Empty taxonomy file: ${path}`);
  const col = (n: string) => {
    const i = header.indexOf(n);
    if (i < 0) throw new Error(`Taxonomy CSV missing column ${n}`);
    return i;
  };
  const [sci, com, code, cat, fam, famSci] =
    ['SCIENTIFIC_NAME', 'COMMON_NAME', 'SPECIES_CODE', 'CATEGORY', 'FAMILY_COM_NAME', 'FAMILY_SCI_NAME'].map(col) as
      [number, number, number, number, number, number];
  return new Taxonomy(body.map(r => ({
    scientificName: r[sci] ?? '', commonName: r[com] ?? '', code: r[code] ?? '',
    category: r[cat] ?? '', family: r[fam] ?? '', familyScientific: r[famSci] ?? '',
  })));
}

export const taxonomy: Taxonomy = loadEbirdTaxonomy();
