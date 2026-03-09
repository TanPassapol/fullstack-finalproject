import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useOnline } from './hooks/useOnline';
import { useBorrow } from './hooks/useBorrow';
import { MOCK_TRANSACTIONS } from './data/mockData';

import LoginPage    from './pages/LoginPage';
import BrowsePage   from './pages/BrowsePage';
import BookshelfPage from './pages/BookshelfPage';
import CartPage     from './pages/CartPage';
import AdminDashboardPage    from './pages/admin/AdminDashboardPage';
import AdminInventoryPage    from './pages/admin/AdminInventoryPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminUsersPage        from './pages/admin/AdminUsersPage';
import AdminMonitorPage      from './pages/admin/AdminMonitorPage';

import Sidebar from './components/shared/Sidebar';
import Toast   from './components/shared/Toast';

const PAGE_TITLES = {
  browse:                'Browse Books',
  bookshelf:             'My Bookshelf',
  cart:                  'Borrow Cart',
  'admin-dashboard':     'Dashboard',
  'admin-inventory':     'Inventory Management',
  'admin-transactions':  'Transactions',
  'admin-users':         'User Management',
  'admin-monitor':       'System Monitor',
};

function Shell() {
  const { user } = useAuth();
  const isOnline = useOnline();

  const [view,         setView]         = useState('browse');
  const [cart,         setCart]         = useState([]);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const { handleBorrow, toast } = useBorrow(transactions, setTransactions);

  if (!user) return <LoginPage />;

  const pages = {
    browse:               <BrowsePage   cart={cart} setCart={setCart} onBorrow={handleBorrow} />,
    bookshelf:            <BookshelfPage transactions={transactions} setTransactions={setTransactions} />,
    cart:                 <CartPage     cart={cart} setCart={setCart} onBorrow={handleBorrow} />,
    'admin-dashboard':    <AdminDashboardPage />,
    'admin-inventory':    <AdminInventoryPage />,
    'admin-transactions': <AdminTransactionsPage />,
    'admin-users':        <AdminUsersPage />,
    'admin-monitor':      <AdminMonitorPage />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        view={view}
        setView={setView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main-content flex-1 flex flex-col">
        {/* Offline banner */}
        {!isOnline && (
          <div className="offline-banner">📵 You are offline — showing cached data</div>
        )}

        {/* Top bar */}
        <header className="bg-vault-surface border-b border-vault-border px-5 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            className="md:hidden text-gray-400 hover:text-white text-xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h1 className="font-display font-bold text-vault-cream flex-1">
            {PAGE_TITLES[view]}
          </h1>

          {/* Cart shortcut */}
          {view === 'browse' && (
            <button
              className="btn btn-secondary btn-sm relative"
              onClick={() => setView('cart')}
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-vault-amber text-vault-bg text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </header>

        {/* Page content */}
        <div className="p-5 flex-1 max-w-7xl w-full mx-auto">
          {pages[view] ?? (
            <p className="text-gray-400 text-center py-20">Page not found</p>
          )}
        </div>
      </main>

      {/* Global toast */}
      <Toast message={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
