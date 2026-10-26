import React from 'react';
import { Plus, Star, Clock, Check, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Helper to highlight matching search keywords
const highlightMatch = (text, query) => {
  if (!query || !query.trim() || !text) return text;
  const q = query.trim();
  const escaped = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        style={{
          backgroundColor: '#fef08a',
          color: '#713f12',
          padding: '0.05rem 0.2rem',
          borderRadius: '3px',
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const MenuItemCard = ({ item, searchQuery }) => {
  const { cartItems, addToCart } = useCart();
  const { isAdmin } = useAuth();

  const cartItem = cartItems.find((i) => i._id === item._id);
  const isInCart = Boolean(cartItem);
  const currentQuantity = cartItem?.quantity || 0;

  // Fallback image handler
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/hot-coffee.jpg';
  };

  return (
    <article className="menu-card">
      <div className="card-image-wrap">
        <img
          src={item.image || '/images/hot-coffee.jpg'}
          alt={item.name}
          className="card-image"
          loading="lazy"
          onError={handleImageError}
        />
        <span className="card-category-badge">{item.category}</span>
        {item.rating && (
          <span className="card-rating-badge">
            <Star size={13} />
            <span>{Number(item.rating).toFixed(1)}</span>
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h3 className="card-title">{highlightMatch(item.name, searchQuery)}</h3>
        </div>

        <p className="card-desc" title={item.description}>
          {highlightMatch(item.description, searchQuery)}
        </p>

        {/* Tags & Prep Time */}
        <div className="card-tags">
          {item.prepTime && (
            <span className="card-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={12} /> {item.prepTime}
            </span>
          )}
          {item.calories && (
            <span className="card-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={12} /> {item.calories} cal
            </span>
          )}
          {item.tags &&
            item.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="card-tag">
                {tag}
              </span>
            ))}
        </div>

        {/* Price and Add button */}
        <div className="card-footer">
          <div className="card-price-block">
            <span className="card-price-label">Price</span>
            <span className="card-price">₹{Number(item.price).toLocaleString('en-IN')}</span>
          </div>

          {isAdmin ? (
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Menu Item
            </span>
          ) : (
            <button
              className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
              onClick={() => addToCart(item)}
              title={isInCart ? `In Cart (${currentQuantity}) - Click to add one more` : 'Add to Cart'}
            >
              {isInCart ? (
                <>
                  <Check size={16} />
                  <span>Added ({currentQuantity})</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
