import { TaxonomyMetadata as TaxonomyMetadataType } from '@shared/types';
import { ValidationError } from '../api/middleware/errorHandler.js';

export class TaxonomyMetadata {
  static validate(metadata: Partial<TaxonomyMetadataType>): void {
    if (!metadata.speciesCode || metadata.speciesCode.trim().length === 0) {
      throw new ValidationError('Species code is required', 'speciesCode');
    }

    if (!metadata.taxonomyOrder || metadata.taxonomyOrder < 0) {
      throw new ValidationError('Valid taxonomy order is required', 'taxonomyOrder');
    }
  }

  static fromDatabase(row: Record<string, unknown>): TaxonomyMetadataType {
    return {
      id: row.id as number,
      speciesCode: row.species_code as string,
      commonName: row.common_name as string,
      scientificName: row.scientific_name as string,
      category: row.category as string,
      taxonomyOrder: row.taxonomy_order as number,
      familyCommonName: row.family_common_name as string | undefined,
      familyScientificName: row.family_scientific_name as string | undefined,
      reportAsSpecies: Boolean(row.report_as_species),
      extinct: Boolean(row.extinct),
      extinctYear: row.extinct_year as number | undefined,
      rawData: row.raw_data as string,
      createdAt: row.created_at as string,
    };
  }
}
