import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const CartNotification = ({ show, message, productName, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className={`cart-notification ${isVisible ? 'show' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <Check className="text-green-600" size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{message}</p>
          {productName && (
            <p className="text-sm text-gray-600">{productName}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartNotification;
