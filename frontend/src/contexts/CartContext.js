import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_VERSION = 'v3'; // bumped: now using slug-based cart keys

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const payloadKey = action.payload.cartItemId || action.payload.id;
      const stockLimit = action.payload.stock !== undefined ? action.payload.stock : Infinity;
      
      const existingItem = state.items.find(item =>
        (item.cartItemId || item.id) === payloadKey
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            (item.cartItemId || item.id) === payloadKey
              ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, stockLimit) }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: Math.min(action.payload.quantity, stockLimit), id: payloadKey, cartItemId: payloadKey }]
      };
    }

    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter(item =>
          (item.cartItemId || item.id) !== action.payload
        )
      };
    }

    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item => {
          if ((item.cartItemId || item.id) === action.payload.id) {
            const stockLimit = item.stock !== undefined ? item.stock : Infinity;
            return { ...item, quantity: Math.min(action.payload.quantity, stockLimit) };
          }
          return item;
        })
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [], appliedCoupon: null };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'APPLY_COUPON':
      return { ...state, appliedCoupon: action.payload };

    case 'REMOVE_COUPON':
      return { ...state, appliedCoupon: null };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const prevUserId = useRef(null);

  const [state, dispatch] = useReducer(cartReducer, { items: [], appliedCoupon: null }, () => {
    try {
      // Use standard 'cart' for initial load, we will sync later when user loads
      const savedVersion = localStorage.getItem('mankatha_cart_version');
      if (savedVersion !== CART_VERSION) {
        localStorage.setItem('mankatha_cart_version', CART_VERSION);
        return { items: [], appliedCoupon: null };
      }
      const saved = localStorage.getItem('cart');
      const savedCoupon = localStorage.getItem('mankatha_cart_coupon');
      return { 
        items: saved ? JSON.parse(saved) : [],
        appliedCoupon: savedCoupon ? JSON.parse(savedCoupon) : null
      };
    } catch (e) {
      return { items: [], appliedCoupon: null };
    }
  });

  // Effect to switch cart when user changes
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = isAuthenticated && user ? user.id : 'guest';
    
    if (prevUserId.current !== currentUserId) {
      // If we are switching users, load the new user's cart
      const cartKey = currentUserId === 'guest' ? 'cart' : `cart_${currentUserId}`;
      const couponKey = currentUserId === 'guest' ? 'mankatha_cart_coupon' : `mankatha_cart_coupon_${currentUserId}`;
      
      const savedCart = localStorage.getItem(cartKey);
      const savedCoupon = localStorage.getItem(couponKey);

      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }

      if (savedCoupon) {
        dispatch({ type: 'APPLY_COUPON', payload: JSON.parse(savedCoupon) });
      } else {
        dispatch({ type: 'REMOVE_COUPON' });
      }

      prevUserId.current = currentUserId;
    }
  }, [user, isAuthenticated, authLoading]);

  // Effect to save cart
  useEffect(() => {
    if (authLoading) return;
    
    const currentUserId = isAuthenticated && user ? user.id : 'guest';
    const cartKey = currentUserId === 'guest' ? 'cart' : `cart_${currentUserId}`;
    const couponKey = currentUserId === 'guest' ? 'mankatha_cart_coupon' : `mankatha_cart_coupon_${currentUserId}`;

    localStorage.setItem(cartKey, JSON.stringify(state.items));
    if (state.appliedCoupon) {
      localStorage.setItem(couponKey, JSON.stringify(state.appliedCoupon));
    } else {
      localStorage.removeItem(couponKey);
    }
  }, [state.items, state.appliedCoupon, user, isAuthenticated, authLoading]);

  useEffect(() => {
    const handleLogout = () => {
      // Just switch context to guest, the other useEffect will handle clearing/loading guest cart
    };
    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, []);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, quantity }
    });
    
    // Trigger cart notification
    const event = new CustomEvent('cartNotification', {
      detail: {
        show: true,
        message: 'Added to cart!',
        productName: product.name
      }
    });
    window.dispatchEvent(event);
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity }
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyCoupon = (couponData) => {
    dispatch({ type: 'APPLY_COUPON', payload: couponData });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!state.appliedCoupon) return 0;
    const total = getCartTotal();
    const { type, value } = state.appliedCoupon;
    if (type === 'percentage') {
      return (total * value) / 100;
    } else if (type === 'fixed_amount') {
      return Math.min(value, total);
    }
    return 0; // free_shipping is handled elsewhere
  };

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      appliedCoupon: state.appliedCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      getCartTotal,
      getDiscountAmount,
      getCartCount
    }}>
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
