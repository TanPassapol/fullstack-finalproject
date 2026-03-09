import { useState, useEffect } from 'react';

/**
 * Displays live CPU usage with a sparkline history chart.
 * Simulates real-time updates every 2 s; in production replace the
 * setInterval with a fetch to GET /api/monitor/system.
 */
export default function SystemCpuCard({ sys }) {
  const [history, setHistory] = useState(
    Array.from({ length: 8 }, () => parseFloat(sys.cpu.avgUsage))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHistory((prev) => [...prev.slice(-19), 20 + Math.random() * 50]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const current = history[history.length - 1];
  const cpuColor = current > 80 ? '#e05c5c' : current > 60 ? '#d4a853' : '#4ecdc4';

  return (
    <div className="bg-vault-card border border-vault-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-vault-cream">CPU Usage</h3>
        <span className="font-mono text-lg font-bold" style={{ color: cpuColor }}>
          {current.toFixed(1)}%
        </span>
      </div>

      {/* Main bar */}
      <div className="cpu-bar mb-3">
        <div className="cpu-fill" style={{ width: `${current}%` }} />
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5 h-12">
        {history.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${v}%`,
              background: `rgba(78,205,196,${0.3 + (i / history.length) * 0.7})`,
            }}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {sys.cpu.model} · {sys.cpu.cores} cores
      </p>

      {/* Per-core bars */}
      <div className="grid grid-cols-4 gap-1 mt-3">
        {sys.cpu.usage.map((u, i) => (
          <div key={i} className="text-center">
            <div className="cpu-bar">
              <div className="cpu-fill" style={{ width: `${parseFloat(u)}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">C{i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
