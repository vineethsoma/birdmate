import { Bird as BirdType } from '@shared/types';
import { ValidationError } from '../api/middleware/errorHandler.js';

export class Bird {
  static validate(bird: Partial<BirdType>): void {
    if (!bird.commonName || bird.commonName.trim().length === 0) {
      throw new ValidationError('Common name is required', 'commonName');
    }

    if (!bird.scientificName || bird.scientificName.trim().length === 0) {
      throw new ValidationError('Scientific name is required', 'scientificName');
    }

    if (bird.description && bird.description.length < 50) {
      throw new ValidationError(
        'Description must be at least 50 characters for effective embedding generation',
        'description'
      );
    }
  }

  static fromDatabase(row: Record<string, unknown>): BirdType {
    return {
      id: row.id as number,
      commonName: row.common_name as string,
      scientificName: row.scientific_name as string,
      taxonomyOrder: row.taxonomy_order as number,
      category: row.category as string,
      familyName: row.family_name as string,
      description: row.description as string | undefined,
      habitat: row.habitat as string | undefined,
      diet: row.diet as string | undefined,
      behavior: row.behavior as string | undefined,
      conservation: row.conservation as string | undefined,
      embedding: row.embedding ? JSON.parse(row.embedding as string) : undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
