import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Eye, Download, Printer, FileText, FileSpreadsheet, ChevronDown, FileJson } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { PaginatedResponse, Sale } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { ReceiptModal } from '../../components/common/ReceiptModal';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'insurance', label: 'Insurance' },
];

const QUICK_DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last 3 Months', value: 'last3months' },
  { label: 'Last 6 Months', value: 'last6months' },
  { label: 'This Year', value: 'thisYear' },
];

export const SalesPage = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<PaginatedResponse<Sale> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchSales = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: page.toString() };
      if (search) params.customer = search;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get<PaginatedResponse<Sale>>('/medicines/sales/', params);
      setSales(response);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [search, paymentMethod, startDate, endDate]);

  const handlePageChange = (page: number) => {
    fetchSales(page);
  };

  const getStatus = (sale: Sale) => {
    const paid = parseFloat(sale.amount_paid);
    const total = parseFloat(sale.total_amount);
    if (paid >= total) return { label: 'Paid', color: 'text-green-600 bg-green-100' };
    if (paid > 0) return { label: 'Partial', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Unpaid', color: 'text-red-600 bg-red-100' };
  };

  const clearFilters = () => {
    setSearch('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyQuickDateFilter = (filter: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = new Date(today);

    switch (filter) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last3months':
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        break;
      case 'last6months':
        start = new Date(today);
        start.setMonth(today.getMonth() - 6);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  };

  const handlePrintReceipt = async (sale: Sale) => {
    try {
      // Fetch the full sale details with items
      const response = await apiClient.get<any>(`/medicines/sales/${sale.id}/`);
      setSelectedSale(response);
      setShowReceipt(true);
    } catch (error: any) {
      console.error('Failed to fetch sale details:', error);
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      // Fetch all sales data for export (remove pagination limit)
      const params: Record<string, string> = { page_size: '10000' }; // Large page size to get all data
      if (search) params.customer = search;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get<PaginatedResponse<Sale>>('/medicines/sales/', params);
      const exportData = response.results;

      // Create CSV content
      const headers = [
        'Invoice Number',
        'Customer Name',
        'Customer Contact',
        'Doctor Name',
        'Doctor Registration',
        'Sale Date',
        'Subtotal',
        'Tax Amount',
        'Discount',
        'Total Amount',
        'Payment Method',
        'Amount Paid',
        'Change Returned',
        'Points Earned',
        'Points Redeemed',
        'Status'
      ];

      const csvContent = [
        headers.join(','),
        ...exportData.map(sale => {
          const status = getStatus(sale);
          return [
            `"${sale.invoice_number}"`,
            `"${sale.customer_name || 'Walk-in Customer'}"`,
            `"${sale.customer_contact || ''}"`,
            `"${sale.doctor_name || ''}"`,
            `"${sale.doctor_registration || ''}"`,
            `"${formatDate(sale.sale_date)}"`,
            `"${sale.subtotal}"`,
            `"${sale.tax_amount}"`,
            `"${sale.discount}"`,
            `"${sale.total_amount}"`,
            `"${sale.payment_method}"`,
            `"${sale.amount_paid}"`,
            `"${sale.change_returned}"`,
            `"${sale.points_earned}"`,
            `"${sale.points_redeemed}"`,
            `"${status.label}"`
          ].join(',');
        })
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportMenu(false);
    } catch (error: any) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      // For PDF export, we'll use the browser's print functionality
      // First, create a printable version of the data
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }

      // Fetch all sales data for export
      const params: Record<string, string> = { page_size: '10000' };
      if (search) params.customer = search;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get<PaginatedResponse<Sale>>('/medicines/sales/', params);
      const exportData = response.results;

      // Calculate totals
      const totalSales = exportData.length;
      const totalAmount = exportData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
      const totalPaid = exportData.reduce((sum, sale) => sum + parseFloat(sale.amount_paid), 0);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .summary { background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; font-weight: bold; }
            .total-row { background: #fef3c7; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Sales Report</h1>
          <div class="summary">
            <h3>Report Summary</h3>
            <p><strong>Total Sales:</strong> ${totalSales}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
            <p><strong>Total Paid:</strong> ₹${totalPaid.toFixed(2)}</p>
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${startDate || endDate ? `<p><strong>Date Range:</strong> ${startDate || 'Start'} to ${endDate || 'End'}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.map(sale => {
                const status = getStatus(sale);
                return `
                  <tr>
                    <td>${sale.invoice_number}</td>
                    <td>${sale.customer_name || 'Walk-in Customer'}</td>
                    <td>${formatDate(sale.sale_date)}</td>
                    <td>₹${sale.total_amount}</td>
                    <td>${sale.payment_method.replace('_', ' ')}</td>
                    <td>${status.label}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Totals</strong></td>
                <td><strong>₹${totalAmount.toFixed(2)}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      setShowExportMenu(false);
    } catch (error: any) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToJSON = async () => {
    setExportLoading(true);
    try {
      // Fetch all sales data for export (remove pagination limit)
      const params: Record<string, string> = { page_size: '10000' }; // Large page size to get all data
      if (search) params.customer = search;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get<PaginatedResponse<Sale>>('/medicines/sales/', params);
      const exportData = response.results;

      // Prepare export data with enhanced information
      const exportObject = {
        export_info: {
          generated_at: new Date().toISOString(),
          total_records: exportData.length,
          filters_applied: {
            customer_search: search || null,
            payment_method: paymentMethod || null,
            date_range: startDate || endDate ? {
              start_date: startDate || null,
              end_date: endDate || null
            } : null
          },
          generated_by: 'Medicos Pharmacy Management System'
        },
        sales: exportData.map(sale => {
          const status = getStatus(sale);
          return {
            id: sale.id,
            invoice_number: sale.invoice_number,
            customer: {
              name: sale.customer_name || 'Walk-in Customer',
              contact: sale.customer_contact || null
            },
            doctor: {
              name: sale.doctor_name || null,
              registration: sale.doctor_registration || null
            },
            prescription: {
              number: sale.prescription_number || null,
              image: sale.prescription_image || null
            },
            sale_date: sale.sale_date,
            financials: {
              subtotal: sale.subtotal,
              tax_amount: sale.tax_amount,
              discount: sale.discount,
              total_amount: sale.total_amount,
              amount_paid: sale.amount_paid,
              change_returned: sale.change_returned,
              points_earned: sale.points_earned,
              points_redeemed: sale.points_redeemed
            },
            payment: {
              method: sale.payment_method,
              status: status.label
            },
            timestamps: {
              created_at: sale.created_at,
              updated_at: sale.updated_at
            }
          };
        }),
        summary: {
          total_sales: exportData.length,
          total_amount: exportData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0),
          total_paid: exportData.reduce((sum, sale) => sum + parseFloat(sale.amount_paid), 0),
          total_discount: exportData.reduce((sum, sale) => sum + parseFloat(sale.discount), 0),
          payment_methods_breakdown: exportData.reduce((acc, sale) => {
            acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          status_breakdown: exportData.reduce((acc, sale) => {
            const status = getStatus(sale);
            acc[status.label] = (acc[status.label] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      };

      // Create and download JSON file
      const jsonContent = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportMenu(false);
    } catch (error: any) {
      console.error('Failed to export JSON:', error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales History</h1>
          <p className="text-slate-500 mt-1">View and manage all sales transactions</p>
        </div>
        <div className="relative">
          <Button
            leftIcon={<Download size={18} />}
            rightIcon={<ChevronDown size={16} />}
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
              <div className="py-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={exportLoading}
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={exportToJSON}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={exportLoading}
                >
                  <FileJson className="h-4 w-4 text-blue-600" />
                  <span>Export as JSON</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={exportLoading}
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
          <Calendar size={18} className="mr-2" />
          Quick Date Filters
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_DATE_FILTERS.map(filter => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => applyQuickDateFilter(filter.value)}
              className="text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center">
            <Filter size={18} className="mr-2" />
            Filters
          </h3>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Customer Name
            </label>
            <Input
              placeholder="Search by customer name..."
              icon={<Search size={18} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              icon={<Calendar size={18} />}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <Input
              type="date"
              icon={<Calendar size={18} />}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : sales?.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No sales found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-xs font-bold text-slate-400 uppercase text-left">
                    <th className="py-4 px-6">Invoice</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sales?.results.map((sale) => {
                    const status = getStatus(sale);
                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                        onClick={() => navigate(`/sales/${sale.id}`)}
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {sale.invoice_number}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {sale.customer_name || 'Walk-in Customer'}
                          </div>
                          {sale.customer_contact && (
                            <div className="text-sm text-slate-500">{sale.customer_contact}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {formatDate(sale.sale_date)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            ₹{sale.total_amount}
                          </div>
                          {sale.discount > 0 && (
                            <div className="text-sm text-green-600">
                              -₹{sale.discount} discount
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 capitalize">
                          {sale.payment_method.replace('_', ' ')}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Printer size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReceipt(sale);
                            }}
                          >
                            Print
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sales && sales.count > 10 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, sales.count)} of {sales.count} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!sales.previous}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!sales.next}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedSale && (
        <ReceiptModal
          sale={selectedSale}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
