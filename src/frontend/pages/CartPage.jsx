import BookCover from '../components/user/../../components/shared/BookCover';
import Badge from '../components/shared/Badge';

export default function CartPage({ cart, setCart, onBorrow }) {
  const availableBooks = cart.filter((b) => b.available > 0);

  const handleBorrowAll = () => {
    availableBooks.forEach((b) => onBorrow(b));
    setCart((prev) => prev.filter((b) => b.available <= 0));
  };

  const removeFromCart = (bookId) => {
    setCart((prev) => prev.filter((b) => b._id !== bookId));
  };

  const borrowSingle = (book) => {
    onBorrow(book);
    removeFromCart(book._id);
  };

  if (cart.length === 0) {
    return (
      <div className="animate-fade-in text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display text-2xl text-vault-cream mb-2">Your cart is empty</h2>
        <p className="text-gray-400">Browse books and add them to your borrowing cart</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-vault-cream">
          {cart.length} Book{cart.length !== 1 ? 's' : ''} in Cart
        </h2>
        {availableBooks.length > 0 && (
          <button className="btn btn-primary" onClick={handleBorrowAll}>
            Borrow All Available ({availableBooks.length})
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {cart.map((book) => (
          <div key={book._id} className="bg-vault-card border border-vault-border rounded-xl p-4 flex gap-4 items-center">
            <BookCover book={book} className="w-16 h-20 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-vault-cream truncate">{book.title}</h3>
              <p className="text-sm text-gray-400">{book.author}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={book.available > 0 ? 'available' : 'borrowed'} />
                <span className="text-xs text-gray-500">{book.available} available</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {book.available > 0 && (
                <button className="btn btn-primary btn-sm" onClick={() => borrowSingle(book)}>
                  Borrow
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(book._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
