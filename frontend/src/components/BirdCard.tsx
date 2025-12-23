import { Link } from 'react-router-dom';
import { BirdSearchResult } from '@shared/types';
import './BirdCard.css';

interface BirdCardProps {
  result: BirdSearchResult;
}

export function BirdCard({ result }: BirdCardProps) {
  const { bird, images, similarityScore } = result;
  const primaryImage = images.find(img => img.isPrimary) || images[0];

  return (
    <Link to={`/bird/${bird.id}`} className="bird-card">
      {primaryImage && (
        <div className="bird-card-image">
          <img
            src={primaryImage.thumbnailUrl || primaryImage.imageUrl}
            alt={bird.commonName}
            loading="lazy"
          />
        </div>
      )}
      <div className="bird-card-content">
        <h3 className="bird-card-common-name">{bird.commonName}</h3>
        <p className="bird-card-scientific-name">{bird.scientificName}</p>
        {bird.familyName && (
          <p className="bird-card-family">{bird.familyName}</p>
        )}
        {bird.habitat && (
          <p className="bird-card-habitat">{bird.habitat}</p>
        )}
        <div className="bird-card-match">
          Match: {(similarityScore * 100).toFixed(0)}%
        </div>
      </div>
    </Link>
  );
}
