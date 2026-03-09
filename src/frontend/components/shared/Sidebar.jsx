import { useAuth } from '../../context/AuthContext';

const USER_NAV = [
  { id: 'browse',    label: 'Browse Books', icon: '🔍' },
  { id: 'bookshelf', label: 'My Bookshelf', icon: '📖' },
  { id: 'cart',      label: 'Borrow Cart',  icon: '🛒' },
];

const ADMIN_NAV = [
  { id: 'admin-dashboard',    label: 'Dashboard',      icon: '📊' },
  { id: 'admin-inventory',    label: 'Inventory',       icon: '📦' },
  { id: 'admin-transactions', label: 'Transactions',    icon: '🔄' },
  { id: 'admin-users',        label: 'Users (RBAC)',    icon: '👥' },
  { id: 'admin-monitor',      label: 'System Monitor',  icon: '💻' },
];

function NavItem({ item, active, onClick }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
        active
          ? 'bg-vault-muted text-vault-amber font-semibold'
          : 'text-gray-400 hover:text-vault-cream hover:bg-vault-muted/50'
      }`}
      onClick={onClick}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ view, setView, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'librarian';

  const navigate = (id) => {
    setView(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} flex flex-col`}>
        {/* Logo */}
        <div className="p-5 border-b border-vault-border">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <div>
              <h1 className="font-display text-lg font-bold text-vault-gold leading-none">
                BiblioVault
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Book Borrowing System</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-vault-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-vault-muted flex items-center justify-center text-sm font-bold text-vault-amber">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-vault-cream truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider px-4 mb-2">
            Library
          </p>
          {USER_NAV.map((item) => (
            <NavItem key={item.id} item={item} active={view === item.id} onClick={() => navigate(item.id)} />
          ))}

          {isAdmin && (
            <>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider px-4 mb-2 mt-4">
                Administration
              </p>
              {ADMIN_NAV.map((item) => (
                <NavItem key={item.id} item={item} active={view === item.id} onClick={() => navigate(item.id)} />
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-vault-border">
          <button className="btn btn-danger w-full text-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
