import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import BookCover from '../shared/BookCover';
import Stars from '../shared/Stars';
import Badge from '../shared/Badge';
import { formatDate } from '../../shared/utils';

export default function BookDetailModal({ book, onClose, onBorrow, onAddToCart, inCart }) {
  const { user } = useAuth();
  const [reviews,  setReviews]  = useState([]);
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/reviews?bookId=${book._id}`)
      .then(({ data }) => setReviews(data.reviews || data))
      .catch(() => setReviews([]));
  }, [book._id]);

  const submitReview = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookId: book._id, rating, comment });
      const { data } = await api.get(`/reviews?bookId=${book._id}`);
      setReviews(data.reviews || data);
      setRating(0);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box p-6" onClick={(e) => e.stopPropagation()}>

        <div className="flex gap-4 mb-4">
          <BookCover book={book} className="w-32 h-44 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-vault-cream">{book.title}</h2>
            <p className="text-vault-amber mt-1">{book.author}</p>

            <div className="flex items-center gap-2 mt-2">
              <Stars rating={book.avgRating} />
              <span className="text-sm text-gray-400">
                {book.avgRating?.toFixed(1)} · {book.ratingCount} reviews
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge bg-vault-muted text-gray-300 text-xs px-2 py-0.5 rounded">
                {book.genre}
              </span>
              {book.publishYear && (
                <span className="text-xs text-gray-500">
                  {book.publishYear > 0 ? book.publishYear : `${Math.abs(book.publishYear)} BC`}
                </span>
              )}
              {book.pages && (
                <span className="text-xs text-gray-500">{book.pages} pages</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Badge status={book.available > 0 ? 'available' : 'borrowed'} />
              <span className="text-xs text-gray-400">{book.available}/{book.totalCopies} copies</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-4">{book.description}</p>

        {user && (
          <div className="flex gap-2 mb-5">
            <button className="btn btn-secondary btn-sm flex-1" onClick={() => onAddToCart(book)}>
              {inCart ? '✓ In Cart' : '+ Add to Cart'}
            </button>
            {book.available > 0 && (
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={() => { onBorrow(book); onClose(); }}
              >
                Borrow Now
              </button>
            )}
          </div>
        )}

        <div className="border-t border-vault-border pt-4">
          <h3 className="font-semibold text-vault-cream mb-3">Reviews</h3>

          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
          )}

          <div className="space-y-3 max-h-40 overflow-y-auto">
            {reviews.map((r) => (
              <div key={r._id} className="bg-vault-bg rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-gray-400">{r.user?.name || 'Reader'}</span>
                  <span className="text-xs text-gray-600 ml-auto">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-300">{r.comment}</p>
              </div>
            ))}
          </div>

          {user && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your rating:</span>
                <Stars rating={rating} onRate={setRating} />
              </div>
              <textarea
                className="input-field text-sm resize-none h-16"
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm w-full"
                disabled={!rating || submitting}
                onClick={submitReview}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}