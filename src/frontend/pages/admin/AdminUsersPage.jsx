import { useState, useEffect } from 'react';
import api from '../../api';
import Spinner from '../../components/shared/Spinner';
import { formatDate } from '../../shared/utils';

const ROLE_STYLES = {
  admin:     { bg: '#3b1a1a', color: '#f87171', border: '#7f1d1d' },
  librarian: { bg: '#3b2e0a', color: '#fbbf24', border: '#78350f' },
  user:      { bg: '#0a2e2e', color: '#2dd4bf', border: '#134e4a' },
};

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const load = () => {
    setLoading(true);
    api.get('/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId, role) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update role.'); }
  };

  const toggleActive = async (userId, current) => {
    try {
      await api.patch(`/users/${userId}/role`, { isActive: !current });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !current } : u));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update status.'); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream-900">
          User Management <span className="text-sm font-normal text-gray-400">(RBAC)</span>
        </h2>
        <input className="input-field text-sm" style={{ width: '220px' }}
          placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vault-border">
              {['User','Email','Role','Status','Joined','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-semibold py-3 px-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const rs = ROLE_STYLES[user.role] || ROLE_STYLES.user;
              return (
                <tr key={user._id} className="border-b border-vault-border/50 hover:bg-vault-card/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                        {user.name[0]}
                      </div>
                      <span className="font-semibold text-gray-600">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{user.email}</td>
                  <td className="py-3 px-3">
                    <select value={user.role} onChange={e => changeRole(user._id, e.target.value)}
                      style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                        borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                      <option value="user">user</option>
                      <option value="librarian">librarian</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: '600',
                      background: user.isActive ? '#052e16' : '#2d1a1a',
                      color:      user.isActive ? '#4ade80' : '#f87171',
                      border:     `1px solid ${user.isActive ? '#166534' : '#7f1d1d'}` }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => toggleActive(user._id, user.isActive)}
                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        background: user.isActive ? '#2d1a1a' : '#052e16',
                        color:      user.isActive ? '#f87171' : '#4ade80',
                        border:     `1px solid ${user.isActive ? '#7f1d1d' : '#166534'}` }}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-500 py-10">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}