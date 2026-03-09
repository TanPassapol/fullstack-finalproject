import { useState, useEffect } from 'react';
import api from '../../api';
import BookFormModal    from '../../components/admin/BookFormModal';
import BulkUploadButton from '../../components/admin/BulkUploadButton';
import Badge            from '../../components/shared/Badge';
import Spinner          from '../../components/shared/Spinner';

export default function AdminInventoryPage() {
  const [books,       setBooks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editBook,    setEditBook]    = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [bulkResult,  setBulkResult]  = useState(null);
  const [search,      setSearch]      = useState('');

  const load = () => {
    setLoading(true);
    api.get('/books', { params: { limit: 200 } })
      .then(({ data }) => setBooks(data.books || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (formData) => {
    try {
      if (editBook) await api.put(`/books/${editBook._id}`, formData);
      else          await api.post('/books', formData);
      setShowForm(false);
      setEditBook(null);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed.'); }
  };

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try { await api.delete(`/books/${book._id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed.'); }
  };

  const handleRestore = async (book) => {
    try { await api.post(`/books/restore/${book._id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Restore failed.'); }
  };

  const handleBulk = async ({ books: newBooks, error }) => {
    if (error) { setBulkResult({ error }); return; }
    try {
      const valid = (newBooks || []).filter(b => b.title && b.author);
      const { data } = await api.post('/books/bulk', { books: valid });
      setBulkResult(data);
      load();
    } catch (err) { setBulkResult({ error: err.response?.data?.error || 'Bulk failed.' }); }
  };

  const visible = books.filter(b => {
    if (showDeleted ? !b.isDeleted : b.isDeleted) return false;
    if (!search) return true;
    return b.title.toLowerCase().includes(search.toLowerCase()) ||
           b.author.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream-900">Inventory Management</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <input className="input-field text-sm" style={{ width: '180px' }}
            placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <BulkUploadButton onResult={handleBulk} />
          <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleted(v => !v)}>
            {showDeleted ? '📚 Active' : '🗑 Deleted'}
          </button>
          <button className="btn btn-primary" onClick={() => { setEditBook(null); setShowForm(true); }}>+ Add Book</button>
        </div>
      </div>

      {bulkResult && (
        <div className={`mb-4 p-3 rounded-lg border text-sm flex items-center justify-between ${bulkResult.error ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-green-900/20 border-green-700 text-green-400'}`}>
          <span>{bulkResult.error || `✅ Imported ${bulkResult.created}/${bulkResult.total} books.`}</span>
          <button className="ml-4 text-gray-400 hover:text-white" onClick={() => setBulkResult(null)}>✕</button>
        </div>
      )}

      {showForm && (
        <BookFormModal initialBook={editBook} onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditBook(null); }} />
      )}

      {loading ? <div className="flex justify-center py-10"><Spinner /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vault-border">
                {['Title','Author','Genre','Copies','Status','Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(book => (
                <tr key={book._id} className="border-b border-vault-border/50 hover:bg-vault-card/50">
                  <td className="py-2 px-3 font-medium text-vault-gray-500">{book.title}</td>
                  <td className="py-2 px-3 text-gray-400">{book.author}</td>
                  <td className="py-2 px-3 text-gray-400">{book.genre}</td>
                  <td className="py-2 px-3">
                    <span className={book.available === 0 ? 'text-red-400' : 'text-green-400'}>{book.available}</span>
                    <span className="text-gray-500">/{book.totalCopies}</span>
                  </td>
                  <td className="py-2 px-3"><Badge status={book.available > 0 ? 'available' : 'borrowed'} /></td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      {book.isDeleted
                        ? <button className="btn btn-secondary btn-sm" onClick={() => handleRestore(book)}>Restore</button>
                        : <>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditBook(book); setShowForm(true); }}>Edit</button>
                            <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(book)}>Delete</button>
                          </>
                      }
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No books found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}