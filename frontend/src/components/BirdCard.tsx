/**
 * BirdCard Component (T043)
 * 
 * Display card for individual bird search result
 * 
 * Features:
 * - Thumbnail image with fallback for null/error
 * - Common name (bold) and scientific name (italic)
 * - Up to 2 field marks
 * - Similarity score display
 * - Click handler for navigation
 */

import React, { useState } from 'react';
import type { BirdSearchResult } from '../types';

export interface BirdCardProps {
  /** Bird search result data */
  bird: BirdSearchResult;
  /** Optional click handler (receives bird ID) */
  onClick?: (birdId: string) => void;
}

export const BirdCard: React.FC<BirdCardProps> = ({ bird, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(bird.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onClick) {
      onClick(bird.id);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const showFallback = !bird.thumbnailUrl || imageError;
  const scorePercentage = Math.round(bird.score * 100);

  // Limit to 2 field marks for card display
  const displayedFieldMarks = bird.fieldMarks.slice(0, 2);

  return (
    <div
      data-testid="bird-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      style={{
        ...styles.card,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Thumbnail */}
      <div style={styles.imageContainer}>
        {showFallback ? (
          <div style={styles.fallback}>
            <span style={styles.fallbackIcon}>🐦</span>
            <span style={styles.fallbackText}>No image</span>
          </div>
        ) : (
          <img
            src={bird.thumbnailUrl!}
            alt={`${bird.commonName} - ${bird.scientificName}`}
            style={styles.image}
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Names */}
        <div style={styles.nameSection}>
          <strong style={styles.commonName}>{bird.commonName}</strong>
          <em style={styles.scientificName}>{bird.scientificName}</em>
        </div>

        {/* Field Marks */}
        {displayedFieldMarks.length > 0 && (
          <div style={styles.fieldMarksSection}>
            {displayedFieldMarks.map((mark, index) => (
              <span key={index} style={styles.fieldMark}>
                • {mark}
              </span>
            ))}
          </div>
        )}

        {/* Score */}
        <div style={styles.scoreSection}>
          <span style={styles.scoreLabel}>Match:</span>
          <span style={styles.scoreValue}>{scorePercentage}%</span>
        </div>
      </div>
    </div>
  );
};

// Basic inline styles for MVP
const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '4 / 3',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  fallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  fallbackIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  fallbackText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  nameSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  commonName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
  },
  scientificName: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  fieldMarksSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  fieldMark: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.4',
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  scoreLabel: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  scoreValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#2563eb',
  },
};
