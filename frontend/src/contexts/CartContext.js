import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const getUniqueKey = (item) => item.cartItemId || item.id;
      const payloadKey = action.payload.cartItemId || action.payload.id;
      const existingItem = state.items.find(item => getUniqueKey(item) === payloadKey);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            getUniqueKey(item) === payloadKey
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }

    case 'REMOVE_FROM_CART': {
      const getUniqueKey = (item) => item.cartItemId || item.id;
      return {
        ...state,
        items: state.items.filter(item => getUniqueKey(item) !== action.payload)
      };
    }

    case 'UPDATE_QUANTITY': {
      const getUniqueKey = (item) => item.cartItemId || item.id;
      return {
        ...state,
        items: state.items.map(item =>
          getUniqueKey(item) === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

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

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
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
