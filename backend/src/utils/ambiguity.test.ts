import { describe, it, expect } from 'vitest';
import { AmbiguityDetector, ambiguityMessage, parseTaxonomyCsv } from './ambiguity.js';

const species = [
  { id: 'amerob', commonName: 'American Robin' },
  { id: 'eurrob1', commonName: 'European Robin' },
  { id: 'bluejay', commonName: 'Blue Jay' },
  { id: 'stejay', commonName: "Steller's Jay" },
  { id: 'norcar', commonName: 'Northern Cardinal' },
];

describe('AmbiguityDetector', () => {
  const detector = new AmbiguityDetector(species);

  it('flags a name shared by several species', () => {
    expect(detector.find('small robin in my yard')).toEqual([{ name: 'robin', speciesCount: 2 }]);
  });

  it('does not flag a full species name, even if its last word is shared', () => {
    expect(detector.find('blue jay')).toEqual([]);
    expect(detector.find('American Robin')).toEqual([]);
  });

  it('does not flag descriptive queries', () => {
    expect(detector.find('red chest with grey back')).toEqual([]);
  });

  it('ignores case, punctuation and diacritics', () => {
    expect(detector.find('ROBIN!!!').map(f => f.name)).toEqual(['robin']);
    expect(detector.find("steller's jay")).toEqual([]);
  });

  it('builds a user-facing message', () => {
    expect(ambiguityMessage([{ name: 'robin', speciesCount: 2 }])).toContain('"robin" (2 species)');
  });
});

describe('parseTaxonomyCsv', () => {
  it('keeps species rows only and honors quoted fields', () => {
    const csv = [
      'SCIENTIFIC_NAME,COMMON_NAME,SPECIES_CODE,CATEGORY,FAMILY_COM_NAME',
      'Turdus migratorius,American Robin,amerob,species,"Thrushes, and Allies"',
      'Struthio camelus/molybdophanes,Common/Somali Ostrich,y00934,slash,Ostriches',
    ].join('\n');
    expect(parseTaxonomyCsv(csv)).toEqual([{ id: 'amerob', commonName: 'American Robin' }]);
  });
});
