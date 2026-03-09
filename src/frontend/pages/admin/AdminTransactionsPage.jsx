import { useState, useMemo } from 'react';
import { MOCK_ADMIN_TRANSACTIONS } from '../../data/mockData';
import BookCover from '../../components/shared/BookCover';
import Badge from '../../components/shared/Badge';
import { formatDate, daysUntil } from '../../shared/utils';

const FILTERS = ['all', 'borrowed', 'overdue', 'returned'];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState(MOCK_ADMIN_TRANSACTIONS);
  const [filter,       setFilter]       = useState('all');

  // Capture current time once per render — avoids calling Date.now() impurely
  // during JSX evaluation which React flags as a side effect in strict mode.
  const now = useMemo(() => new Date(), []);

  const markReturned = (tx) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t._id === tx._id ? { ...t, status: 'returned', returnedAt: new Date() } : t
      )
    );
  };

  const visible = transactions.filter((t) => {
    if (filter === 'all')     return true;
    if (filter === 'overdue') return t.status === 'borrowed' && new Date(t.dueDate) < now;
    return t.status === filter;
  });

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream">Transaction Management</h2>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`btn btn-sm capitalize ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((tx) => {
          const isOverdue     = tx.status === 'borrowed' && new Date(tx.dueDate) < now;
          const displayStatus = isOverdue ? 'overdue' : tx.status;
          const daysDiff      = Math.abs(daysUntil(tx.dueDate));

          return (
            <div
              key={tx._id}
              className={`bg-vault-card border rounded-xl p-4 flex gap-4 items-center ${
                isOverdue ? 'border-red-800/50' : 'border-vault-border'
              }`}
            >
              <BookCover book={tx.book} className="w-12 h-16 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-vault-cream">{tx.book.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">by {tx.book.author}</p>
                  </div>
                  <Badge status={displayStatus} />
                </div>

                <div className="flex gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                  <span>👤 {tx.user?.name || 'User'}</span>
                  <span>📅 Borrowed: {formatDate(tx.borrowedAt)}</span>
                  <span>
                    Due:{' '}
                    <span className={isOverdue ? 'text-red-400' : 'text-vault-amber'}>
                      {formatDate(tx.dueDate)}
                    </span>
                  </span>
                  {isOverdue && (
                    <span className="text-red-400 font-medium">
                      ⚠️ {daysDiff} days overdue · Fine: ${(daysDiff * 0.5).toFixed(2)}
                    </span>
                  )}
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

        {visible.length === 0 && (
          <p className="text-center text-gray-500 py-10">No transactions found.</p>
        )}
      </div>
    </div>
  );
}
