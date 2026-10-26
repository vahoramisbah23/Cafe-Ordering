import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AuthModal = () => {
  const { authModalOpen, authModalTab, setAuthModalTab, closeAuthModal, login, register, loading } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);

  if (!authModalOpen) return null;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (authModalTab === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          setError('Name, email, and password are required');
          return;
        }
        const res = await register(name, email, phone, password);
        showToast(`Welcome to Café Point, ${res.user.name}!`, 'success');
      } else if (authModalTab === 'admin') {
        const res = await login(email, password, 'admin');
        showToast(`Logged in as Admin: ${res.user.name}`, 'success');
      } else {
        // Customer login
        const res = await login(email, password);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--espresso)',
            color: '#fff',
            padding: '1.25rem 1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={closeAuthModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {authModalTab === 'admin' ? (
              <ShieldCheck size={24} style={{ color: 'var(--caramel)' }} />
            ) : (
              <User size={24} style={{ color: 'var(--caramel)' }} />
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
                {authModalTab === 'admin'
                  ? 'Café Point Admin'
                  : authModalTab === 'register'
                  ? 'Create Customer Account'
                  : 'Customer Account Login'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)', margin: '2px 0 0 0' }}>
                {authModalTab === 'admin'
                  ? 'Authorized staff & management dashboard access'
                  : 'Access your past orders & express checkout'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: authModalTab === 'login' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: authModalTab === 'login' ? '2px solid var(--espresso)' : 'none',
              fontWeight: authModalTab === 'login' ? 700 : 500,
              fontSize: '0.85rem',
              color: authModalTab === 'login' ? 'var(--espresso)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: authModalTab === 'register' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: authModalTab === 'register' ? '2px solid var(--espresso)' : 'none',
              fontWeight: authModalTab === 'register' ? 700 : 500,
              fontSize: '0.85rem',
              color: authModalTab === 'register' ? 'var(--espresso)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('admin');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: authModalTab === 'admin' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: authModalTab === 'admin' ? '2px solid var(--caramel)' : 'none',
              fontWeight: authModalTab === 'admin' ? 700 : 500,
              fontSize: '0.85rem',
              color: authModalTab === 'admin' ? 'var(--caramel-dark)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            👑 Admin
          </button>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}


          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {authModalTab === 'register' && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    Full Name <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="Enter Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="+91 98988 16709"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.92rem',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : authModalTab === 'register' ? (
                <span>Create Account</span>
              ) : authModalTab === 'admin' ? (
                <span>Access Admin</span>
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </form>

          {/* Bottom Switcher Helper */}
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {authModalTab === 'login' ? (
              <span>
                Don't have an account?{' '}
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthModalTab('register');
                  }}
                  style={{ color: 'var(--caramel)', fontWeight: 600 }}
                >
                  Sign Up Here
                </a>
              </span>
            ) : authModalTab === 'register' ? (
              <span>
                Already have an account?{' '}
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthModalTab('login');
                  }}
                  style={{ color: 'var(--caramel)', fontWeight: 600 }}
                >
                  Log In
                </a>
              </span>
            ) : (
              <span>
                Looking for customer orders?{' '}
                <a
                  href="#customer"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthModalTab('login');
                  }}
                  style={{ color: 'var(--caramel)', fontWeight: 600 }}
                >
                  Customer Login
                </a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
