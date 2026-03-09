import { MOCK_ADMIN_STATS } from '../../data/mockData';

const METRICS = [
  { key: 'totalBooks',    label: 'Total Books',    icon: '📚', color: '#d4a853' },
  { key: 'totalUsers',    label: 'Total Users',    icon: '👥', color: '#4ecdc4' },
  { key: 'activeBorrows', label: 'Active Borrows', icon: '📖', color: '#5cb85c' },
  { key: 'overdueCount',  label: 'Overdue',        icon: '⚠️', color: '#e05c5c' },
];

const KPI_BARS = [
  { label: 'Inventory Utilization', value: 72, color: '#d4a853' },
  { label: 'Return Rate (30d)',      value: 89, color: '#4ecdc4' },
  { label: 'User Satisfaction',     value: 94, color: '#5cb85c' },
];

export default function AdminDashboardPage() {
  const stats = MOCK_ADMIN_STATS;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <div key={m.key} className="bg-vault-card border border-vault-border rounded-xl p-5">
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="font-display text-3xl font-bold" style={{ color: m.color }}>
              {stats[m.key]}
            </div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* KPI bars */}
      <div className="bg-vault-card border border-vault-border rounded-xl p-5">
        <h3 className="font-semibold text-vault-cream mb-4">Quick Overview</h3>
        <div className="space-y-4">
          {KPI_BARS.map((kpi) => (
            <div key={kpi.label}>
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
      </div>
    </div>
  );
}
