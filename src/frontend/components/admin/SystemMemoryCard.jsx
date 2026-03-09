import { formatBytes } from '../../shared/utils';

/** Renders a donut chart + breakdown for memory stats. */
export default function SystemMemoryCard({ sys }) {
  const used    = parseFloat(sys.memory.usagePercent);
  const circumference = 188.5; // 2π × 30

  return (
    <div className="bg-vault-card border border-vault-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-vault-cream">Memory</h3>
        <span className="font-mono text-lg font-bold text-vault-amber">{used.toFixed(1)}%</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* Donut */}
        <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#1e2435" strokeWidth="10" />
          <circle
            cx="40" cy="40" r="30"
            fill="none" stroke="#d4a853" strokeWidth="10"
            strokeDasharray={`${circumference * used / 100} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dasharray 0.5s' }}
          />
          <text x="40" y="45" textAnchor="middle" fill="#d4a853" fontSize="12" fontWeight="bold">
            {used.toFixed(0)}%
          </text>
        </svg>

        {/* Breakdown */}
        <div className="space-y-2 flex-1">
          {[
            { label: 'Used',  value: formatBytes(sys.memory.used),  color: '#d4a853' },
            { label: 'Free',  value: formatBytes(sys.memory.free),  color: '#4ecdc4' },
            { label: 'Total', value: formatBytes(sys.memory.total), color: '#6b7280' },
          ].map((m) => (
            <div key={m.label} className="flex justify-between">
              <span className="text-xs text-gray-400">{m.label}</span>
              <span className="font-mono text-xs" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Load average */}
      <div className="border-t border-vault-border pt-3">
        <p className="text-xs text-gray-500 mb-2">Load Average</p>
        <div className="flex gap-4">
          {sys.loadAvg.map((v, i) => (
            <div key={i} className="text-center">
              <p className="font-mono text-sm text-vault-teal">{v.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{['1m', '5m', '15m'][i]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
