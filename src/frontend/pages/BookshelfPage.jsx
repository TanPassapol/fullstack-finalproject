import { useState, useEffect } from 'react';
import api from '../api';
import TransactionRow from '../components/user/TransactionRow';
import Badge          from '../components/shared/Badge';
import Spinner        from '../components/shared/Spinner';
import { formatDate } from '../shared/utils';

export default function BookshelfPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/transactions')
      .then(({ data }) => setTransactions(data.transactions || []))
      .catch(() => setError('Could not load bookshelf. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (tx) => {
    try { await api.post(`/transactions/return/${tx._id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Return failed.'); }
  };

  const handleRenew = async (tx) => {
    try { await api.post(`/transactions/renew/${tx._id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Renew failed.'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error)   return <p className="text-red-400 text-center py-10">{error}</p>;

  const now     = Date.now();
  const active  = transactions.filter(t => t.status === 'borrowed' && new Date(t.dueDate) >= now);
  const overdue = transactions.filter(t => t.status === 'borrowed' && new Date(t.dueDate) <  now);
  const history = transactions.filter(t => t.status === 'returned');

  if (transactions.length === 0) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">📚</div>
      <h2 className="font-display text-2xl text-vault-cream mb-2">No books yet</h2>
      <p className="text-gray-400">Browse the library and borrow your first book!</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',   value: active.length,  color: '#d4a853', icon: '📖' },
          { label: 'Overdue',  value: overdue.length, color: '#e05c5c', icon: '⚠️' },
          { label: 'Returned', value: history.length, color: '#4ecdc4', icon: '✓'  },
        ].map(s => (
          <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-400">You have {overdue.length} overdue book{overdue.length > 1 ? 's' : ''}!</p>
            <p className="text-sm text-red-300/70 mt-0.5">Fine: $0.50/day per book.</p>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-vault-cream mb-3">Currently Borrowed</h2>
          <div className="space-y-3">
            {active.map(tx => <TransactionRow key={tx._id} tx={tx} isOverdue={false} onReturn={handleReturn} onRenew={handleRenew} />)}
          </div>
        </section>
      )}

      {overdue.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-red-400 mb-3">Overdue</h2>
          <div className="space-y-3">
            {overdue.map(tx => <TransactionRow key={tx._id} tx={tx} isOverdue onReturn={handleReturn} onRenew={handleRenew} />)}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-vault-gray-800 mb-3">Return History</h2>
          <div className="space-y-2">
            {history.map(tx => (
              <div key={tx._id} className="bg-vault-surface border border-vault-border rounded-lg p-3 flex items-center gap-4">
                <span className="text-vault-teal text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-vault-cream">{tx.book?.title}</p>
                  <p className="text-xs text-gray-400">Returned {formatDate(tx.returnedAt)}</p>
                </div>
                <Badge status="returned" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}