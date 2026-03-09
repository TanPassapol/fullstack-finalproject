import { useMemo } from 'react';
import TransactionRow from '../components/user/TransactionRow';
import Badge from '../components/shared/Badge';
import { formatDate } from '../shared/utils';

export default function BookshelfPage({ transactions, setTransactions }) {
  // Capture current time once per render — avoids calling Date.now() impurely
  // inside filter/map during JSX evaluation, which React flags in strict mode.
  const now = useMemo(() => Date(), []);

  const overdue = transactions.filter(
    (t) => t.status === 'borrowed' && new Date(t.dueDate) < now
  );
  const active = transactions.filter(
    (t) => t.status === 'borrowed' && new Date(t.dueDate) >= now
  );
  const history = transactions.filter((t) => t.status === 'returned');

  const handleReturn = (tx) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t._id === tx._id ? { ...t, status: 'returned', returnedAt: new Date() } : t
      )
    );
  };

  const handleRenew = (tx) => {
    if (tx.renewCount >= 2) { alert('Maximum renewals (2) reached.'); return; }
    setTransactions((prev) =>
      prev.map((t) =>
        t._id === tx._id
          ? { ...t, dueDate: new Date(new Date(t.dueDate).getTime() + 7 * 86400000), renewCount: t.renewCount + 1 }
          : t
      )
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Loans', value: active.length,  color: '#d4a853', icon: '📖' },
          { label: 'Overdue',      value: overdue.length, color: '#e05c5c', icon: '⚠️' },
          { label: 'Returned',     value: history.length, color: '#4ecdc4', icon: '✓'  },
        ].map((s) => (
          <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue alert banner */}
      {overdue.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-400">
              You have {overdue.length} overdue book{overdue.length > 1 ? 's' : ''}!
            </p>
            <p className="text-sm text-red-300/70 mt-0.5">
              A fine of $0.50/day is applied for overdue books.
            </p>
          </div>
        </div>
      )}

      {/* Active borrows */}
      {active.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-vault-cream mb-3">Currently Borrowed</h2>
          <div className="space-y-3">
            {active.map((tx) => (
              <TransactionRow key={tx._id} tx={tx} isOverdue={false} onReturn={handleReturn} onRenew={handleRenew} />
            ))}
          </div>
        </section>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-red-400 mb-3">Overdue Books</h2>
          <div className="space-y-3">
            {overdue.map((tx) => (
              <TransactionRow key={tx._id} tx={tx} isOverdue onReturn={handleReturn} onRenew={handleRenew} />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-vault-cream mb-3">Return History</h2>
          <div className="space-y-2">
            {history.map((tx) => (
              <div key={tx._id} className="bg-vault-surface border border-vault-border rounded-lg p-3 flex items-center gap-4">
                <span className="text-vault-teal text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-vault-cream">{tx.book.title}</p>
                  <p className="text-xs text-gray-400">Returned {formatDate(tx.returnedAt)}</p>
                </div>
                <Badge status="returned" />
              </div>
            ))}
          </div>
        </section>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="font-display text-2xl text-vault-cream mb-2">No books yet</h2>
          <p className="text-gray-400">Browse the library and borrow your first book!</p>
        </div>
      )}
    </div>
  );
}