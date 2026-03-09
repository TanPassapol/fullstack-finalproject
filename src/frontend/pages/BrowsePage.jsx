import { useState, useEffect } from 'react';
import api from '../api';
import BookCard        from '../components/user/BookCard';
import BookDetailModal from '../components/user/BookDetailModal';
import Spinner         from '../components/shared/Spinner';

const GENRES = ['All','Fiction','Non-Fiction','Science Fiction','Dystopian','Technology','Philosophy','Psychology','Self-Help'];

export default function BrowsePage({ cart, setCart, onBorrow }) {
  const [books,        setBooks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [genre,        setGenre]        = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (search)          params.q     = search;
    if (genre !== 'All') params.genre = genre;
    api.get('/books', { params })
      .then(({ data }) => setBooks(data.books || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [search, genre]);

  const toggleCart = (book) =>
    setCart(prev => prev.find(c => c._id === book._id)
      ? prev.filter(c => c._id !== book._id)
      : [...prev, book]);

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex gap-3 flex-wrap">
        <div className="flex-1 relative" style={{ minWidth: '200px' }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></span>
          <input className="input-field pl-9" placeholder="Search by title or author…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ width: 'auto' }}
          value={genre} onChange={e => setGenre(e.target.value)}>
          {GENRES.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              genre === g
                ? 'bg-vault-amber text-vault-bg font-semibold'
                : 'bg-vault-card border border-vault-border text-gray-400 hover:border-vault-amber hover:text-vault-amber'
            }`}>{g}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : books.length === 0 ? (
        <p className="text-gray-400 text-center py-20">No books found.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{books.length} books found</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {books.map(book => (
              <BookCard key={book._id} book={book}
                inCart={cart.some(c => c._id === book._id)}
                onBorrow={onBorrow} onAddToCart={toggleCart} onView={setSelectedBook} />
            ))}
          </div>
        </>
      )}

      {selectedBook && (
        <BookDetailModal book={selectedBook}
          inCart={cart.some(c => c._id === selectedBook._id)}
          onClose={() => setSelectedBook(null)}
          onBorrow={onBorrow} onAddToCart={toggleCart} />
      )}
    </div>
  );
}