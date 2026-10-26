import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatINR } from '../utils/formatters';

const CartContext = createContext();

const CART_STORAGE_KEY = 'aura_cafe_cart_v2';
const COUPON_STORAGE_KEY = 'aura_cafe_applied_coupon_v2';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [diningOption, setDiningOption] = useState('Dine-In'); // 'Dine-In' | 'Takeaway' | 'Delivery'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync coupon', e);
    }
  }, [appliedCoupon]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
  };

  const addToCart = (item, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i._id === item._id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: item._id,
            name: item.name,
            price: Number(item.price) || 0,
            image: item.image,
            category: item.category,
            quantity: Math.max(1, quantity),
          },
        ];
      }
    });
    showToast(`Added "${item.name}" to cart (${formatINR(item.price)})`, 'success');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const incrementQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decrementQuantity = (itemId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((i) => i._id !== itemId);
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const removed = prev.find((i) => i._id === itemId);
      if (removed) {
        showToast(`Removed "${removed.name}" from cart`, 'info');
      }
      return prev.filter((item) => item._id !== itemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (
      cleanCode === 'POINT10' ||
      cleanCode === 'CAFE10' ||
      cleanCode === 'ADDA10' ||
      cleanCode === 'COFFEE10' ||
      cleanCode === 'CHAI10' ||
      cleanCode === 'SUBKO10'
    ) {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10, label: '10% Welcome Discount' });
      showToast(`Promo code ${cleanCode} applied! (10% OFF)`, 'success');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'BREW20' || cleanCode === 'AURA20' || cleanCode === 'ROAST20') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 20, label: '20% Special Artisan Discount' });
      showToast(`VIP Promo ${cleanCode} applied! (20% OFF)`, 'success');
      return { success: true, message: '20% discount applied!' };
    } else {
      showToast('Invalid or expired promo code', 'error');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo code removed', 'info');
  };

  // Indian Rupee Calculations
  const totalItemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  // 5% Restaurant GST (2.5% CGST + 2.5% SGST)
  const tax = Number((subtotal * 0.05).toFixed(2));

  // Delivery fee: ₹25 if subtotal < ₹199; Free over ₹199 for affordable cafe
  const deliveryFee =
    diningOption === 'Delivery' ? (subtotal >= 199 ? 0 : 25) : 0;

  const discountAmount = appliedCoupon
    ? Number(((subtotal * appliedCoupon.discountPercent) / 100).toFixed(2))
    : 0;

  const totalAmount = Number(
    Math.max(0, subtotal + tax + deliveryFee - discountAmount).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        subtotal,
        tax,
        deliveryFee,
        discountAmount,
        totalAmount,
        appliedCoupon,
        diningOption,
        setDiningOption,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        setToastMessage,
        addToCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        showToast,
        formatINR,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
