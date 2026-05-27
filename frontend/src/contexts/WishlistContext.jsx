import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    if (!product) return;
    setWishlistItems((prev) => {
      const exists = prev.find(item => 
        (product._id && item._id === product._id) || 
        (product.id && item.id === product.id)
      );
      if (exists) {
        return prev.filter(item => 
          !(product._id && item._id === product._id) && 
          !(product.id && item.id === product.id)
        );
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => 
      (item._id && item._id === productId) || 
      (item.id && item.id === productId)
    );
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlistItems((prev) => prev.filter(item => 
      !(item._id && item._id === productId) && 
      !(item.id && item.id === productId)
    ));
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
