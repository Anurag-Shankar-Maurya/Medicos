import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../app/CartContext';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ClearCartModal } from '../../components/common/ClearCartModal';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
    } else {
      await updateQuantity(cartItemId, newQuantity);
    }
  };

  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          icon={<ShoppingCart size={64} />}
          title="Your cart is empty"
          description="Add some medicines to your cart to get started."
          action={
            <Button onClick={() => navigate('/inventory')} leftIcon={<ArrowRight size={18} />}>
              Browse Medicines
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
          <p className="text-slate-500 mt-1">{cart.total_items} items in your cart</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsClearCartModalOpen(true)}
          leftIcon={<Trash2 size={18} />}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
        >
          Clear Cart
        </Button>
      </div>

      {/* Cart Items */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-xs font-bold text-slate-400 uppercase text-left">
                <th className="py-4 px-6">Medicine</th>
                <th className="py-4 px-6 text-center">Quantity</th>
                <th className="py-4 px-6 text-right">Unit Price</th>
                <th className="py-4 px-6 text-right">Total</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cart.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.medicine_name}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Available: {item.medicine.quantity_in_stock}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        disabled={loading || item.quantity >= item.medicine.quantity_in_stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-slate-900 dark:text-white">
                    ${item.medicine_price}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                    ${item.total_price}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cart Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-slate-500">Total Items: {cart.total_items}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                Total: ${cart.total_amount}
              </div>
            </div>
            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/inventory')}
                leftIcon={<ArrowRight size={18} />}
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => navigate('/billing')}
                leftIcon={<ArrowRight size={18} />}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ClearCartModal
        isOpen={isClearCartModalOpen}
        onClose={() => setIsClearCartModalOpen(false)}
        onConfirm={() => {
          clearCart();
          addToast('Cart cleared successfully', 'success');
        }}
      />
    </div>
  );
};
