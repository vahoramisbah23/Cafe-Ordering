import React from 'react';
import { Coffee, ShoppingBag, ClipboardList, ShieldCheck, User, LogOut, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { totalItemCount, subtotal, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, isCustomer, logout, openAuthModal } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand Logo */}
        <a
          href="#home"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            if (isAdmin) {
              setActiveTab('admin');
            } else {
              setActiveTab('menu');
            }
          }}
        >
          <div className="brand-icon-wrapper">
            <Coffee size={24} />
          </div>
          <div>
            <div className="brand-title">CAFE POINT</div>
            <div className="brand-tagline">Fresh Brews · Maggi · Burgers · Thick Shakes</div>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="nav-actions">
          {/* Customer Tabs (Strictly Customer Only - Never Admin) */}
          {!isAdmin && isCustomer && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
                onClick={() => setActiveTab('customer')}
              >
                <ClipboardList size={18} />
                <span>My Orders & Live Track</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <Coffee size={18} />
                <span>Café Menu (Order)</span>
              </button>

              {/* Shopping Cart button (Customer Only) */}
              <button
                className="cart-toggle-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={19} />
                <span className="cart-text-label">Cart</span>
                {totalItemCount > 0 && (
                  <span className="cart-count-badge">{totalItemCount}</span>
                )}
                {subtotal > 0 && (
                  <span style={{ fontSize: '0.85rem', opacity: 0.9, marginLeft: '2px' }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            </>
          )}

      
         

      
        </nav>
      </div>
    </header>
  );
};
