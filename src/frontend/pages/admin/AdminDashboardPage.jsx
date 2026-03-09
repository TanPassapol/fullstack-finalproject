import { useState, useEffect } from 'react';
import api from '../../api';
import Spinner from '../../components/shared/Spinner';

const METRICS = [
  { key: 'totalBooks',    label: 'Total Books',    icon: '📚', color: '#d4a853' },
  { key: 'totalUsers',    label: 'Total Users',    icon: '👥', color: '#4ecdc4' },
  { key: 'activeBorrows', label: 'Active Borrows', icon: '📖', color: '#5cb85c' },
  { key: 'overdueCount',  label: 'Overdue',        icon: '⚠️', color: '#e05c5c' },
];

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!stats)  return <p className="text-red-400 text-center py-10">Failed to load stats.</p>;

  const utilization = stats.totalBooks    > 0 ? Math.round((stats.activeBorrows / stats.totalBooks)    * 100) : 0;
  const overdueRate = stats.activeBorrows > 0 ? Math.round((stats.overdueCount  / stats.activeBorrows) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {METRICS.map(m => (
          <div key={m.key} className="bg-vault-card border border-vault-border rounded-xl p-5">
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="font-display text-3xl font-bold" style={{ color: m.color }}>{stats[m.key] ?? 0}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-vault-card border border-vault-border rounded-xl p-5">
        <h3 className="font-semibold text-vault-cream mb-4">Overview</h3>
        {[
          { label: 'Inventory Utilization', value: utilization, color: '#d4a853' },
          { label: 'Overdue Rate',          value: overdueRate,  color: '#e05c5c' },
        ].map(kpi => (
          <div key={kpi.label} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{kpi.label}</span>
              <span style={{ color: kpi.color }}>{kpi.value}%</span>
            </div>
            <div className="cpu-bar">
              <div className="cpu-fill" style={{ width: `${kpi.value}%`, background: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {stats.recentTransactions?.length > 0 && (
        <div className="bg-vault-card border border-vault-border rounded-xl p-5">
          <h3 className="font-semibold text-vault-cream mb-3">Recent Borrows</h3>
          <div className="space-y-2">
            {stats.recentTransactions.map(tx => (
              <div key={tx._id} className="flex items-center gap-3 text-sm py-1 border-b border-vault-border/40 last:border-0">
                <span className="text-vault-amber">📖</span>
                <span className="text-vault-cream flex-1">{tx.book?.title}</span>
                <span className="text-gray-400 text-xs">{tx.user?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}