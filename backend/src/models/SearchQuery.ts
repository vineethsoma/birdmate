import { SearchQuery as SearchQueryType } from '@shared/types';
import { ValidationError } from '../api/middleware/errorHandler.js';
import validator from 'validator';

export class SearchQuery {
  static validate(query: Partial<SearchQueryType>): void {
    if (!query.queryText) {
      throw new ValidationError('Query text is required', 'queryText');
    }

    const trimmed = query.queryText.trim();
    
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new ValidationError(
        'Query text must be between 1 and 500 characters',
        'queryText'
      );
    }

    // Additional XSS prevention validation
    if (validator.contains(trimmed, '<script>') || validator.contains(trimmed, '</script>')) {
      throw new ValidationError('Query contains invalid characters', 'queryText');
    }
  }

  static normalize(queryText: string): string {
    return queryText.trim().toLowerCase();
  }

  static fromDatabase(row: Record<string, unknown>): SearchQueryType {
    return {
      id: row.id as number,
      queryText: row.query_text as string,
      queryEmbedding: row.query_embedding 
        ? JSON.parse(row.query_embedding as string) 
        : undefined,
      userId: row.user_id as string | undefined,
      resultCount: row.result_count as number | undefined,
      executionTimeMs: row.execution_time_ms as number | undefined,
      createdAt: row.created_at as string | undefined,
    };
  }
}
