import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useOnline }             from './hooks/useOnline.js';
import { useBorrow }             from './hooks/useBorrow.js';

import LoginPage             from './pages/LoginPage.jsx';
import BrowsePage            from './pages/BrowsePage.jsx';
import BookshelfPage         from './pages/BookshelfPage.jsx';
import CartPage              from './pages/CartPage.jsx';
import AdminDashboardPage    from './pages/admin/AdminDashboardPage.jsx';
import AdminInventoryPage    from './pages/admin/AdminInventoryPage.jsx';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage.jsx';
import AdminUsersPage        from './pages/admin/AdminUsersPage.jsx';
import AdminMonitorPage      from './pages/admin/AdminMonitorPage.jsx';
import Sidebar               from './components/shared/Sidebar.jsx';
import Toast                 from './components/shared/Toast.jsx';

const PAGE_TITLES = {
  browse:               'Browse Books',
  bookshelf:            'My Bookshelf',
  cart:                 'Borrow Cart',
  'admin-dashboard':    'Dashboard',
  'admin-inventory':    'Inventory Management',
  'admin-transactions': 'Transactions',
  'admin-users':        'User Management',
  'admin-monitor':      'System Monitor',
};

function Shell() {
  const { user }  = useAuth();
  const isOnline  = useOnline();
  const [view,        setView]        = useState('browse');
  const [cart,        setCart]        = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Each time this changes, BookshelfPage remounts and re-fetches
  const [shelfKey, setShelfKey] = useState(0);

  const onBorrowSuccess = useCallback(() => {
    setShelfKey(k => k + 1);
    setView('bookshelf');
  }, []);

  const { handleBorrow, toast } = useBorrow(onBorrowSuccess);

  const navigate = useCallback((page) => {
    if (page === 'bookshelf') setShelfKey(k => k + 1);
    setView(page);
    setSidebarOpen(false);
  }, []);

  if (!user) return <LoginPage />;

  const pages = {
    browse:               <BrowsePage   cart={cart} setCart={setCart} onBorrow={handleBorrow} />,
    bookshelf:            <BookshelfPage key={shelfKey} />,
    cart:                 <CartPage     cart={cart} setCart={setCart} onBorrow={handleBorrow} />,
    'admin-dashboard':    <AdminDashboardPage />,
    'admin-inventory':    <AdminInventoryPage />,
    'admin-transactions': <AdminTransactionsPage />,
    'admin-users':        <AdminUsersPage />,
    'admin-monitor':      <AdminMonitorPage />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={navigate} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content flex-1 flex flex-col">
        {!isOnline && <div className="offline-banner">📵 You are offline</div>}
        <header className="bg-vault-surface border-b border-vault-border px-5 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button className="md:hidden text-gray-400 hover:text-white text-xl" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="font-display font-bold text-vault-cream flex-1">{PAGE_TITLES[view]}</h1>
          {view === 'browse' && (
            <button className="btn btn-secondary btn-sm relative" onClick={() => navigate('cart')}>
              🛒 Cart
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-vault-amber text-vault-bg text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </header>
        <div className="p-5 flex-1 max-w-7xl w-full mx-auto">
          {pages[view] ?? <p className="text-gray-400 text-center py-20">Page not found</p>}
        </div>
      </main>
      <Toast message={toast} />
    </div>
  );
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}