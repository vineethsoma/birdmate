/**
 * Unit tests for SearchService
 * 
 * Tests semantic search orchestration with mocked dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI before any imports
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn()
    }
  }))
}));

// Mock embeddings utility - define mock inline
vi.mock('../utils/embeddings.js', () => ({
  generateEmbedding: vi.fn().mockResolvedValue({
    embedding: new Array(1536).fill(0.1),
    model: 'text-embedding-3-small',
    tokens: 10
  })
}));

// Mock BirdService
vi.mock('./BirdService.js');

// Import mocked modules after vi.mock() calls
import { generateEmbedding } from '../utils/embeddings.js';
// Import mocked modules after vi.mock() calls
import { generateEmbedding } from '../utils/embeddings.js';
import { SearchService } from './SearchService.js';

describe('SearchService', () => {
  // Cast to access mock methods
  const mockGenerateEmbedding = generateEmbedding as any;
  let searchService: SearchService;
  let mockBirdService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockBirdService = {
      searchBySimilarity: vi.fn(),
      getBulkWithImages: vi.fn()
    };

    searchService = new SearchService(mockBirdService);
  });

  describe('search', () => {
    it('should perform end-to-end search', async () => {
      const query = 'red bird with black wings';
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockSearchResults = [
        { id: 'norcar', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis', score: 0.89 },
        { id: 'scatan', commonName: 'Scarlet Tanager', scientificName: 'Piranga olivacea', score: 0.76 }
      ];
      const mockBirdsWithImages = [
        { id: 'norcar', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis', 
          thumbnailUrl: 'https://example.com/cardinal.jpg', description: 'Bright red bird' },
        { id: 'scatan', commonName: 'Scarlet Tanager', scientificName: 'Piranga olivacea',
          thumbnailUrl: 'https://example.com/tanager.jpg', description: 'Red body black wings' }
      ];

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 10
      });
      mockBirdService.searchBySimilarity.mockReturnValue(mockSearchResults);
      mockBirdService.getBulkWithImages.mockReturnValue(mockBirdsWithImages);

      const result = await searchService.search(query);

      expect(mockGenerateEmbedding).toHaveBeenCalledWith(query);
      expect(mockBirdService.searchBySimilarity).toHaveBeenCalledWith(mockEmbedding, 10, 0.3);
      expect(mockBirdService.getBulkWithImages).toHaveBeenCalledWith(['norcar', 'scatan']);
      
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual({
        id: 'norcar',
        commonName: 'Northern Cardinal',
        scientificName: 'Cardinalis cardinalis',
        score: 0.89,
        thumbnailUrl: 'https://example.com/cardinal.jpg',
        fieldMarks: expect.any(Array)
      });
      expect(result.totalCount).toBe(2);
      expect(result.queryId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    it('should validate query length - minimum 3 characters', async () => {
      await expect(searchService.search('ab')).rejects.toThrow('Query must be 3-500 characters');
    });

    it('should validate query length - maximum 500 characters', async () => {
      const longQuery = 'a'.repeat(501);
      await expect(searchService.search(longQuery)).rejects.toThrow('Query must be 3-500 characters');
    });

    it('should trim whitespace before validation', async () => {
      const query = '  red bird  ';
      const mockEmbedding = new Array(1536).fill(0.1);

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 5
      });
      mockBirdService.searchBySimilarity.mockReturnValue([]);
      mockBirdService.getBulkWithImages.mockReturnValue([]);

      await searchService.search(query);

      expect(mockGenerateEmbedding).toHaveBeenCalledWith('red bird');
    });

    it('should reject empty query after trimming', async () => {
      await expect(searchService.search('   ')).rejects.toThrow('Query must be 3-500 characters');
    });

    it('should handle no results gracefully', async () => {
      const query = 'purple eagle with six wings';
      const mockEmbedding = new Array(1536).fill(0.1);

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 10
      });
      mockBirdService.searchBySimilarity.mockReturnValue([]);
      mockBirdService.getBulkWithImages.mockReturnValue([]);

      const result = await searchService.search(query);

      expect(result.results).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.queryId).toBeDefined();
    });

    it('should extract field marks from description', async () => {
      const query = 'blue bird';
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockSearchResults = [
        { id: 'blujay', commonName: 'Blue Jay', scientificName: 'Cyanocitta cristata', score: 0.95 }
      ];
      const mockBirdsWithImages = [
        { 
          id: 'blujay', 
          commonName: 'Blue Jay', 
          scientificName: 'Cyanocitta cristata',
          thumbnailUrl: 'https://example.com/bluejay.jpg',
          description: 'Blue upperparts with white underparts. Black necklace. Prominent blue crest.'
        }
      ];

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 5
      });
      mockBirdService.searchBySimilarity.mockReturnValue(mockSearchResults);
      mockBirdService.getBulkWithImages.mockReturnValue(mockBirdsWithImages);

      const result = await searchService.search(query);

      expect(result.results[0].fieldMarks).toEqual(
        expect.arrayContaining(['blue crest', 'black necklace', 'white underparts'])
      );
    });

    it('should handle missing description gracefully', async () => {
      const query = 'test bird';
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockSearchResults = [
        { id: 'testbird', commonName: 'Test Bird', scientificName: 'Testus birdus', score: 0.5 }
      ];
      const mockBirdsWithImages = [
        { 
          id: 'testbird', 
          commonName: 'Test Bird', 
          scientificName: 'Testus birdus',
          thumbnailUrl: null,
          description: null
        }
      ];

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 5
      });
      mockBirdService.searchBySimilarity.mockReturnValue(mockSearchResults);
      mockBirdService.getBulkWithImages.mockReturnValue(mockBirdsWithImages);

      const result = await searchService.search(query);

      expect(result.results[0].fieldMarks).toEqual([]);
    });

    it('should log query audit trail', async () => {
      const query = 'red bird';
      const mockEmbedding = new Array(1536).fill(0.1);

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 5
      });
      mockBirdService.searchBySimilarity.mockReturnValue([]);
      mockBirdService.getBulkWithImages.mockReturnValue([]);

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await searchService.search(query);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"event":"search"')
      );
      // Changed to queryHash for PII protection (CLAUDE L-5)
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"queryHash"')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"queryLength":8')
      );

      logSpy.mockRestore();
    });


    it('should handle embedding generation failure', async () => {
      const query = 'test query';

      mockGenerateEmbedding.mockRejectedValue(new Error('OpenAI API error'));

      await expect(searchService.search(query)).rejects.toThrow('OpenAI API error');
    });

    it('should round scores to 2 decimal places', async () => {
      const query = 'test';
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockSearchResults = [
        { id: 'bird1', commonName: 'Bird 1', scientificName: 'Birdus one', score: 0.876543 }
      ];
      const mockBirdsWithImages = [
        { id: 'bird1', commonName: 'Bird 1', scientificName: 'Birdus one', 
          thumbnailUrl: 'url', description: 'desc' }
      ];

      mockGenerateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokens: 5
      });
      mockBirdService.searchBySimilarity.mockReturnValue(mockSearchResults);
      mockBirdService.getBulkWithImages.mockReturnValue(mockBirdsWithImages);

      const result = await searchService.search(query);

      expect(result.results[0].score).toBe(0.88);
    });
  });
});
