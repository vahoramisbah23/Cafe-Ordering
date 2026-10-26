import React from 'react';
import { Coffee, Heart, MapPin, Clock, Phone, Mail } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <Coffee size={24} color="#f7b764" />
            <h4 style={{ margin: 0 }}>CAFE POINT</h4>
          </div>
          <p>
            Your ultimate neighborhood hangout! Sizzling Masala Maggi, loaded burgers, crispy fries,
            freshly brewed hot &amp; cold coffees, thick shakes, and decadent chocolate treats.
          </p>
        </div>

        <div className="footer-col">
          <h5>Café Hours</h5>
          <ul className="footer-links">
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} />
              <span>Mon – Sun: 9:00 AM – 11:30 PM</span>
            </li>
            <li style={{ marginTop: '0.5rem', color: '#f7b764', fontSize: '0.8rem' }}>
              ● Dine-in, Takeaway &amp; Quick Delivery
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Visit &amp; Contact</h5>
          <ul className="footer-links">
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} />
              <span>College Road, Student Hub, Nadiad, KHEDA 387001</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} />
              <span>orders@cafepoint.in</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; {CURRENT_YEAR} Café Point. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Crafted with</span>
          <Heart size={14} color="#ef4444" fill="#ef4444" />
          <span>using React, Express, Node &amp; MongoDB</span>
        </div>
      </div>
    </footer>
  );
};
