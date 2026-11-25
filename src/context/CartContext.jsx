'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMenuData } from './MenuDataContext';
import { BUSINESS_DATA, computeLiveBusinessStatus, formatMoney } from '../data/menuData';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { businessData } = useMenuData();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  // Initialize from localStorage and compute live status
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maria_bonita_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }

    const updateStatus = () => {
      setLiveStatus(computeLiveBusinessStatus(businessData || BUSINESS_DATA));
    };
    updateStatus();
    const timer = setInterval(updateStatus, 60000);
    return () => clearInterval(timer);
  }, [businessData]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maria_bonita_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  const showToast = (message, duration = 3000) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const addToCart = (item) => {
    setCart((prev) => {
      // Check if item with identical options exists
      const existingIdx = prev.findIndex(
        (ci) => ci.id === item.id && JSON.stringify(ci.selectedOptions) === JSON.stringify(item.selectedOptions)
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity || 1;
        return updated;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    showToast(`✓ Agregado: ${item.name}`);
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
        showToast('Producto eliminado de la comanda');
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    showToast('Producto retirado');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice || item.price) * (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        selectedDish,
        setSelectedDish,
        toastMessage,
        showToast,
        liveStatus,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        cartSubtotal,
        formatMoney,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
