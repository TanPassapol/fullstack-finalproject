import { useState } from 'react';
import { MOCK_BOOKS, GENRES } from '../data/mockData';
import BookCard from '../components/user/BookCard';
import BookDetailModal from '../components/user/BookDetailModal';

export default function BrowsePage({ cart, setCart, onBorrow }) {
  const [search,       setSearch]       = useState('');
  const [genre,        setGenre]        = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);

  const filtered = MOCK_BOOKS.filter((b) => {
    const q = search.toLowerCase();
    return (
      (genre === 'All' || b.genre === genre) &&
      (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    );
  });

  const toggleCart = (book) => {
    setCart((prev) =>
      prev.find((c) => c._id === book._id)
        ? prev.filter((c) => c._id !== book._id)
        : [...prev, book]
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Search + filter row */}
      <div className="mb-5 flex gap-3 flex-wrap">
        <div className="flex-1 relative" style={{ minWidth: '200px' }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            className="input-field pl-9"
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: 'auto' }}
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      {/* Genre chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {GENRES.map((g) => (
          <button
            key={g}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              genre === g
                ? 'bg-vault-amber text-vault-bg font-semibold'
                : 'bg-vault-card border border-vault-border text-gray-400 hover:border-vault-amber hover:text-vault-amber'
            }`}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} books found</p>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
      >
        {filtered.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            inCart={cart.some((c) => c._id === book._id)}
            onBorrow={onBorrow}
            onAddToCart={toggleCart}
            onView={setSelectedBook}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          inCart={cart.some((c) => c._id === selectedBook._id)}
          onClose={() => setSelectedBook(null)}
          onBorrow={onBorrow}
          onAddToCart={toggleCart}
        />
      )}
    </div>
  );
}
