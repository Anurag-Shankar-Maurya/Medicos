import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Medicine } from '../types';
import { useToast } from '../components/common/Toast';

export interface CartItem extends Medicine {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { addToast } = useToast();

  const addToCart = (medicine: Medicine) => {
    if (medicine.quantity_in_stock <= 0) {
      addToast(`${medicine.name} is out of stock!`, "error");
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.quantity_in_stock) {
          addToast("Cannot add more than available stock", "warning");
          return prevCart;
        }
        addToast(`Increased ${medicine.name} quantity`, "success");
        return prevCart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      addToast(`Added ${medicine.name} to cart`, "success");
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.quantity_in_stock) {
          addToast("Limit reached - stock currently at " + item.quantity_in_stock, "warning");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
