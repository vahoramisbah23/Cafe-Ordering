import React from 'react';
import { Clock, Award, Flame, Tag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const HeroBanner = () => {
  const { applyCoupon, appliedCoupon } = useCart();
  const [copied, setCopied] = React.useState(false);

  const handleApplyPromo = () => {
    applyCoupon('POINT10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-text">
          <h1>
            Fresh Brews, Cheesy Maggi &amp; <span>Pocket-Friendly Bites</span>
          </h1>
          <p>
            Welcome to Café Point — your favorite hangout spot! Enjoy classic hot coffee from ₹49,
            sizzling masala Maggi from ₹59, crispy peri-peri fries, cheesy burgers, creamy pastas,
            and chilled thick milkshakes made fresh on order.
          </p>

          <div className="hero-perks">
            <div className="hero-perk-item">
              <Award size={16} color="#f7b764" />
              <span>Hot Coffee from ₹49</span>
            </div>
            <div className="hero-perk-item">
              <Clock size={16} color="#f7b764" />
              <span>Served in 3–5 Mins</span>
            </div>
            <div className="hero-perk-item">
              <Flame size={16} color="#f7b764" />
              <span>100% Pocket-Friendly</span>
            </div>
          </div>
        </div>

        {/* Promo Code Badge */}
        <div className="hero-promo-badge">
          <span className="promo-pill">Point Special</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Flat 10% Off
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#e3d3c8' }}>
            Tap below to apply coupon code on your order!
          </p>
          <div
            className="promo-code-box"
            onClick={handleApplyPromo}
            title="Click to apply coupon code"
          >
            {copied || appliedCoupon?.code === 'POINT10' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
                <Check size={16} /> POINT10 APPLIED
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={16} /> CODE: POINT10
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
