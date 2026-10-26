import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Wallet,
  CheckCircle,
  Loader2,
  AlertCircle,
  UtensilsCrossed,
  Package,
  Bike,
  Building,
  QrCode,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api/api';
import { playOrderChime } from '../utils/sound';

export const CheckoutModal = ({ isOpen, onClose, onOrderPlaced, onViewOrders }) => {
  const { user } = useAuth();
  const {
    cartItems,
    subtotal,
    tax,
    deliveryFee,
    discountAmount,
    totalAmount,
    diningOption,
    setDiningOption,
    clearCart,
    showToast,
  } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    tableNumber: 'Table 1',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    upiId: '',
  });

  // Keep synced if user logs in
  React.useEffect(() => {
    if (user && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user, isOpen]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = '10-digit mobile number is required';
    } else if (!/^[0-9+ -]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (diningOption === 'Delivery' && !formData.deliveryAddress.trim()) {
      errs.deliveryAddress = 'Delivery address with PIN code is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          diningOption,
          tableNumber: diningOption === 'Dine-In' ? formData.tableNumber : '',
          deliveryAddress: diningOption === 'Delivery' ? formData.deliveryAddress : '',
          notes: formData.notes.trim() + (formData.upiId ? ` | UPI ID: ${formData.upiId.trim()}` : ''),
        },
        items: cartItems.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        tax,
        deliveryFee,
        discount: discountAmount,
        totalAmount,
        paymentMethod: formData.paymentMethod,
      };

      const res = await placeOrder(orderPayload);

      if (res.success && res.data) {
        try {
          const stored = JSON.parse(localStorage.getItem('cafe_customer_order_ids') || '[]');
          if (!stored.includes(res.data._id)) {
            localStorage.setItem('cafe_customer_order_ids', JSON.stringify([res.data._id, ...stored]));
          }
        } catch {}

        setPlacedOrderDetails(res.data);
        clearCart();
        playOrderChime();
        showToast(`Order #${res.data.orderNumber} placed successfully!`, 'success');
        if (onOrderPlaced) onOrderPlaced(res.data);
      }
    } catch (err) {
      const msg = err.message || 'Failed to submit order. Please try again.';
      showToast(msg, 'error');
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlacedOrderDetails(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {placedOrderDetails ? 'Order Confirmed!' : 'Checkout & Place Order'}
          </h2>
          <button className="drawer-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Successful Confirmation View */}
        {placedOrderDetails ? (
          <div className="order-success-card">
            <div className="success-badge-icon">
              <CheckCircle size={48} />
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--espresso)' }}>
                Dhanyavaad, {placedOrderDetails.customer.name}!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
                Your order has been received and is being freshly prepared.
              </p>
            </div>

            <div className="order-badge-number">
              {placedOrderDetails.orderNumber}
            </div>

            <div className="order-receipt-summary">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: '#b45309' }}>
                  {placedOrderDetails.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dining Option:</span>
                <span style={{ fontWeight: 600 }}>{placedOrderDetails.customer.diningOption}</span>
              </div>
              {placedOrderDetails.customer.tableNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Table:</span>
                  <span style={{ fontWeight: 600 }}>{placedOrderDetails.customer.tableNumber}</span>
                </div>
              )}
              {placedOrderDetails.customer.deliveryAddress && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
                  <span style={{ fontWeight: 600 }}>{placedOrderDetails.customer.deliveryAddress}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600 }}>{placedOrderDetails.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Count:</span>
                <span>{placedOrderDetails.items.length} item(s)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--espresso)',
                }}
              >
                <span>Grand Total:</span>
                <span>₹{Number(placedOrderDetails.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleClose}
              >
                Order More
              </button>
              {onViewOrders && (
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    handleClose();
                    onViewOrders();
                  }}
                >
                  Track This Order
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errors.submit && (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #f87171',
                    color: '#b91c1c',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Dining Option Selector */}
              <div className="form-group">
                <label className="form-label">Dining Preference</label>
                <div className="dining-selector-box">
                  <button
                    type="button"
                    className={`dining-tab-btn ${diningOption === 'Dine-In' ? 'active' : ''}`}
                    onClick={() => setDiningOption('Dine-In')}
                  >
                    <UtensilsCrossed size={15} />
                    <span>Dine-In</span>
                  </button>
                  <button
                    type="button"
                    className={`dining-tab-btn ${diningOption === 'Takeaway' ? 'active' : ''}`}
                    onClick={() => setDiningOption('Takeaway')}
                  >
                    <Package size={15} />
                    <span>Takeaway</span>
                  </button>
                  <button
                    type="button"
                    className={`dining-tab-btn ${diningOption === 'Delivery' ? 'active' : ''}`}
                    onClick={() => setDiningOption('Delivery')}
                  >
                    <Bike size={15} />
                    <span>Delivery</span>
                  </button>
                </div>
              </div>

              {/* Customer Name & Phone */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phone}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="aarav@example.com (for order & tax invoice)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email}</span>}
              </div>

              {/* Table or Address based on Dining Option */}
              {diningOption === 'Dine-In' ? (
                <div className="form-group">
                  <label className="form-label">Table Selection</label>
                  <select
                    className="form-select"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  >
                    <option value="Table 1">Table 1 (Indoor Corner)</option>
                    <option value="Table 2">Table 2 (Window Garden Bay)</option>
                    <option value="Table 3">Table 3 (Patio Courtyard)</option>
                    <option value="Table 4">Table 4 (Espresso Brew Bar)</option>
                    <option value="Table 5">Table 5 (Lounge Booth)</option>
                    <option value="Table 6">Table 6 (Mezzanine Floor)</option>
                  </select>
                </div>
              ) : diningOption === 'Delivery' ? (
                <div className="form-group">
                  <label className="form-label">
                    Delivery Address &amp; PIN Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Flat/House No., Building, Street, Landmark, PIN Code"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  />
                  {errors.deliveryAddress && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.deliveryAddress}</span>
                  )}
                </div>
              ) : null}

              {/* Barista Notes */}
              <div className="form-group">
                <label className="form-label">Special Notes (Optional)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Less sugar, extra hot, oat milk substitute, cutlery preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Payment Method - Indian System */}
              <div className="form-group">
                <label className="form-label">Payment Method (INR)</label>
                <div className="payment-method-selector">
                  <div
                    className={`payment-card-option ${formData.paymentMethod === 'UPI (GPay / PhonePe / Paytm)' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI (GPay / PhonePe / Paytm)' })}
                  >
                    <QrCode size={20} color="#059669" />
                    <span>UPI / QR</span>
                  </div>

                  <div
                    className={`payment-card-option ${formData.paymentMethod === 'Credit/Debit Card (RuPay/Visa/MC)' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Credit/Debit Card (RuPay/Visa/MC)' })}
                  >
                    <CreditCard size={20} color="#2563eb" />
                    <span>Cards (RuPay/Visa)</span>
                  </div>

                  <div
                    className={`payment-card-option ${formData.paymentMethod === 'Cash on Delivery / Counter' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash on Delivery / Counter' })}
                  >
                    <Wallet size={20} color="#d97706" />
                    <span>Cash on Counter/COD</span>
                  </div>

                  <div
                    className={`payment-card-option ${formData.paymentMethod === 'NetBanking' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'NetBanking' })}
                  >
                    <Building size={20} color="#7c3aed" />
                    <span>NetBanking</span>
                  </div>
                </div>

                {formData.paymentMethod.startsWith('UPI') && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.82rem',
                      color: '#166534',
                    }}
                  >
                    ⚡ <strong>UPI Instant Pay:</strong> Google Pay, PhonePe, Paytm, or BHIM. You can scan the table/delivery QR code or enter your UPI ID.
                  </div>
                )}
              </div>

              {/* Order Summary box */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                    Total payable for {cartItems.reduce((acc, i) => acc + i.quantity, 0)} item(s) (incl. GST)
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--espresso)' }}>
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                  ✓ Instant Confirmation
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order (₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
