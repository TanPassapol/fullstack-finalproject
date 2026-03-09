import { useState } from 'react';
import { MOCK_BOOKS } from '../../data/mockData';
import BookFormModal from '../../components/admin/BookFormModal';
import BulkUploadButton from '../../components/admin/BulkUploadButton';
import Badge from '../../components/shared/Badge';
import { formatDate } from '../../shared/utils';

export default function AdminInventoryPage() {
  const [books,       setBooks]       = useState(MOCK_BOOKS);
  const [deleted,     setDeleted]     = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [editBook,    setEditBook]    = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [bulkResult,  setBulkResult]  = useState(null);

  /* ── CRUD ──────────────────────────────────────────────────────────────── */
  const handleSave = (formData) => {
    if (editBook) {
      setBooks((prev) =>
        prev.map((b) => (b._id === editBook._id ? { ...b, ...formData } : b))
      );
    } else {
      setBooks((prev) => [
        ...prev,
        { ...formData, _id: Date.now().toString(), avgRating: 0, ratingCount: 0 },
      ]);
    }
    setShowForm(false);
    setEditBook(null);
  };

  const handleEdit = (book) => {
    setEditBook(book);
    setShowForm(true);
  };

  // Soft delete — moves book to deleted list (not actually removed)
  const handleDelete = (book) => {
    setBooks((prev) => prev.filter((b) => b._id !== book._id));
    setDeleted((prev) => [...prev, { ...book, deletedAt: new Date() }]);
  };

  const handleRestore = (book) => {
    setDeleted((prev) => prev.filter((b) => b._id !== book._id));
    setBooks((prev) => [...prev, book]);
  };

  /* ── Bulk upload ───────────────────────────────────────────────────────── */
  const handleBulkResult = ({ books: newBooks, created, failed, total, error }) => {
    if (error) { setBulkResult({ error }); return; }
    const valid = (newBooks || []).filter((b) => b.title && b.author);
    setBooks((prev) => [
      ...prev,
      ...valid.map((b) => ({ ...b, _id: Date.now().toString() + Math.random(), avgRating: 0, ratingCount: 0, available: b.available || 1, totalCopies: b.totalCopies || 1 })),
    ]);
    setBulkResult({ created, failed, total });
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream">Inventory Management</h2>
        <div className="flex gap-2 flex-wrap">
          <BulkUploadButton onResult={handleBulkResult} />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDeleted((v) => !v)}
          >
            {showDeleted ? '📚 Active' : '🗑 Deleted'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setEditBook(null); setShowForm(true); }}
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Bulk result banner */}
      {bulkResult && (
        <div className={`mb-4 p-3 rounded-lg border text-sm flex items-center justify-between ${
          bulkResult.error
            ? 'bg-red-900/20 border-red-700 text-red-400'
            : 'bg-green-900/20 border-green-700 text-green-400'
        }`}>
          <span>
            {bulkResult.error
              || `✅ Imported ${bulkResult.created}/${bulkResult.total} books. ${bulkResult.failed?.length || 0} failed.`}
          </span>
          <button className="text-gray-400 hover:text-white ml-4" onClick={() => setBulkResult(null)}>✕</button>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <BookFormModal
          initialBook={editBook}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditBook(null); }}
        />
      )}

      {/* ── Deleted view ──────────────────────────────────────────────────── */}
      {showDeleted ? (
        <div>
          <h3 className="font-semibold text-gray-400 mb-3">Deleted Books ({deleted.length})</h3>
          {deleted.length === 0 && <p className="text-gray-500 text-sm">No deleted books.</p>}
          <div className="space-y-2">
            {deleted.map((book) => (
              <div key={book._id} className="bg-vault-surface border border-vault-border/50 rounded-lg p-3 flex items-center gap-3 opacity-70">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 line-through">{book.title}</p>
                  <p className="text-xs text-gray-500">Deleted {formatDate(book.deletedAt)}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleRestore(book)}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Active book table ────────────────────────────────────────────── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vault-border">
                {['Title', 'Author', 'Genre', 'Copies', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b border-vault-border/50 hover:bg-vault-card/50">
                  <td className="py-2 px-3 font-medium text-vault-cream">{book.title}</td>
                  <td className="py-2 px-3 text-gray-400">{book.author}</td>
                  <td className="py-2 px-3 text-gray-400">{book.genre}</td>
                  <td className="py-2 px-3">
                    <span className={book.available === 0 ? 'text-red-400' : 'text-green-400'}>
                      {book.available}
                    </span>
                    <span className="text-gray-500">/{book.totalCopies}</span>
                  </td>
                  <td className="py-2 px-3">
                    <Badge status={book.available > 0 ? 'available' : 'borrowed'} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(book)}>Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(book)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
