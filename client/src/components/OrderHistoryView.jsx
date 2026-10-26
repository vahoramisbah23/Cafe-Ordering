import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Search,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../api/api';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export const OrderHistoryView = ({ onBackToMenu }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Preparing':
        return 'status-preparing';
      case 'Ready':
        return 'status-ready';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="orders-container">
      {/* Top Controls Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--espresso)' }}>
            Live Customer Orders
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track placed orders, inspect receipts, and manage preparation status.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={loadOrders}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar" style={{ padding: '1rem' }}>
        <form className="search-sort-row" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by order #, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-select-wrapper">
            <span className="sort-label">Status Filter:</span>
            <select
              className="sort-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready for Pickup</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
            Fetching orders from database...
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '1.25rem',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button className="btn-secondary" onClick={loadOrders}>
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <ShoppingBag size={36} />
          </div>
          <h3>No Orders Found</h3>
          <p>
            {statusFilter || searchQuery
              ? 'No orders match your filter criteria.'
              : 'No customer orders have been placed yet.'}
          </p>
          <button className="btn-primary" onClick={onBackToMenu}>
            Explore Menu &amp; Place Order
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-number-text">{order.orderNumber}</span>
                    <span className={`status-pill ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="order-date-text">
                      <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {dateStr}
                    </span>

                    {/* Quick Status Updater */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: '#fff',
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="order-customer-details">
                  <div>
                    <strong>Customer:</strong> {order.customer.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {order.customer.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {order.customer.phone}
                  </div>
                  <div>
                    <strong>Dining:</strong> {order.customer.diningOption}
                    {order.customer.tableNumber && ` (${order.customer.tableNumber})`}
                    {order.customer.deliveryAddress && ` (${order.customer.deliveryAddress})`}
                  </div>
                  {order.customer.notes && (
                    <div style={{ gridColumn: '1 / -1', color: '#92400e' }}>
                      <strong>Barista Note:</strong> "{order.customer.notes}"
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="order-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>
                        <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Card Footer with Price Details */}
                <div className="order-card-footer">
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>Payment: <strong>{order.paymentMethod}</strong></span>
                    <span>Payment Status: <strong style={{ color: '#059669' }}>{order.paymentStatus}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Amount:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--espresso)' }}>
                      ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
