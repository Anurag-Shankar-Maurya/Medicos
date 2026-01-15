import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, Printer } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Medicine, PaginatedResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Spinner';

interface CartItem extends Medicine {
  quantity: number;
}

export const BillingPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (val: string) => {
    setSearchValue(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const res = await apiClient.get<PaginatedResponse<Medicine>>('/medicines/medicines/', { search: val });
      setSearchResults(res.results.filter(m => m.quantity_in_stock > 0));
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const addToCart = (medicine: Medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.quantity_in_stock) {
        addToast("Cannot add more than available stock", "warning");
        return;
      }
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    setSearchValue('');
    setSearchResults([]);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
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

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (parseFloat(item.selling_price) * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.12; // 12% GST fallback
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast("Cart is empty", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        customer_name: customerName || 'Walk-in Customer',
        payment_method: paymentMethod,
        items: cart.map(item => ({
          medicine_id: item.id,
          quantity: item.quantity,
          price: item.selling_price
        })),
        total_amount: calculateTotal().toFixed(2)
      };

      await apiClient.post('/medicines/sales/', saleData);
      addToast("Sale completed successfully!", "success");
      setCart([]);
      setCustomerName('');
    } catch (error: any) {
      addToast(error.message || "Checkout failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Left: Product Selection */}
      <div className="flex-1 space-y-4 flex flex-col min-w-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Input 
            placeholder="Search medicine by name or generic..." 
            icon={<Search size={20} />} 
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="relative">
            {searching && (
                <div className="absolute top-2 w-full flex justify-center p-4 bg-white/80 dark:bg-slate-900/80 z-10 rounded-lg">
                    <Spinner size="sm" />
                </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="absolute top-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-96 overflow-y-auto">
                {searchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => addToCart(m)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.generic_name} • {m.strength}</div>
                      <div className="text-xs font-semibold text-primary-600 mt-1">Stock: {m.quantity_in_stock}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">${m.selling_price}</div>
                      <Button size="sm" variant="outline" className="mt-2 h-8 px-3">Add</Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingCart size={18} className="mr-2 text-primary-600" /> Current Order
            </h2>
            <span className="text-sm font-medium text-slate-500">{cart.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <ShoppingCart size={48} strokeWidth={1} />
                <p>Your cart is empty. Search for medicines to start.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase text-left border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 px-2">Item</th>
                    <th className="pb-3 px-2 text-center">Qty</th>
                    <th className="pb-3 px-2 text-right">Price</th>
                    <th className="pb-3 px-2 text-right">Total</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {cart.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-4 px-2">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-500">${item.selling_price} / unit</div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                             onClick={() => updateQuantity(item.id, -1)}
                             className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                          >
                             <Minus size={14} />
                          </button>
                          <span className="font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(item.id, 1)}
                             className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                          >
                             <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right text-slate-600 dark:text-slate-400">
                        ${item.selling_price}
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-slate-900 dark:text-white">
                        ${(parseFloat(item.selling_price) * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right: Summary & Checkout */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-4">
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                <User size={18} className="mr-2 text-primary-600" /> Customer Details
             </h3>
             <Input 
                placeholder="Walk-in Customer" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
             />
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'card', 'upi'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all uppercase ${
                    paymentMethod === method 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (12%)</span>
              <span className="font-medium text-slate-900 dark:text-white">${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="font-bold text-slate-900 dark:text-white text-lg">Total Amount</span>
              <span className="font-black text-primary-600 text-3xl">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <Button 
                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary-500/20" 
                size="lg"
                onClick={handleCheckout}
                isLoading={isProcessing}
                leftIcon={<CreditCard size={20} />}
            >
                Complete Payment
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center" leftIcon={<Printer size={18} />}>
                Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
