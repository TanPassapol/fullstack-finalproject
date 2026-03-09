import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/shared/Spinner';

export default function LoginPage() {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #1a1428 0%, #0b0d14 60%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="font-display text-3xl font-bold text-vault-gold">BiblioVault</h1>
          <p className="text-gray-400 text-sm mt-1">Book Borrowing System</p>
        </div>

        {/* Card */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </button>

          {/* Demo shortcuts */}
          <div className="border-t border-vault-border pt-4 space-y-2">
            <p className="text-xs text-gray-500 text-center font-mono">Demo credentials</p>
            <button
              className="w-full text-xs bg-vault-surface border border-vault-border rounded px-3 py-2 text-left hover:border-vault-amber transition-colors"
              onClick={() => fillDemo('admin@bibliovault.com', 'Admin@123')}
            >
              🔐 Admin: admin@bibliovault.com / Admin@123
            </button>
            <button
              className="w-full text-xs bg-vault-surface border border-vault-border rounded px-3 py-2 text-left hover:border-vault-teal transition-colors"
              onClick={() => fillDemo('user@bibliovault.com', 'User@123')}
            >
              👤 User: user@bibliovault.com / User@123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
