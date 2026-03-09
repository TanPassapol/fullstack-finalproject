import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import SystemCpuCard    from '../../components/admin/SystemCpuCard';
import SystemMemoryCard from '../../components/admin/SystemMemoryCard';
import Spinner          from '../../components/shared/Spinner';

function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-vault-card border border-vault-border rounded-xl p-4">
      <div className="text-xl mb-1">{icon}</div>
      <p className="font-mono text-xs text-vault-teal">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminMonitorPage() {
  const [sys,     setSys]     = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetch = () =>
      api.get('/monitor/system')
        .then(({ data }) => { setSys(data); setLoading(false); })
        .catch(() => setLoading(false));

    fetch();
    intervalRef.current = setInterval(fetch, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!sys)    return <p className="text-red-400 text-center py-10">Could not reach system monitor.</p>;

  const uptimeH = Math.floor(sys.uptime / 3600);
  const uptimeM = Math.floor((sys.uptime % 3600) / 60);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-xl font-bold text-vault-cream-900">System Monitor</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoTile icon="🖥"  label="Hostname" value={sys.hostname} />
        <InfoTile icon="⚙️" label="Platform"  value={`${sys.platform} / ${sys.arch}`} />
        <InfoTile icon="📦" label="Node.js"   value={sys.nodeVersion} />
        <InfoTile icon="⏱"  label="Uptime"   value={`${uptimeH}h ${uptimeM}m`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SystemCpuCard    sys={sys} />
        <SystemMemoryCard sys={sys} />
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-4 font-mono text-xs text-gray-400 flex gap-6 flex-wrap">
        <span>PID: <span className="text-vault-teal">{sys.pid}</span></span>
        <span>Node: <span className="text-vault-teal">{sys.nodeVersion}</span></span>
        <span>Refresh: <span className="text-green-400">every 2s</span></span>
        <span className="ml-auto text-gray-600">Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}