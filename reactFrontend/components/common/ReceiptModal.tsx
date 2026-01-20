import React from 'react';
import { Button } from './Button';

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
}

interface ReceiptModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Receipt</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div id="receipt-content" className="p-6 space-y-4">
            {/* Store Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medicos Pharmacy</h1>
              <p className="text-sm text-slate-500 mt-1">Your Health, Our Priority</p>
              <p className="text-xs text-slate-400 mt-1">123 Medical Street, City - 123456</p>
              <p className="text-xs text-slate-400">Phone: +91-9876543210</p>
            </div>

            {/* Invoice Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Invoice No:</span>
                <span className="font-bold text-slate-900 dark:text-white">{sale.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Date:</span>
                <span className="text-slate-900 dark:text-white">
                  {new Date(sale.sale_date).toLocaleDateString()} {new Date(sale.sale_date).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Payment:</span>
                <span className="text-slate-900 dark:text-white capitalize">{sale.payment_method}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Customer:</span>
                <span className="text-slate-900 dark:text-white">{sale.customer_name}</span>
              </div>
              {sale.customer_contact && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Contact:</span>
                  <span className="text-slate-900 dark:text-white">{sale.customer_contact}</span>
                </div>
              )}
              {sale.doctor_name && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Doctor:</span>
                  <span className="text-slate-900 dark:text-white">{sale.doctor_name}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {sale.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 text-sm py-1">
                  <div className="col-span-6 text-slate-900 dark:text-white font-medium">
                    {item.medicine_name}
                  </div>
                  <div className="col-span-2 text-center text-slate-600 dark:text-slate-400">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-slate-600 dark:text-slate-400">
                    ${parseFloat(item.selling_price).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right text-slate-900 dark:text-white font-medium">
                    ${parseFloat(item.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Subtotal:</span>
                <span className="text-slate-900 dark:text-white">${parseFloat(sale.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">GST:</span>
                <span className="text-slate-900 dark:text-white">${parseFloat(sale.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-900 dark:text-white">Total:</span>
                <span className="text-slate-900 dark:text-white">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Amount Paid:</span>
                <span className="text-slate-900 dark:text-white">${parseFloat(sale.amount_paid).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-500">Thank you for your business!</p>
              <p className="text-xs text-slate-400 mt-1">Please visit again</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              Print Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

// Export types for reuse
export type { Sale, SaleItem };
