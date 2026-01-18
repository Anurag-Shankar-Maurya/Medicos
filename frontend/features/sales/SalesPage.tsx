import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Download } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { PaginatedResponse, Sale } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
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
  const [sales, setSales] = useState<PaginatedResponse<Sale> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales History</h1>
          <p className="text-slate-500 mt-1">View and manage all sales transactions</p>
        </div>
        <Button leftIcon={<Download size={18} />}>
          Export
        </Button>
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
                      <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
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
                            ${sale.total_amount}
                          </div>
                          {sale.discount > 0 && (
                            <div className="text-sm text-green-600">
                              -${sale.discount} discount
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
                            leftIcon={<Eye size={16} />}
                          >
                            View
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
    </div>
  );
};
