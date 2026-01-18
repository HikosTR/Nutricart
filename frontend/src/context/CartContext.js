import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('herbalife_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('herbalife_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const productKey = product.selectedVariant 
        ? `${product.id}-${product.selectedVariant}` 
        : product.id;
      
      const existing = prev.find(item => {
        const itemKey = item.selectedVariant 
          ? `${item.id}-${item.selectedVariant}` 
          : item.id;
        return itemKey === productKey;
      });
      
      if (existing) {
        return prev.map(item => {
          const itemKey = item.selectedVariant 
            ? `${item.id}-${item.selectedVariant}` 
            : item.id;
          return itemKey === productKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      
      return [...prev, { ...product, quantity, cartId: productKey }];
    });
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => {
      const itemKey = item.selectedVariant 
        ? `${item.id}-${item.selectedVariant}` 
        : item.id;
      return itemKey !== cartId;
    }));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        const itemKey = item.selectedVariant 
          ? `${item.id}-${item.selectedVariant}` 
          : item.id;
        return itemKey === cartId ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};