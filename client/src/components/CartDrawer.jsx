import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  Package,
  Bike,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onProceedToCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    totalItemCount,
    subtotal,
    tax,
    deliveryFee,
    discountAmount,
    totalAmount,
    appliedCoupon,
    diningOption,
    setDiningOption,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) setCouponInput('');
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <ShoppingBag size={22} color="var(--espresso)" />
            <h2 className="drawer-title">Your Order Cart</h2>
            {totalItemCount > 0 && (
              <span className="cart-count-badge">{totalItemCount}</span>
            )}
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Dining Option Selector */}
          <div className="dining-selector-box">
            <button
              className={`dining-tab-btn ${diningOption === 'Dine-In' ? 'active' : ''}`}
              onClick={() => setDiningOption('Dine-In')}
            >
              <UtensilsCrossed size={15} />
              <span>Dine-In</span>
            </button>
            <button
              className={`dining-tab-btn ${diningOption === 'Takeaway' ? 'active' : ''}`}
              onClick={() => setDiningOption('Takeaway')}
            >
              <Package size={15} />
              <span>Takeaway</span>
            </button>
            <button
              className={`dining-tab-btn ${diningOption === 'Delivery' ? 'active' : ''}`}
              onClick={() => setDiningOption('Delivery')}
            >
              <Bike size={15} />
              <span>Delivery</span>
            </button>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <ShoppingBag size={36} />
              </div>
              <h3>Your cart is empty</h3>
              <p>
                Looks like you haven't selected any artisan brews or pastries yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item-card">
                  <img
                    src={item.image || '/images/hot-coffee.jpg'}
                    alt={item.name}
                    className="cart-item-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/hot-coffee.jpg';
                    }}
                  />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-unit-price">
                      ₹{Number(item.price).toLocaleString('en-IN')} each
                    </span>

                    <div className="cart-item-bottom">
                      <div className="quantity-stepper">
                        <button
                          className="stepper-btn"
                          onClick={() => decrementQuantity(item._id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="stepper-count">{item.quantity}</span>
                        <button
                          className="stepper-btn"
                          onClick={() => incrementQuantity(item._id)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="cart-item-total">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item._id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coupon Code Section */}
          {cartItems.length > 0 && (
            <div>
              {appliedCoupon ? (
                <div className="coupon-applied-chip">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} />
                    <span>
                      {appliedCoupon.code} applied ({appliedCoupon.discountPercent}% OFF)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-form-box" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    className="coupon-input"
                    placeholder="Promo code (e.g. COFFEE10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="coupon-apply-btn">
                    Apply
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer with Calculations */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="calc-row">
              <span>Subtotal ({totalItemCount} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="calc-row">
              <span>Estimated GST (5%)</span>
              <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {diningOption === 'Delivery' && (
              <div className="calc-row">
                <span>Delivery Charges {subtotal >= 199 ? '(Free above ₹199)' : ''}</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="calc-row discount-row">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="calc-row grand-total">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button
              className="checkout-action-btn"
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <button className="clear-cart-link" onClick={clearCart}>
              Clear Entire Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
