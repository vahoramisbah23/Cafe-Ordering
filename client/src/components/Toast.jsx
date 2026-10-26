import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toastMessage, setToastMessage } = useCart();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 size={18} color="#34d399" />;
      case 'error':
        return <AlertCircle size={18} color="#f87171" />;
      default:
        return <Info size={18} color="#f7b764" />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast-box toast-${toastMessage.type || 'info'}`}>
        {getIcon()}
        <span style={{ flex: 1 }}>{toastMessage.message}</span>
        <button
          onClick={() => setToastMessage(null)}
          style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '4px' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
