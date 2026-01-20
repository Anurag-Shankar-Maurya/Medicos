import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, Printer } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Medicine, PaginatedResponse } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Spinner';
import { ClearCartModal } from '../../components/common/ClearCartModal';
import { ReceiptModal, type Sale } from '../../components/common/ReceiptModal';
import { useCart } from '../../app/CartContext';

export const BillingPage = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const cartItems = cart?.items || [];
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searching, setSearching] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorRegistration, setDoctorRegistration] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
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
    } catch (e: any) {
      console.error(e);
      addToast(e.message || "Failed to search medicines", "error");
    } finally {
      setSearching(false);
    }
  };

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (parseFloat(item.medicine_price) * item.quantity), 0);
  const calculateTax = () => cartItems.reduce((sum, item) => {
    const itemSubtotal = parseFloat(item.medicine_price) * item.quantity;
    const gstRate = item.medicine.gst_percentage || 12; // Fallback to 12 if not set
    return sum + (itemSubtotal * gstRate / 100);
  }, 0);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      addToast("Cart is empty", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        customer_name: customerName || 'Walk-in Customer',
        customer_contact: customerContact || undefined,
        doctor_name: doctorName || undefined,
        doctor_registration: doctorRegistration || undefined,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          price: item.medicine_price
        }))
      };

      const response = await apiClient.post<Sale>('/medicines/sales/', saleData);
      setLastSale(response);
      addToast("Sale completed successfully!", "success");
      clearCart();
      setCustomerName('');
      setCustomerContact('');
      setDoctorName('');
      setDoctorRegistration('');
    } catch (error: any) {
      addToast(error.message || "Checkout failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastSale) {
      addToast("No recent sale found to print receipt", "error");
      return;
    }
    setShowReceipt(true);
  };

  const onSelectFromSearch = (m: Medicine) => {
    addToCart(m);
    setSearchValue('');
    setSearchResults([]);
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
                    onClick={() => onSelectFromSearch(m)}
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
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-500">{cartItems.length} items</span>
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearCartModalOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 hover:border-red-300"
                  leftIcon={<Trash2 size={14} />}
                >
                  Clear Cart
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
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
                  {cartItems.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-4 px-2">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.medicine_name}</div>
                        <div className="text-xs text-slate-500">${item.medicine_price} / unit</div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                             onClick={() => updateQuantity(item.id, item.quantity - 1)}
                             className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                          >
                             <Minus size={14} />
                          </button>
                          <span className="font-bold w-6 text-center">{item.quantity}</span>
                          <button
                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
                             className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                          >
                             <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right text-slate-600 dark:text-slate-400">
                        ${item.medicine_price}
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-slate-900 dark:text-white">
                        ${item.total_price}
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
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
             />
             <Input
                placeholder="Customer Contact (optional)"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
             />
             <Input
                placeholder="Doctor Name (optional)"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
             />
             <Input
                placeholder="Doctor Registration (optional)"
                value={doctorRegistration}
                onChange={(e) => setDoctorRegistration(e.target.value)}
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
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              leftIcon={<Printer size={18} />}
              onClick={handlePrintReceipt}
              disabled={!lastSale}
            >
                Print Receipt
            </Button>
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

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <ReceiptModal
          sale={lastSale}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
