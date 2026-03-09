const COVER_COLORS = [
  '#1a2a4a', '#2a1a3a', '#1a3a2a',
  '#3a2a1a', '#2a3a1a', '#1a2a3a',
];

/**
 * Renders a stylised cover when no real cover image is available.
 * Colour is deterministic based on book._id so it stays consistent.
 */
export default function BookCover({ book, className = '' }) {
  const bg = COVER_COLORS[book._id.charCodeAt(0) % COVER_COLORS.length];

  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center p-3 rounded-lg overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Subtle diagonal stripe texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        }}
      />
      <div className="font-display text-vault-gold text-xs font-bold leading-tight z-10 line-clamp-3">
        {book.title}
      </div>
      <div className="text-gray-400 text-xs mt-1 z-10">{book.author}</div>
    </div>
  );
}
