import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  title: '', author: '', genre: 'Fiction', description: '',
  totalCopies: 1, available: 1, publishYear: '', pages: '',
};

/**
 * Reusable modal form for adding a new book or editing an existing one.
 * `initialBook` – when provided, the form is pre-filled (edit mode).
 */
export default function BookFormModal({ initialBook = null, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialBook) {
      setForm({
        title:       initialBook.title       || '',
        author:      initialBook.author      || '',
        genre:       initialBook.genre       || 'Fiction',
        description: initialBook.description || '',
        totalCopies: initialBook.totalCopies || 1,
        available:   initialBook.available   || 1,
        publishYear: initialBook.publishYear || '',
        pages:       initialBook.pages       || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialBook]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    onSave({ ...form, totalCopies: +form.totalCopies, available: +form.available });
  };

  return (
    <div className="bg-vault-card border border-vault-border rounded-xl p-5 mb-5 animate-slide-up">
      <h3 className="font-semibold text-vault-cream mb-4">
        {initialBook ? 'Edit Book' : 'Add New Book'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Full-width fields */}
        {[['title', 'Title', 'text', true], ['author', 'Author', 'text', true]].map(([k, l, t, req]) => (
          <div key={k} className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">{l}{req && ' *'}</label>
            <input type={t} className="input-field text-sm" value={form[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}

        {/* Half-width fields */}
        {[['genre', 'Genre', 'text'], ['publishYear', 'Publish Year', 'number'], ['pages', 'Pages', 'number']].map(([k, l, t]) => (
          <div key={k}>
            <label className="text-xs text-gray-400 mb-1 block">{l}</label>
            <input type={t} className="input-field text-sm" value={form[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Total Copies *</label>
          <input
            type="number" min="1"
            className="input-field text-sm"
            value={form.totalCopies}
            onChange={(e) => set('totalCopies', +e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Available</label>
          <input
            type="number" min="0" max={form.totalCopies}
            className="input-field text-sm"
            value={form.available}
            onChange={(e) => set('available', +e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea
            className="input-field text-sm resize-none h-16"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary" onClick={handleSave}>Save Book</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
