import React, { useState } from 'react';
import {
  Coffee,
  User,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AuthLandingPage = () => {
  const { login, register, loading } = useAuth();
  const { showToast } = useCart();

  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (authMode === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please fill in all required fields');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        const res = await register(name, email, phone, password, activeRole);
        showToast(
          activeRole === 'admin'
            ? `Admin account created! Welcome, ${res.user.name}.`
            : `Welcome to Café Point, ${res.user.name}!`,
          'success'
        );
      } else {
        const res = await login(email, password, activeRole);
        showToast(
          activeRole === 'admin'
            ? `Welcome to Admin Dashboard, ${res.user.name}!`
            : `Welcome back, ${res.user.name}!`,
          'success'
        );
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const isCustomer = activeRole === 'customer';
  const roleColor = isCustomer ? '#b45309' : '#241209';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #180b04 0%, #29140a 50%, #180b04 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        color: '#fff',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '480px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--caramel) 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 25px rgba(217, 119, 6, 0.4)',
          }}
        >
          <Coffee size={32} color="#fff" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.4rem',
            margin: '0 0 0.4rem 0',
            letterSpacing: '1px',
            fontWeight: 800,
          }}
        >
          CAFE POINT
        </h1>
        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.95rem' }}>
          Fresh Brews · Maggi · Burgers · Thick Shakes · Nadiad, KHEDA
        </p>
      </div>

      {/* Main Authentication Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Top Role Selector: Customer vs Admin */}
        <div
          style={{
            display: 'flex',
            background: '#f4ede4',
            borderBottom: '1px solid #e7dbcf',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveRole('customer');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '1.05rem 1rem',
              background: isCustomer ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: isCustomer ? '3px solid #b45309' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: isCustomer ? '#b45309' : '#786558',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <User size={18} style={{ color: isCustomer ? '#b45309' : '#9ca3af' }} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '1.05rem 1rem',
              background: !isCustomer ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: !isCustomer ? '3px solid #241209' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: !isCustomer ? '#241209' : '#786558',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={18} style={{ color: !isCustomer ? '#241209' : '#9ca3af' }} />
            <span>Admin</span>
          </button>
        </div>

        {/* Card Body */}
        <div style={{ padding: '2rem 1.75rem' }}>
          {/* Card Title & Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2
              style={{
                fontSize: '1.45rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                color: 'var(--espresso)',
                margin: '0 0 0.35rem 0',
              }}
            >
              {isCustomer
                ? authMode === 'login'
                  ? 'Customer Login'
                  : 'Create Customer Account'
                : authMode === 'login'
                ? 'Admin Login'
                : 'Create Admin Account'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isCustomer
                ? 'Order handcrafted beverages, snacks & track live'
                : 'Manage café menu items, orders & kitchen workflow'}
            </p>
          </div>

          {/* Clean Segmented Pill Toggle: Login vs Sign Up */}
          <div
            style={{
              display: 'flex',
              background: '#f3ebe1',
              borderRadius: '10px',
              padding: '3px',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'login' ? '#ffffff' : 'transparent',
                fontWeight: authMode === 'login' ? 700 : 500,
                fontSize: '0.88rem',
                color: authMode === 'login' ? 'var(--espresso)' : '#786558',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'register' ? '#ffffff' : 'transparent',
                fontWeight: authMode === 'register' ? 700 : 500,
                fontSize: '0.88rem',
                color: authMode === 'register' ? 'var(--espresso)' : '#786558',
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name & Phone only on Sign Up */}
            {authMode === 'register' && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Full Name <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder={isCustomer ? 'e.g. John Doe' : 'e.g. Café Manager'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={16}
                      style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder="e.g. +91 98988 16709"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder={isCustomer ? 'yourname@example.com' : 'admin@cafepoint.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Single Clean Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.6rem',
                padding: '0.85rem',
                fontSize: '0.96rem',
                fontWeight: 700,
                color: '#fff',
                background: roleColor,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isCustomer
                  ? '0 4px 14px rgba(180, 83, 9, 0.35)'
                  : '0 4px 14px rgba(36, 18, 9, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Login' : 'Create Account'}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Clean Understated Switcher Link */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.4rem',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
            }}
          >
            {authMode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCustomer ? '#b45309' : '#241209',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    fontSize: '0.88rem',
                  }}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCustomer ? '#b45309' : '#241209',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    fontSize: '0.88rem',
                  }}
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        Café Point · College Road, Student Hub, Nadiad, KHEDA 387001 · Gujarat
      </div>
    </div>
  );
};
