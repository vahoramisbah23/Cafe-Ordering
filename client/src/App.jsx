import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MenuFilterBar } from './components/MenuFilterBar';
import { MenuItemCard } from './components/MenuItemCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryView } from './components/OrderHistoryView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthLandingPage } from './components/AuthLandingPage';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getMenuItems, getCategories } from './api/api';
import { AlertCircle, RefreshCw, Coffee, CheckCircle2, X } from 'lucide-react';
import './App.css';

const DEFAULT_CATEGORIES = [
  'Coffee & Hot Drinks',
  'Coolers & Refreshers',
  'Quick Bites',
  'Sandwiches & Burgers',
  'Pasta & Maggi',
  'Desserts',
];

function MainContent() {
  const { isAuthenticated, isAdmin, isCustomer } = useAuth();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'customer' | 'admin'
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemUpdateBanner, setItemUpdateBanner] = useState(null);

  // Set initial tab based on role: Admin lands in Admin Dashboard, Customer lands in Customer Dashboard
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    } else if (isCustomer) {
      setActiveTab('customer');
    }
  }, [isAdmin, isCustomer]);

  // Modals state (Customer only)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Using default categories fallback', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, fetchCategories]);

  // Fetch menu items with filters
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMenuItems({
        category: selectedCategory,
        search: searchQuery,
        sortBy: sortBy,
      });
      setMenuItems(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch café menu items.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      const debounceTimer = setTimeout(() => {
        fetchMenu();
      }, 200);
      return () => clearTimeout(debounceTimer);
    }
  }, [isAuthenticated, fetchMenu]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('');
  };

  // 1. FIRST SCREEN: If user is not logged in, show Sign In / Sign Up Gateway!
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <AuthLandingPage />
        <Toast />
      </div>
    );
  }

  // 2. AUTHENTICATED: Separate Admin and Customer Experiences
  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ADMIN: Admin adds, updates, removes items & manages customer orders (Admin CANNOT order items) */}
      {isAdmin ? (
        <main className="main-wrapper">
          <AdminDashboard
            onSwitchToCustomerView={() => {}}
            onMenuChanged={() => {
              fetchMenu();
              fetchCategories();
            }}
          />
        </main>
      ) : activeTab === 'customer' ? (
        /* CUSTOMER ORDERS & LIVE TRACKING */
        <main className="main-wrapper">
          <CustomerDashboard
            onBackToMenu={() => setActiveTab('menu')}
            onOpenCart={() => setIsCheckoutOpen(true)}
          />
        </main>
      ) : (
        /* CUSTOMER CAFÉ MENU: Customer browses, orders items, and adds to cart */
        <>
          <HeroBanner />

          <main className="main-wrapper" id="menu">
            {/* Filter, Search & Sort Toolbar */}
            <MenuFilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={menuItems.length}
            />

            {/* Status Info Bar */}
            <div className="results-info-bar">
              <div>
                Showing{' '}
                <span className="results-count">
                  {menuItems.length} {selectedCategory === 'All' ? 'handcrafted item(s)' : selectedCategory}
                </span>
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </div>

              {(selectedCategory !== 'All' || searchQuery || sortBy) && (
                <button className="reset-filter-btn" onClick={handleResetFilters}>
                  Clear all filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div className="spinner" style={{ width: '38px', height: '38px' }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Brewing your café menu fresh from database...
                </p>
              </div>
            )}

            {/* Error State with Retry Button */}
            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #f87171',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  color: '#b91c1c',
                  textAlign: 'center',
                  maxWidth: '540px',
                  margin: '2rem auto',
                }}
              >
                <AlertCircle size={36} style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Oops! Could not connect to café backend
                </h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', opacity: 0.9 }}>
                  {error}
                </p>
                <button
                  className="btn-primary"
                  onClick={fetchMenu}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={16} />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Empty Search Results */}
            {!loading && !error && menuItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon-wrap">
                  <Coffee size={36} />
                </div>
                <h3>No Menu Items Found</h3>
                <p>
                  We couldn't find any items matching your current filters. Try searching for something else or reset filters.
                </p>
                <button className="btn-secondary" onClick={handleResetFilters}>
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Customer Menu Cards Grid (with Add to Cart) */}
            {!loading && !error && menuItems.length > 0 && (
              <div className="menu-grid">
                {menuItems.map((item) => (
                  <MenuItemCard key={item._id} item={item} searchQuery={searchQuery} />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Customer Shopping Cart Drawer (Customer Only) */}
      {isCustomer && (
        <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      )}

      {/* Customer Checkout Modal (Customer Only) */}
      {isCustomer && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onViewOrders={() => setActiveTab('customer')}
          onOrderPlaced={() => {
            // Switches to customer dashboard to track order
            setActiveTab('customer');
          }}
        />
      )}

      {/* Toast Notification Floater */}
      <Toast />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
}
