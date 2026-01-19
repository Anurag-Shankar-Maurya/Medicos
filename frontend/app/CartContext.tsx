import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine } from '../types';
import { useToast } from '../components/common/Toast';
import { apiClient } from '../services/apiClient';
import { useAuth } from './providers';

export interface CartItem {
  id: number;
  cart: number;
  medicine: Medicine;
  medicine_name: string;
  medicine_price: string;
  quantity: number;
  total_price: string;
}

interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total_items: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (medicine: Medicine, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await apiClient.get<Cart>('/medicines/cart/');
      setCart(cartData);
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      // Cart might not exist yet, which is fine
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (medicine: Medicine, quantity: number = 1) => {
    if (!isAuthenticated) {
      addToast('Please login to add items to cart', "error");
      return;
    }

    if (medicine.quantity_in_stock <= 0) {
      addToast(`${medicine.name} is out of stock!`, "error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<Cart>('/medicines/cart/add_item/', {
        medicine_id: medicine.id,
        quantity
      });
      setCart(response);
      addToast(`Added ${medicine.name} to cart`, "success");
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      addToast(error.message || 'Failed to add item to cart', "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!isAuthenticated) {
      addToast('Please login to modify cart', "error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<Cart>('/medicines/cart/remove_item/', {
        cart_item_id: cartItemId
      });
      setCart(response);
      addToast('Item removed from cart', "success");
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      addToast(error.message || 'Failed to remove item from cart', "error");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!isAuthenticated) {
      addToast('Please login to modify cart', "error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<Cart>('/medicines/cart/update_item/', {
        cart_item_id: cartItemId,
        quantity
      });
      setCart(response);
      addToast('Cart updated', "success");
    } catch (error: any) {
      console.error('Failed to update cart:', error);
      addToast(error.message || 'Failed to update cart', "error");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      addToast('Please login to clear cart', "error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<Cart>('/medicines/cart/clear_cart/', {});
      setCart(response);
      addToast('Cart cleared', "success");
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      addToast(error.message || 'Failed to clear cart', "error");
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cart?.total_items || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart,
      cartCount
    }}>
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
