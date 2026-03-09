import { useState } from 'react';
import { MOCK_USERS } from '../../data/mockData';
import Badge from '../../components/shared/Badge';
import { formatDate } from '../../shared/utils';

const ROLE_COLORS = { admin: 'text-red-400', librarian: 'text-vault-amber', user: 'text-vault-teal' };

export default function AdminUsersPage() {
  const [users,  setUsers]  = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = (userId, role) => {
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
  };

  const toggleActive = (userId) => {
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-vault-cream">
          User Management{' '}
          <span className="text-sm font-normal text-gray-500 font-sans">(RBAC)</span>
        </h2>
        <input
          className="input-field text-sm"
          style={{ width: '220px' }}
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vault-border">
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 font-medium py-2 px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user._id} className="border-b border-vault-border/50 hover:bg-vault-card/50">
                {/* Name + avatar */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-vault-muted flex items-center justify-center text-sm font-semibold text-vault-amber">
                      {user.name[0]}
                    </div>
                    <span className="font-medium text-vault-cream">{user.name}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-gray-400">{user.email}</td>

                {/* Role select — RBAC */}
                <td className="py-3 px-3">
                  <select
                    className="bg-vault-bg border border-vault-border rounded px-2 py-1 text-xs"
                    style={{ color: ROLE_COLORS[user.role] || '#e8e4d9' }}
                    value={user.role}
                    onChange={(e) => changeRole(user._id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="librarian">librarian</option>
                    <option value="admin">admin</option>
                  </select>
                </td>

                <td className="py-3 px-3">
                  <span className={`badge ${user.isActive ? 'badge-available' : 'badge-overdue'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="py-3 px-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>

                <td className="py-3 px-3">
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(user._id)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
