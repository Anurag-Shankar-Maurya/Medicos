import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';

interface ReportData {
  [key: string]: any;
}

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState('stock-status');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [filters, setFilters] = useState({
    limit: '20',
    period: 'daily',
    medicine_type: '',
    manufacturer: '',
    requires_prescription: ''
  });

  const reports = [
    { id: 'stock-status', name: 'Stock Status', description: 'Low stock, out of stock, and overstock analysis' },
    { id: 'medicine-catalog', name: 'Medicine Catalog', description: 'Complete list of all medicines' },
    { id: 'profit-margin', name: 'Profit Margin Analysis', description: 'Profit margins by medicine' },
    { id: 'sales-summary', name: 'Sales Summary', description: 'Overall sales performance' },
    { id: 'top-selling-medicines', name: 'Top Selling Medicines', description: 'Best performing medicines' },
    { id: 'payment-method-analysis', name: 'Payment Methods', description: 'Payment method breakdown' },
    { id: 'gst-analysis', name: 'GST Analysis', description: 'GST collection and inventory analysis' },
    { id: 'inventory-valuation', name: 'Inventory Valuation', description: 'Stock value analysis' },
    { id: 'medicine-by-type', name: 'Medicines by Type', description: 'Analysis by medicine category' },
    { id: 'medicine-by-manufacturer', name: 'Medicines by Manufacturer', description: 'Analysis by manufacturer' },
    { id: 'sales-by-period', name: 'Sales by Period', description: 'Daily/weekly/monthly sales trends' },
    { id: 'tax-collection', name: 'Tax Collection', description: 'Tax collection summary' },
    { id: 'notification-summary', name: 'Notification Summary', description: 'Notification system analysis' }
  ];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add date range if provided
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);

      // Add filters based on report type
      if (activeReport === 'top-selling-medicines') {
        params.append('limit', filters.limit);
      }
      if (activeReport === 'sales-by-period') {
        params.append('period', filters.period);
        params.append('limit', filters.limit);
      }
      if (activeReport === 'medicine-catalog') {
        if (filters.medicine_type) params.append('medicine_type', filters.medicine_type);
        if (filters.manufacturer) params.append('manufacturer', filters.manufacturer);
        if (filters.requires_prescription) params.append('requires_prescription', filters.requires_prescription);
      }

      const response: ReportData = await apiClient.get(`/medicines/reports/${activeReport}/?${params}`);
      setReportData(response);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport]);

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      );
    }

    if (!reportData) {
      return <div className="text-center text-gray-500">No data available</div>;
    }

    switch (activeReport) {
      case 'stock-status':
        return <StockStatusReport data={reportData} />;
      case 'medicine-catalog':
        return <MedicineCatalogReport data={reportData} />;
      case 'profit-margin':
        return <ProfitMarginReport data={reportData} />;
      case 'sales-summary':
        return <SalesSummaryReport data={reportData} />;
      case 'top-selling-medicines':
        return <TopSellingMedicinesReport data={reportData} />;
      case 'payment-method-analysis':
        return <PaymentMethodReport data={reportData} />;
      case 'gst-analysis':
        return <GSTAnalysisReport data={reportData} />;
      case 'inventory-valuation':
        return <InventoryValuationReport data={reportData} />;
      case 'medicine-by-type':
        return <MedicineByTypeReport data={reportData} />;
      case 'medicine-by-manufacturer':
        return <MedicineByManufacturerReport data={reportData} />;
      case 'sales-by-period':
        return <SalesByPeriodReport data={reportData} />;
      case 'tax-collection':
        return <TaxCollectionReport data={reportData} />;
      case 'notification-summary':
        return <NotificationSummaryReport data={reportData} />;
      default:
        return <div>Select a report to view</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive analytics and insights for your pharmacy</p>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.end_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <Button onClick={fetchReportData} disabled={loading}>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Available Reports</h3>
            </div>
            <div className="p-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    activeReport === report.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {reports.find(r => r.id === activeReport)?.name}
              </h2>
            </div>
            <div className="p-6">
              {renderReportContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Components
const StockStatusReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary?.total_medicines || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Total Medicines</div>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.summary?.low_stock_count || 0}</div>
        <div className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.summary?.out_of_stock_count || 0}</div>
        <div className="text-sm text-red-600 dark:text-red-400">Out of Stock</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary?.healthy_stock_count || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">Healthy Stock</div>
      </div>
    </div>

    {data.low_stock?.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Low Stock Medicines</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shortage</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.low_stock.map((medicine: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {medicine.name} ({medicine.strength})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {medicine.quantity_in_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {medicine.reorder_level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    {medicine.shortage || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {data.out_of_stock?.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Out of Stock Medicines</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.out_of_stock.map((medicine: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {medicine.name} ({medicine.strength})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {medicine.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(medicine.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const MedicineCatalogReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="mb-4">
      <div className="text-lg font-semibold">Total Medicines: {data.count || 0}</div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manufacturer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Selling Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GST %</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.medicines?.map((medicine: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {medicine.name} ({medicine.strength})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                {medicine.medicine_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.manufacturer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.quantity_in_stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{medicine.selling_price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.gst_percentage}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ProfitMarginReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary?.high_profit_count || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">High Profit (50%+)</div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary?.medium_profit_count || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Medium Profit (20-50%)</div>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.summary?.low_profit_count || 0}</div>
        <div className="text-sm text-yellow-600 dark:text-yellow-400">Low Profit (0-20%)</div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.summary?.loss_count || 0}</div>
        <div className="text-sm text-red-600 dark:text-red-400">Loss Making</div>
      </div>
    </div>

    {data.high_profit_medicines?.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-3">Top High-Profit Medicines</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Purchase Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.high_profit_medicines.map((medicine: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {medicine.name} ({medicine.strength})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₹{medicine.purchase_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₹{medicine.selling_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
                    {medicine.profit_margin?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const SalesSummaryReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary?.total_sales || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Total Sales</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{data.summary?.total_revenue?.toFixed(2) || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">Total Revenue</div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{data.summary?.total_tax_collected?.toFixed(2) || 0}</div>
        <div className="text-sm text-purple-600 dark:text-purple-400">Tax Collected</div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{data.summary?.net_sales?.toFixed(2) || 0}</div>
        <div className="text-sm text-orange-600 dark:text-orange-400">Net Sales</div>
      </div>
    </div>

    {data.period?.start_date && (
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Period: {data.period.start_date} to {data.period.end_date || 'Present'}
      </div>
    )}
  </div>
);

const TopSellingMedicinesReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicine</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manufacturer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Revenue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Orders</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.top_medicines?.map((medicine: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {medicine.medicine__name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                {medicine.medicine__medicine_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.medicine__manufacturer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.total_quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{medicine.total_revenue?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {medicine.order_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PaymentMethodReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transactions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Average Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.payment_methods?.map((method: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                {method.payment_method.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {method.transaction_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{method.total_amount?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{method.average_amount?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const GSTAnalysisReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Inventory GST Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GST %</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicines</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock Value</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.inventory_gst_analysis?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{item.gst_percentage}%</td>
                  <td className="px-4 py-2 text-sm">{item.medicine_count}</td>
                  <td className="px-4 py-2 text-sm">₹{item.total_stock_value?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Sales GST Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GST %</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tax Collected</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transactions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.sales_gst_analysis?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{item.gst_percentage}%</td>
                  <td className="px-4 py-2 text-sm">₹{item.total_tax_collected?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm">{item.transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const InventoryValuationReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary?.total_medicines || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Total Medicines</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{data.summary?.total_purchase_value?.toFixed(2) || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">Purchase Value</div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{data.summary?.total_selling_value?.toFixed(2) || 0}</div>
        <div className="text-sm text-purple-600 dark:text-purple-400">Selling Value</div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{data.summary?.estimated_profit_potential?.toFixed(2) || 0}</div>
        <div className="text-sm text-orange-600 dark:text-orange-400">Profit Potential</div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-3">Valuation by Medicine Type</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicines</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Purchase Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Selling Value</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {data.by_type?.map((type: any, index: number) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {type.medicine_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {type.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ₹{type.purchase_value?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ₹{type.selling_value?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const MedicineByTypeReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicines</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Low Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Out of Stock</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.medicine_types?.map((type: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                {type.medicine_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {type.count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {type.total_stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{type.total_value?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                {type.low_stock_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                {type.out_of_stock_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MedicineByManufacturerReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manufacturer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medicines</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg Profit Margin</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.manufacturers?.map((manufacturer: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {manufacturer.manufacturer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {manufacturer.count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {manufacturer.total_stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{manufacturer.total_value?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {manufacturer.avg_profit_margin?.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SalesByPeriodReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Period</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sales Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Revenue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Tax</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.data?.map((period: any, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {new Date(period.period).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {period.sales_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{period.total_revenue?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ₹{period.total_tax?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TaxCollectionReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary?.sales_count || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Total Sales</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{data.summary?.total_tax_collected?.toFixed(2) || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">Tax Collected</div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{data.summary?.total_sales?.toFixed(2) || 0}</div>
        <div className="text-sm text-purple-600 dark:text-purple-400">Total Sales</div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.summary?.tax_percentage?.toFixed(1) || 0}%</div>
        <div className="text-sm text-orange-600 dark:text-orange-400">Tax Percentage</div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-3">GST Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GST %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tax Collected</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Taxable Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {data.gst_breakdown?.map((gst: any, index: number) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {gst.gst_percentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ₹{gst.tax_collected?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ₹{gst.taxable_amount?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {gst.item_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const NotificationSummaryReport: React.FC<{ data: any }> = ({ data }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.overall_stats?.total_notifications || 0}</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">Total Notifications</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.overall_stats?.read_notifications || 0}</div>
        <div className="text-sm text-green-600 dark:text-green-400">Read</div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.overall_stats?.unread_notifications || 0}</div>
        <div className="text-sm text-red-600 dark:text-red-400">Unread</div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.overall_stats?.active_notifications || 0}</div>
        <div className="text-sm text-purple-600 dark:text-purple-400">Active</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">By Type</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unread</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.by_type?.map((type: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm capitalize">{type.notification_type.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-sm">{type.count}</td>
                  <td className="px-4 py-2 text-sm">{type.unread_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">By Priority</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unread</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.by_priority?.map((priority: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm capitalize">{priority.priority}</td>
                  <td className="px-4 py-2 text-sm">{priority.count}</td>
                  <td className="px-4 py-2 text-sm">{priority.unread_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default ReportsPage;
