import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Coffee,
  ChevronRight,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  RefreshCw,
  AlertCircle,
  ChefHat,
  Bell,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrders, placeOrder } from '../api/api';

// Soft audio notification chime
const playStatusChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(523.25, 0.0, 0.2); // C5
    playTone(659.25, 0.12, 0.2); // E5
    playTone(783.99, 0.24, 0.35); // G5
  } catch (err) {
    console.debug('Chime audio playback suppressed:', err);
  }
};

export const CustomerDashboard = ({ onBackToMenu, onOpenCart }) => {
  const { user, logout } = useAuth();
  const { showToast } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());
  const [creatingDemo, setCreatingDemo] = useState(false);

  // Store previous order statuses to detect real-time changes made by Admin
  const prevStatusesRef = useRef({});

  // Helper: Create a real sample order in MongoDB so customer can immediately test tracking!
  const handleCreateSampleOrder = async () => {
    setCreatingDemo(true);
    try {
      const samplePayload = {
        customer: {
          name: user?.name || 'Café Customer',
          email: user?.email || 'customer@cafepoint.in',
          phone: user?.phone || '9898816709',
          diningOption: 'Dine-In',
          tableNumber: 'Table 4',
          notes: 'Customer Live Tracking Test',
        },
        items: [
          {
            name: 'Cold Coffee with Ice Cream',
            price: 140,
            quantity: 1,
            image: '/images/cold-coffee.jpg',
          },
          {
            name: 'Crispy Peri-Peri French Fries',
            price: 110,
            quantity: 1,
            image: '/images/french-fries.jpg',
          },
        ],
        subtotal: 250,
        tax: 12.5,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 262.5,
        paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      };

      const res = await placeOrder(samplePayload);
      if (res.success && res.data) {
        try {
          const stored = JSON.parse(localStorage.getItem('cafe_customer_order_ids') || '[]');
          localStorage.setItem('cafe_customer_order_ids', JSON.stringify([res.data._id, ...stored]));
        } catch {}

        playStatusChime();
        showToast(`Order #${res.data.orderNumber} placed! Track its live status below.`, 'success');
        await fetchCustomerOrders(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to place test order', 'error');
    } finally {
      setCreatingDemo(false);
    }
  };

  const fetchCustomerOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // Gather both user's email and any order IDs saved in this browser session
      const storedIds = JSON.parse(localStorage.getItem('cafe_customer_order_ids') || '[]');
      const queryParams = {};
      if (user?.email) queryParams.email = user.email;
      if (storedIds.length > 0) queryParams.ids = storedIds.join(',');

      // If neither is present, try fallback
      const res = await getOrders(queryParams);
      if (res.success && Array.isArray(res.data)) {
        // Detect if Admin has changed any order status
        res.data.forEach((ord) => {
          const oldStatus = prevStatusesRef.current[ord._id];
          if (oldStatus && oldStatus !== ord.status) {
            playStatusChime();
            showToast(
              `🔔 Order #${ord.orderNumber} status updated: "${ord.status}"!`,
              ord.status === 'Ready' ? 'success' : 'info'
            );
          }
          // Update ref
          prevStatusesRef.current[ord._id] = ord.status;
        });

        setOrders(res.data);
        setLastUpdatedTime(new Date());
      }
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch on mount & whenever user changes
  useEffect(() => {
    fetchCustomerOrders(false);
  }, [user?.email]);

  // LIVE REAL-TIME POLLING: Auto-checks every 3 seconds for Admin status changes
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchCustomerOrders(true);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [user?.email]);

  const totalSpent = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const activeOrdersCount = orders.filter(
    (ord) =>
      ord.status === 'Placed' ||
      ord.status === 'Brewing' ||
      ord.status === 'Preparing' ||
      ord.status === 'Ready'
  ).length;

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') {
      return (
        ord.status === 'Placed' ||
        ord.status === 'Brewing' ||
        ord.status === 'Preparing' ||
        ord.status === 'Ready'
      );
    }
    if (filterStatus === 'Completed') return ord.status === 'Completed';
    if (filterStatus === 'Cancelled') return ord.status === 'Cancelled';
    return ord.status === filterStatus;
  });

  // Calculate tracking stage (1 to 4)
  const getStageNumber = (status) => {
    switch (status) {
      case 'Placed':
        return 1;
      case 'Brewing':
      case 'Preparing':
        return 2;
      case 'Ready':
        return 3;
      case 'Completed':
        return 4;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Placed':
        return { bg: '#fef3c7', text: '#92400e', label: 'Order Received' };
      case 'Brewing':
      case 'Preparing':
        return { bg: '#e0e7ff', text: '#3730a3', label: 'Freshly Preparing in Kitchen' };
      case 'Ready':
        return { bg: '#dcfce7', text: '#166534', label: 'Ready for Pickup / Serving!' };
      case 'Completed':
        return { bg: '#f3f4f6', text: '#374151', label: 'Delivered & Completed' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b', label: 'Order Cancelled' };
      default:
        return { bg: '#f3f4f6', text: '#374151', label: status };
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Banner & Profile Overview */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--espresso) 0%, #3d2314 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--caramel)',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Customer Dashboard
            </span>

            {/* Live Auto-Refresh Pulse Indicator */}
            <span
              style={{
                fontSize: '0.74rem',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block',
                }}
              />
              Live Sync Active (Auto-updating)
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.4rem 0' }}>
            Welcome, {user?.name || 'Valued Guest'}!
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.92rem' }}>
            {user?.email} {user?.phone ? `• ${user.phone}` : ''} · Track your live orders below
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleCreateSampleOrder}
            disabled={creatingDemo}
            className="btn-secondary"
            style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
            title="Creates an active order instantly to test real-time tracking"
          >
            <Sparkles size={16} />
            <span>{creatingDemo ? 'Creating Order...' : '+ New Order to Track'}</span>
          </button>
          <button
            onClick={onBackToMenu}
            className="btn-primary"
            style={{
              background: 'var(--caramel)',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <Coffee size={16} />
            <span>Order Food & Drinks</span>
          </button>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Customer Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <Package size={20} style={{ color: 'var(--caramel)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--espresso)', marginTop: '0.5rem' }}>
            {orders.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Orders
            </span>
            <Clock size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', marginTop: '0.5rem' }}>
            {activeOrdersCount}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Spent
            </span>
            <CreditCard size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#059669', marginTop: '0.5rem' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Orders Filter & Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: 'var(--espresso)', margin: 0 }}>
            Live Orders & Tracking
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ({filteredOrders.length})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '2px' }}>
            {['All', 'Active', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                style={{
                  background: filterStatus === tab ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: filterStatus === tab ? 700 : 500,
                  color: filterStatus === tab ? 'var(--espresso)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: filterStatus === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchCustomerOrders(false)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
            title="Refresh Status Now"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Orders List / Empty State */}
      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }}></div>
          <p>Connecting to kitchen & fetching your orders...</p>
        </div>
      ) : error ? (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#b91c1c',
          }}
        >
          <AlertCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
          <p>{error}</p>
          <button className="btn-secondary" onClick={() => fetchCustomerOrders(false)} style={{ marginTop: '0.5rem' }}>
            Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '14px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              color: 'var(--caramel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '0.4rem' }}>
            No Orders Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
            {filterStatus !== 'All'
              ? `You don't have any ${filterStatus.toLowerCase()} orders right now.`
              : "You haven't placed an order yet. Browse our delicious café items and place your first order!"}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreateSampleOrder}
              disabled={creatingDemo}
              className="btn-secondary"
              style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={16} />
              <span>{creatingDemo ? 'Creating...' : '⚡ Place Instant Test Order to Track Live'}</span>
            </button>
            <button
              onClick={onBackToMenu}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Coffee size={16} />
              <span>Browse Café Menu & Order</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord.status);
            const currentStage = getStageNumber(ord.status);
            const isCancelled = ord.status === 'Cancelled';

            const formattedDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ord._id}
                style={{
                  background: 'var(--bg-primary)',
                  border: ord.status === 'Ready' ? '2px solid #16a34a' : '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: ord.status === 'Ready' ? '0 8px 24px rgba(22, 163, 74, 0.15)' : '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Ready Banner Pulse if ready */}
                {ord.status === 'Ready' && (
                  <div
                    style={{
                      background: '#16a34a',
                      color: '#fff',
                      textAlign: 'center',
                      padding: '0.45rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      margin: '-1.5rem -1.5rem 1rem -1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Your Order is READY for Pickup / Serving at Café Point!</span>
                  </div>
                )}

                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '0.85rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--espresso)', letterSpacing: '0.5px' }}>
                      {ord.orderNumber}
                    </span>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {ord.status === 'Placed' && <Clock size={13} />}
                      {(ord.status === 'Preparing' || ord.status === 'Brewing') && <ChefHat size={13} />}
                      {ord.status === 'Ready' && <CheckCircle2 size={13} />}
                      {ord.status === 'Completed' && <CheckCircle2 size={13} />}
                      {ord.status === 'Cancelled' && <XCircle size={13} />}
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* LIVE VISUAL PROGRESS STEPPER */}
                {!isCancelled ? (
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      padding: '1.1rem 1.25rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Background connecting line */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '5%',
                          right: '5%',
                          height: '4px',
                          background: '#e5e7eb',
                          zIndex: 1,
                        }}
                      />

                      {/* Active green connecting line */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '5%',
                          width: `${((currentStage - 1) / 3) * 90}%`,
                          height: '4px',
                          background: '#16a34a',
                          zIndex: 2,
                          transition: 'width 0.4s ease',
                        }}
                      />

                      {/* 4 Steps */}
                      {[
                        { step: 1, label: 'Placed', desc: 'Received' },
                        { step: 2, label: 'Preparing', desc: 'In Kitchen' },
                        { step: 3, label: 'Ready', desc: 'Pick Up' },
                        { step: 4, label: 'Completed', desc: 'Enjoyed' },
                      ].map((s) => {
                        const isDone = currentStage >= s.step;
                        const isCurrent = currentStage === s.step;

                        return (
                          <div
                            key={s.step}
                            style={{
                              position: 'relative',
                              zIndex: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              minWidth: '65px',
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: isDone ? '#16a34a' : '#fff',
                                border: isCurrent ? '3px solid #16a34a' : isDone ? 'none' : '2px solid #d1d5db',
                                color: isDone ? '#fff' : '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.25)' : 'none',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {isDone ? <CheckCircle2 size={16} /> : s.step}
                            </div>
                            <span
                              style={{
                                marginTop: '6px',
                                fontSize: '0.78rem',
                                fontWeight: isCurrent ? 800 : isDone ? 600 : 500,
                                color: isCurrent ? '#166534' : isDone ? 'var(--espresso)' : 'var(--text-muted)',
                              }}
                            >
                              {s.label}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {s.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #f87171',
                      color: '#991b1b',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={18} />
                    <span>This order was cancelled by Café Point admin staff.</span>
                  </div>
                )}

                {/* Items preview list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Order Items ({ord.items.reduce((sum, i) => sum + i.quantity, 0)})
                  </div>
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.9rem',
                        padding: '0.4rem 0',
                        borderBottom: idx !== ord.items.length - 1 ? '1px dashed var(--border-subtle)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image || '/images/hot-coffee.jpg'}
                          alt={item.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/hot-coffee.jpg';
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--espresso)' }}>{item.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '6px' }}>
                            x {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--espresso)' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Details & Total */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.15rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>
                      <strong>Dining:</strong> {ord.customer.diningOption || 'Dine-In'}
                      {ord.customer.tableNumber ? ` (${ord.customer.tableNumber})` : ''}
                    </span>
                    <span>
                      <strong>Payment:</strong> {ord.paymentMethod || 'UPI / Cash'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Amount:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--espresso)' }}>
                      ₹{ord.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
