import { useState, useRef } from 'react';
import Spinner from '../shared/Spinner';

/**
 * File-picker button that parses a JSON array of books and calls `onResult`
 * with { created, failed, total }.
 *
 * In production wire `onResult` to the bulkUploadBooks() helper from api.js,
 * which chunks requests and retries with exponential back-off via Axios interceptors.
 */
export default function BulkUploadButton({ onResult }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const books = Array.isArray(data) ? data : [data];
        const created = books.filter((b) => b.title && b.author).length;
        const failed  = books.filter((b) => !b.title || !b.author);
        onResult({ created, failed, total: books.length, books });
      } catch {
        onResult({ error: 'Invalid JSON file. Please upload a valid JSON array of books.' });
      }
      setUploading(false);
      // Reset so the same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <label className="btn btn-secondary cursor-pointer text-sm flex items-center gap-2">
      {uploading ? <Spinner size="sm" /> : '📤 Bulk Upload'}
      <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
    </label>
  );
}
