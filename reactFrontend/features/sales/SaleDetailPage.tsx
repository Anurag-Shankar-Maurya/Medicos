import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, User, CreditCard, Package, DollarSign } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { ReceiptModal } from '../../components/common/ReceiptModal';

interface SaleItem {
  id: number;
  medicine_name: string;
  quantity: number;
  selling_price: string;
  subtotal: string;
  tax_amount: string;
  total: string;
  gst_percentage: number;
}

interface Sale {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_contact?: string;
  sale_date: string;
  doctor_name?: string;
  doctor_registration?: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  payment_method: string;
  amount_paid: string;
  items: SaleItem[];
  created_by_name: string;
  created_at: string;
}

export const SaleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const fetchSaleDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await apiClient.get<Sale>(`/medicines/sales/${id}/`);
        setSale(response);
      } catch (error: any) {
        console.error('Failed to fetch sale details:', error);
        navigate('/sales');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetail();
  }, [id, navigate]);

  const getStatus = (sale: Sale) => {
    const paid = parseFloat(sale.amount_paid);
    const total = parseFloat(sale.total_amount);
    if (paid >= total) return { label: 'Paid', color: 'text-green-600 bg-green-100' };
    if (paid > 0) return { label: 'Partial', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Unpaid', color: 'text-red-600 bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Sale not found</p>
          <Button onClick={() => navigate('/sales')}>
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatus(sale);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/sales')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Sale #{sale.invoice_number}
            </h1>
            <p className="text-slate-500 mt-1">
              {new Date(sale.sale_date).toLocaleDateString()} at {new Date(sale.sale_date).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Printer size={18} />}
            onClick={() => setShowReceipt(true)}
          >
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Status and Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
              <p className={`text-lg font-semibold mt-1 ${status.color}`}>{status.label}</p>
            </div>
            <CreditCard size={24} className="text-slate-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${sale.total_amount}</p>
            </div>
            <DollarSign size={24} className="text-slate-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Items</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{sale.items.length}</p>
            </div>
            <Package size={24} className="text-slate-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Method</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1 capitalize">
                {sale.payment_method.replace('_', ' ')}
              </p>
            </div>
            <CreditCard size={24} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Customer and Sale Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <User size={18} className="mr-2" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Name:</span>
              <span className="font-medium text-slate-900 dark:text-white">{sale.customer_name || 'Walk-in Customer'}</span>
            </div>
            {sale.customer_contact && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Contact:</span>
                <span className="font-medium text-slate-900 dark:text-white">{sale.customer_contact}</span>
              </div>
            )}
            {sale.doctor_name && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Doctor:</span>
                <span className="font-medium text-slate-900 dark:text-white">{sale.doctor_name}</span>
              </div>
            )}
            {sale.doctor_registration && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Doctor Registration:</span>
                <span className="font-medium text-slate-900 dark:text-white">{sale.doctor_registration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sale Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <Calendar size={18} className="mr-2" />
            Sale Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Invoice Number:</span>
              <span className="font-medium text-slate-900 dark:text-white">{sale.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Date & Time:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(sale.sale_date).toLocaleDateString()} {new Date(sale.sale_date).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Created By:</span>
              <span className="font-medium text-slate-900 dark:text-white">{sale.created_by_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Created At:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Items Purchased</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-xs font-bold text-slate-400 uppercase text-left">
                <th className="py-4 px-6">Item</th>
                <th className="py-4 px-6 text-center">Quantity</th>
                <th className="py-4 px-6 text-right">Unit Price</th>
                <th className="py-4 px-6 text-right">GST</th>
                <th className="py-4 px-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.medicine_name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${parseFloat(item.selling_price).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${parseFloat(item.tax_amount).toFixed(2)}
                    </span>
                    <div className="text-xs text-slate-500">
                      ({item.gst_percentage}%)
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${parseFloat(item.total).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">${parseFloat(sale.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">GST:</span>
              <span className="font-medium text-slate-900 dark:text-white">${parseFloat(sale.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-3">
              <span className="text-slate-900 dark:text-white">Total Amount:</span>
              <span className="text-slate-900 dark:text-white">${parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Amount Paid:</span>
              <span className="font-medium text-slate-900 dark:text-white">${parseFloat(sale.amount_paid).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          sale={sale}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
