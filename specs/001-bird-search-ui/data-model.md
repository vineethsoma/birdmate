# Data Model: Natural Language Bird Search Interface

**Phase**: 1 (Design & Contracts)  
**Branch**: `001-bird-search-ui`  
**Date**: 2025-12-23

## Overview

This document defines the domain entities, relationships, and data structures for the bird search application. All models are derived from functional requirements and avoid implementation details.

---

## Core Entities

### 1. Bird Species

Represents a distinct bird species with taxonomic classification, physical characteristics, and identification information.

**Attributes**:
- **id**: Unique identifier (system-generated)
- **eBirdCode**: eBird species code (e.g., "amecro" for American Crow) - unique, authoritative
- **commonName**: Primary common name in English (e.g., "American Robin")
- **scientificName**: Linnean binomial nomenclature (e.g., "Turdus migratorius")
- **family**: Taxonomic family (e.g., "Turdidae")
- **order**: Taxonomic order (e.g., "Passeriformes")
- **description**: Rich text description for embedding generation - includes color, size, behavior, habitat, field marks
- **sizeRange**: Physical size descriptors
  - **length**: Length range (e.g., "23-28 cm")
  - **wingspan**: Wingspan range (e.g., "31-40 cm")
  - **weight**: Weight range (e.g., "77-85 g")
- **habitatTypes**: Array of habitat preferences (e.g., ["Urban", "Woodland", "Grassland"])
- **geographicRange**: Text description of range (e.g., "Widespread across North America")
- **fieldMarks**: Array of distinguishing features (e.g., ["Red breast", "Grey back", "Yellow bill"])
- **plumageVariations**: Seasonal and age-based variations
  - **breeding**: Description of breeding plumage
  - **nonBreeding**: Description of non-breeding plumage
  - **juvenile**: Description of juvenile appearance
- **similarSpecies**: Array of bird IDs for species that look similar
- **createdAt**: Timestamp of record creation
- **updatedAt**: Timestamp of last modification

**Validation Rules**:
- `commonName` and `scientificName` required
- `eBirdCode` must be unique and match eBird taxonomy format
- `description` must be at least 50 characters for effective embedding generation
- At least one field mark required

**Relationships**:
- **Has Many** Bird Images (1 to many)
- **References** Similar Species (many to many - self-referential)

---

### 2. Bird Image

Represents a photograph or visual media of a bird species, sourced from Macaulay Library.

**Attributes**:
- **id**: Unique identifier
- **birdId**: Foreign key to Bird Species
- **assetId**: Macaulay Library asset ID (for reference)
- **imageUrl**: Full-resolution image URL
- **thumbnailUrl**: Thumbnail image URL (for result cards)
- **photographer**: Photographer name (for attribution)
- **licenseCode**: Creative Commons license (e.g., "CC BY-NC-SA 4.0")
- **displayOrder**: Integer for ordering images (1 = primary)
- **plumageType**: Optional tag ("breeding", "nonBreeding", "juvenile", "male", "female")
- **createdAt**: Timestamp of record creation

**Validation Rules**:
- `birdId` must reference valid Bird Species
- `imageUrl` and `thumbnailUrl` must be valid HTTPS URLs
- `photographer` and `licenseCode` required (CC BY-NC-SA compliance)
- `displayOrder` must be positive integer

**Relationships**:
- **Belongs To** Bird Species (many to one)

---

### 3. Search Query

Represents a user's natural language search input with extracted features and processing metadata.

**Attributes**:
- **id**: Unique identifier
- **queryText**: Original user input (sanitized)
- **normalizedText**: Processed/cleaned version (lowercase, trimmed)
- **embedding**: Vector representation of query (for similarity search)
- **resultCount**: Number of results returned
- **topResults**: Array of bird IDs for top 3-10 results (for audit trail)
- **timestamp**: When query was executed
- **responseTime**: Time taken to process (milliseconds)
- **userAgent**: Browser/device info (optional, for analytics)
- **wasSuccessful**: Boolean - true if results returned, false if zero results

**Validation Rules**:
- `queryText` length between 1-500 characters
- `queryText` must be sanitized (no HTML, scripts)
- `normalizedText` automatically derived from `queryText`
- `embedding` dimension must match model (e.g., 1536 for OpenAI text-embedding-3-small)

**Relationships**:
- **References** Bird Species via `topResults` (many to many through array)

**State Transitions**:
1. **Created**: Query received, text sanitized
2. **Embedding Generated**: OpenAI API called, vector stored
3. **Search Executed**: Similarity search completed
4. **Logged**: Results and metadata persisted

---

### 4. Search Result

Links a search query to matching bird species with relevance ranking and confidence scores.

**Attributes**:
- **id**: Unique identifier
- **queryId**: Foreign key to Search Query
- **birdId**: Foreign key to Bird Species
- **rank**: Position in results (1-10)
- **similarityScore**: Cosine similarity score (0.0-1.0)
- **matchedFeatures**: Array of features that contributed to match (e.g., ["red breast", "grey back"])

**Validation Rules**:
- `rank` must be 1-10 (per FR-003: 5-10 results maximum)
- `similarityScore` must be 0.0-1.0
- `queryId` and `birdId` must reference valid records

**Relationships**:
- **Belongs To** Search Query (many to one)
- **Belongs To** Bird Species (many to one)

---

### 5. Taxonomy Metadata

Stores version and update information for bird taxonomy data.

**Attributes**:
- **version**: eBird taxonomy version (e.g., "2023.1")
- **releaseDate**: Official release date from eBird
- **importedAt**: Timestamp when data was imported to database
- **speciesCount**: Total number of species in database
- **region**: Geographic region filter (e.g., "North America")

**Validation Rules**:
- Only one active record (singleton pattern)
- `version` must match eBird format
- `speciesCount` must match actual bird count

**Relationships**:
- None (metadata only)

---

## Entity Relationships Diagram

```
┌─────────────────────┐
│  Taxonomy Metadata  │ (singleton)
└─────────────────────┘

┌─────────────────────┐      1:N      ┌─────────────────┐
│   Bird Species      │◄───────────────┤   Bird Image    │
│                     │                └─────────────────┘
│ - id                │
│ - eBirdCode         │
│ - commonName        │
│ - scientificName    │      M:N
│ - description       │◄─────────────┐ (self-referential)
│ - embedding         │              │ similarSpecies
│ - fieldMarks        │──────────────┘
│ - habitatTypes      │
│ - geographicRange   │
└─────────────────────┘
         ▲
         │ M:N
         │ (via topResults array)
         │
┌─────────────────────┐      1:N      ┌─────────────────┐
│   Search Query      │◄───────────────┤  Search Result  │
│                     │                │                 │
│ - id                │                │ - rank          │
│ - queryText         │                │ - similarityScore│
│ - embedding         │                │ - matchedFeatures│
│ - topResults []     │                └─────────────────┘
│ - timestamp         │
└─────────────────────┘
```

---

## Data Validation Summary

### Cross-Entity Rules

1. **Referential Integrity**:
   - All `birdId` foreign keys must reference existing Bird Species
   - Cascade delete: Deleting a bird deletes associated images and search results

2. **Embedding Consistency**:
   - All embeddings (bird descriptions and queries) must use same model and dimension
   - Cosine similarity function must be available for comparison

3. **Audit Trail Requirements** (Constitution Principle IV):
   - Search Query records never deleted (append-only log)
   - Taxonomy version changes trigger metadata update
   - All timestamps in UTC

4. **Data Accuracy Requirements** (Constitution Principle II):
   - Bird Species records must match eBird taxonomy
   - Scientific names must follow Linnean nomenclature
   - No species created without authoritative source

---

## Sample Data

### Bird Species Example
```json
{
  "id": 1,
  "eBirdCode": "amerob",
  "commonName": "American Robin",
  "scientificName": "Turdus migratorius",
  "family": "Turdidae",
  "order": "Passeriformes",
  "description": "A common large thrush with a reddish-orange breast, gray back, and streaky white throat. Often seen hopping on lawns searching for earthworms. Male has darker head; female paler. Juvenile heavily spotted. Song is a cheerful caroling series of whistled phrases.",
  "sizeRange": {
    "length": "23-28 cm",
    "wingspan": "31-40 cm",
    "weight": "77-85 g"
  },
  "habitatTypes": ["Urban", "Woodland", "Grassland"],
  "geographicRange": "Widespread across North America",
  "fieldMarks": ["Red breast", "Grey back", "White eye ring", "Yellow bill"],
  "plumageVariations": {
    "breeding": "Bright reddish-orange breast",
    "nonBreeding": "Slightly duller breast color",
    "juvenile": "Heavily spotted breast and back"
  },
  "similarSpecies": [/* IDs for Varied Thrush, etc. */],
  "createdAt": "2025-12-23T00:00:00Z",
  "updatedAt": "2025-12-23T00:00:00Z"
}
```

### Search Query Example
```json
{
  "id": 42,
  "queryText": "red chest with grey back",
  "normalizedText": "red chest with grey back",
  "embedding": [0.023, -0.145, 0.098, /* ... 1533 more values */],
  "resultCount": 5,
  "topResults": [1, 15, 23, 44, 67],
  "timestamp": "2025-12-23T14:32:15Z",
  "responseTime": 847,
  "userAgent": "Mozilla/5.0...",
  "wasSuccessful": true
}
```

---

## Next Steps

Data model complete. Proceed to:
1. Generate API contracts (OpenAPI spec for RESTful endpoints)
2. Create quickstart guide for developers
3. Update agent context with architecture decisions
