import { useState, useEffect } from 'react';
import api from '../../api';
import BookCover from '../../components/shared/BookCover';
import Badge    from '../../components/shared/Badge';
import Spinner  from '../../components/shared/Spinner';
import { formatDate, daysUntil } from '../../shared/utils';

const FILTERS = ['all', 'borrowed', 'overdue', 'returned'];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/transactions')
      .then(({ data }) => setTransactions(data.transactions || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markReturned = async (tx) => {
    try {
      await api.post(`/transactions/return/${tx._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark returned.');
    }
  };

  const now = Date.now();

  const visible = transactions.filter(t => {
    if (filter === 'overdue') return t.status === 'borrowed' && new Date(t.dueDate) < now;
    if (filter === 'all')     return true;
    return t.status === filter;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream-900">Transaction Management</h2>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f}
              className={`btn btn-sm capitalize ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map(tx => {
          const isOverdue = tx.status === 'borrowed' && new Date(tx.dueDate) < now;
          const daysDiff  = Math.abs(daysUntil(tx.dueDate));
          return (
            <div key={tx._id}
              className={`bg-vault-card border rounded-xl p-4 flex gap-4 items-center ${isOverdue ? 'border-red-800/50' : 'border-vault-border'}`}>
              <BookCover book={tx.book} className="w-12 h-16 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-vault-cream">{tx.book?.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">by {tx.book?.author}</p>
                  </div>
                  <Badge status={isOverdue ? 'overdue' : tx.status} />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                  <span>👤 {tx.user?.name || 'User'}</span>
                  <span>📅 {formatDate(tx.borrowedAt)}</span>
                  <span>Due: <span className={isOverdue ? 'text-red-400' : 'text-vault-amber'}>{formatDate(tx.dueDate)}</span></span>
                  {isOverdue && <span className="text-red-400 font-medium">⚠️ {daysDiff}d · ${(daysDiff * 0.5).toFixed(2)}</span>}
                </div>
              </div>
              {tx.status !== 'returned' && (
                <button className="btn btn-secondary btn-sm flex-shrink-0" onClick={() => markReturned(tx)}>
                  Mark Returned
                </button>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <p className="text-center text-gray-500 py-10">No transactions found.</p>}
      </div>
    </div>
  );
}