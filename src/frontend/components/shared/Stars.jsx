import { useState } from 'react';

/**
 * Renders up to `max` stars.
 * If `onRate` is provided the stars become interactive (click to rate).
 */
export default function Stars({ rating, max = 5, onRate }) {
  const [hover, setHover] = useState(0);
  const filled = hover || Math.round(rating);

  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={`rating-star ${i < filled ? 'active' : ''}`}
          onClick={() => onRate && onRate(i + 1)}
          onMouseEnter={() => onRate && setHover(i + 1)}
          onMouseLeave={() => onRate && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
