import { useAuth } from '../../context/AuthContext';
import BookCover from '../shared/BookCover';
import Badge from '../shared/Badge';
import Stars from '../shared/Stars';

export default function BookCard({ book, onBorrow, onAddToCart, inCart, onView }) {
  const { user } = useAuth();
  const available = book.available > 0;

  return (
    <div
      className="book-card bg-vault-card border border-vault-border rounded-xl overflow-hidden flex flex-col cursor-pointer"
      onClick={() => onView(book)}
    >
      <BookCover book={book} className="h-40" />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-display font-bold text-vault-cream text-sm leading-snug line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">{book.author}</p>
        </div>

        <div className="flex items-center gap-2">
          <Stars rating={book.avgRating} />
          <span className="text-xs text-gray-500">
            {book.avgRating.toFixed(1)} ({book.ratingCount})
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-vault-border">
          <Badge status={available ? 'available' : 'borrowed'} />
          <span className="text-xs text-gray-500">
            {book.available}/{book.totalCopies}
          </span>
        </div>

        {user && (
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm flex-1"
              onClick={(e) => { e.stopPropagation(); onAddToCart(book); }}
            >
              {inCart ? '✓ In Cart' : '+ Cart'}
            </button>
            {available && (
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={(e) => { e.stopPropagation(); onBorrow(book); }}
              >
                Borrow
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
