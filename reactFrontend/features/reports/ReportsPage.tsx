import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { MetricCard } from './MetricCard';
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Download,
  Search,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingDown,
  Target,
  Zap,
  ChevronDown,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';

interface ReportData {
  [key: string]: any;
}

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState('stock-status');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const reports = [
    {
      id: 'stock-status',
      name: 'Stock Status',
      description: 'Low stock, out of stock, and overstock analysis',
      icon: Package,
      color: 'blue'
    },
    {
      id: 'medicine-catalog',
      name: 'Medicine Catalog',
      description: 'Complete list of all medicines',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'profit-margin',
      name: 'Profit Margin Analysis',
      description: 'Profit margins by medicine',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'sales-summary',
      name: 'Sales Summary',
      description: 'Overall sales performance',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      id: 'top-selling-medicines',
      name: 'Top Selling Medicines',
      description: 'Best performing medicines',
      icon: Target,
      color: 'orange'
    },
    {
      id: 'payment-method-analysis',
      name: 'Payment Methods',
      description: 'Payment method breakdown',
      icon: PieChart,
      color: 'indigo'
    },
    {
      id: 'gst-analysis',
      name: 'GST Analysis',
      description: 'GST collection and inventory analysis',
      icon: BarChart3,
      color: 'teal'
    },
    {
      id: 'inventory-valuation',
      name: 'Inventory Valuation',
      description: 'Stock value analysis',
      icon: Activity,
      color: 'cyan'
    },
    {
      id: 'medicine-by-type',
      name: 'Medicines by Type',
      description: 'Analysis by medicine category',
      icon: Package,
      color: 'rose'
    },
    {
      id: 'medicine-by-manufacturer',
      name: 'Medicines by Manufacturer',
      description: 'Analysis by manufacturer',
      icon: Users,
      color: 'amber'
    },
    {
      id: 'sales-by-period',
      name: 'Sales by Period',
      description: 'Daily/weekly/monthly sales trends',
      icon: Calendar,
      color: 'violet'
    },
    {
      id: 'tax-collection',
      name: 'Tax Collection',
      description: 'Tax collection summary',
      icon: FileText,
      color: 'slate'
    },
    {
      id: 'notification-summary',
      name: 'Notification Summary',
      description: 'Notification system analysis',
      icon: AlertTriangle,
      color: 'red'
    }
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

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      // Convert report data to CSV format
      const flattenObject = (obj: any, prefix = ''): any => {
        const flattened: any = {};
        for (const key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            Object.assign(flattened, flattenObject(obj[key], prefix + key + '.'));
          } else {
            flattened[prefix + key] = obj[key];
          }
        }
        return flattened;
      };

      // For tabular reports, extract the main data array
      let csvData: any[] = [];
      const headers: string[] = [];

      if (Array.isArray(reportData)) {
        csvData = reportData;
      } else {
        // Find the main data array in the report
        const dataKeys = Object.keys(reportData).filter(key =>
          Array.isArray(reportData[key]) && reportData[key].length > 0
        );

        if (dataKeys.length > 0) {
          csvData = reportData[dataKeys[0]];
          // Add a column to indicate which report this is
          csvData = csvData.map(item => ({ ...item, report_type: activeReport.replace('-', ' ') }));
        } else {
          // Fallback: create a single row with flattened data
          csvData = [flattenObject(reportData)];
        }
      }

      if (csvData.length === 0) {
        alert('No data available for export');
        return;
      }

      // Get all possible headers
      const allKeys = new Set<string>();
      csvData.forEach(item => {
        if (typeof item === 'object') {
          Object.keys(item).forEach(key => allKeys.add(key));
        }
      });

      const csvHeaders = Array.from(allKeys);
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row =>
          csvHeaders.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeReport}-report_${new Date().toISOString().split('T')[0]}.csv`);
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

  const exportToJSON = async () => {
    setExportLoading(true);
    try {
      // Create enhanced JSON export with metadata
      const exportObject = {
        export_info: {
          generated_at: new Date().toISOString(),
          report_type: activeReport,
          report_name: reports.find(r => r.id === activeReport)?.name || activeReport,
          filters_applied: {
            date_range: dateRange.start_date || dateRange.end_date ? {
              start_date: dateRange.start_date || null,
              end_date: dateRange.end_date || null
            } : null,
            search_term: searchTerm || null,
            limit: filters.limit,
            period: filters.period
          },
          generated_by: 'Medicos Pharmacy Management System'
        },
        data: reportData
      };

      // Create and download JSON file
      const jsonContent = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeReport}-report_${new Date().toISOString().split('T')[0]}.json`);
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

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      // For PDF export, we'll use the browser's print functionality
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }

      const reportTitle = reports.find(r => r.id === activeReport)?.name || activeReport;

      const renderTableForReport = (data: any, reportType: string) => {
        switch (reportType) {
          case 'stock-status':
            if (data.low_stock?.length > 0) {
              return `
                <h2>Low Stock Medicines</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Strength</th>
                      <th>Current Stock</th>
                      <th>Reorder Level</th>
                      <th>Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.low_stock.map((medicine: any) => `
                      <tr>
                        <td>${medicine.name}</td>
                        <td>${medicine.strength}</td>
                        <td>${medicine.quantity_in_stock}</td>
                        <td>${medicine.reorder_level}</td>
                        <td>${medicine.shortage || 0}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            if (data.out_of_stock?.length > 0) {
              return `
                <h2>Out of Stock Medicines</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Strength</th>
                      <th>Manufacturer</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.out_of_stock.map((medicine: any) => `
                      <tr>
                        <td>${medicine.name}</td>
                        <td>${medicine.strength}</td>
                        <td>${medicine.manufacturer}</td>
                        <td>${new Date(medicine.updated_at).toLocaleDateString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            return '<p>No stock issues found.</p>';

          case 'medicine-catalog':
            return `
              <h2>Medicine Catalog (${data.count || 0} items)</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Manufacturer</th>
                    <th>Stock</th>
                    <th>Selling Price</th>
                    <th>GST %</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.medicines?.map((medicine: any) => `
                    <tr>
                      <td>${medicine.name} (${medicine.strength})</td>
                      <td>${medicine.medicine_type}</td>
                      <td>${medicine.manufacturer}</td>
                      <td>${medicine.quantity_in_stock}</td>
                      <td>₹${medicine.selling_price}</td>
                      <td>${medicine.gst_percentage}%</td>
                    </tr>
                  `).join('') || '<tr><td colspan="6">No medicines found</td></tr>'}
                </tbody>
              </table>
            `;

          case 'profit-margin':
            if (data.high_profit_medicines?.length > 0) {
              return `
                <h2>High Profit Medicines</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.high_profit_medicines.map((medicine: any) => `
                      <tr>
                        <td>${medicine.name} (${medicine.strength})</td>
                        <td>₹${medicine.purchase_price}</td>
                        <td>₹${medicine.selling_price}</td>
                        <td>${medicine.profit_margin?.toFixed(1)}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            return '<p>No profit margin data available.</p>';

          case 'top-selling-medicines':
            return `
              <h2>Top Selling Medicines</h2>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Medicine</th>
                    <th>Type</th>
                    <th>Manufacturer</th>
                    <th>Quantity Sold</th>
                    <th>Total Revenue</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.top_medicines?.map((medicine: any, index: number) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${medicine.medicine__name}</td>
                      <td>${medicine.medicine__medicine_type}</td>
                      <td>${medicine.medicine__manufacturer}</td>
                      <td>${medicine.total_quantity}</td>
                      <td>₹${medicine.total_revenue?.toFixed(2)}</td>
                      <td>${medicine.order_count}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="7">No sales data found</td></tr>'}
                </tbody>
              </table>
            `;

          case 'payment-method-analysis':
            return `
              <h2>Payment Method Analysis</h2>
              <table>
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Transactions</th>
                    <th>Total Amount</th>
                    <th>Average Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.payment_methods?.map((method: any) => `
                    <tr>
                      <td>${method.payment_method.replace('_', ' ')}</td>
                      <td>${method.transaction_count}</td>
                      <td>₹${method.total_amount?.toFixed(2)}</td>
                      <td>₹${method.average_amount?.toFixed(2)}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="4">No payment data found</td></tr>'}
                </tbody>
              </table>
            `;

          default:
            return `<div style="font-family: monospace; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</div>`;
        }
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTitle} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; font-weight: bold; }
            .summary { background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 8px; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div class="summary">
            <h3>Report Summary</h3>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Report Type:</strong> ${activeReport.replace('-', ' ')}</p>
            ${dateRange.start_date || dateRange.end_date ? `<p><strong>Date Range:</strong> ${dateRange.start_date || 'Start'} to ${dateRange.end_date || 'End'}</p>` : ''}
            ${searchTerm ? `<p><strong>Search Term:</strong> ${searchTerm}</p>` : ''}
          </div>

          ${renderTableForReport(reportData, activeReport)}

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

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Generating report...</p>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Select a report and apply filters to generate insights</p>
        </div>
      );
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
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Report</h3>
            <p className="text-gray-600 dark:text-gray-400">Choose a report from the sidebar to view detailed analytics</p>
          </div>
        );
    }
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-slate-500 mt-1">Comprehensive insights and business intelligence for your pharmacy</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <div className="relative">
                <Button
                  leftIcon={<Download size={18} />}
                  rightIcon={<ChevronDown size={16} />}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={!reportData || exportLoading}
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
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limit Results
                </label>
                <Input
                  type="number"
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value }))}
                  min="1"
                  max="100"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchReportData} disabled={loading} className="w-full">
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Report Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredReports.map((report) => {
                  const IconComponent = report.icon;
                  const isActive = activeReport === report.id;

                  return (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`w-full text-left p-4 rounded-xl mb-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : `text-${report.color}-500`}`} />
                        <div>
                          <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {report.name}
                          </div>
                          <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const activeReportData = reports.find(r => r.id === activeReport);
                      const IconComponent = activeReportData?.icon || BarChart3;
                      return (
                        <>
                          <IconComponent className="w-6 h-6 text-primary-600" />
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activeReportData?.name || 'Reports'}
                          </h2>
                        </>
                      );
                    })()}
                  </div>
                  {reportData && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {renderReportContent()}
              </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Medicines"
        value={data.summary?.total_medicines || 0}
        icon={Package}
        color="blue"
      />
      <MetricCard
        title="Low Stock Alert"
        value={data.summary?.low_stock_count || 0}
        subtitle="Needs reorder"
        icon={AlertTriangle}
        color="yellow"
      />
      <MetricCard
        title="Out of Stock"
        value={data.summary?.out_of_stock_count || 0}
        subtitle="Urgent restock needed"
        icon={XCircle}
        color="red"
      />
      <MetricCard
        title="Healthy Stock"
        value={data.summary?.healthy_stock_count || 0}
        subtitle="Well stocked items"
        icon={CheckCircle}
        color="green"
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="High Profit Medicines"
        value={data.summary?.high_profit_count || 0}
        subtitle="50%+ profit margin"
        icon={TrendingUp}
        color="green"
      />
      <MetricCard
        title="Medium Profit Medicines"
        value={data.summary?.medium_profit_count || 0}
        subtitle="20-50% profit margin"
        icon={TrendingUp}
        color="blue"
      />
      <MetricCard
        title="Low Profit Medicines"
        value={data.summary?.low_profit_count || 0}
        subtitle="0-20% profit margin"
        icon={TrendingDown}
        color="yellow"
      />
      <MetricCard
        title="Loss Making Medicines"
        value={data.summary?.loss_count || 0}
        subtitle="Negative profit margin"
        icon={XCircle}
        color="red"
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Sales"
        value={data.summary?.total_sales || 0}
        subtitle="Number of transactions"
        icon={DollarSign}
        color="blue"
      />
      <MetricCard
        title="Total Revenue"
        value={`₹${data.summary?.total_revenue?.toFixed(2) || 0}`}
        subtitle="Gross sales amount"
        icon={TrendingUp}
        color="green"
      />
      <MetricCard
        title="Tax Collected"
        value={`₹${data.summary?.total_tax_collected?.toFixed(2) || 0}`}
        subtitle="GST collected"
        icon={FileText}
        color="purple"
      />
      <MetricCard
        title="Net Sales"
        value={`₹${data.summary?.net_sales?.toFixed(2) || 0}`}
        subtitle="Revenue after discounts"
        icon={Target}
        color="orange"
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Medicines"
        value={data.summary?.total_medicines || 0}
        subtitle="Active inventory items"
        icon={Package}
        color="blue"
      />
      <MetricCard
        title="Purchase Value"
        value={`₹${data.summary?.total_purchase_value?.toFixed(2) || 0}`}
        subtitle="Total cost invested"
        icon={DollarSign}
        color="green"
      />
      <MetricCard
        title="Selling Value"
        value={`₹${data.summary?.total_selling_value?.toFixed(2) || 0}`}
        subtitle="Potential revenue"
        icon={TrendingUp}
        color="purple"
      />
      <MetricCard
        title="Profit Potential"
        value={`₹${data.summary?.estimated_profit_potential?.toFixed(2) || 0}`}
        subtitle="Estimated margin"
        icon={Target}
        color="orange"
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Sales"
        value={data.summary?.sales_count || 0}
        subtitle="Number of transactions"
        icon={DollarSign}
        color="blue"
      />
      <MetricCard
        title="Tax Collected"
        value={`₹${data.summary?.total_tax_collected?.toFixed(2) || 0}`}
        subtitle="GST collected"
        icon={FileText}
        color="green"
      />
      <MetricCard
        title="Total Sales Value"
        value={`₹${data.summary?.total_sales?.toFixed(2) || 0}`}
        subtitle="Gross sales amount"
        icon={TrendingUp}
        color="purple"
      />
      <MetricCard
        title="Tax Percentage"
        value={`${data.summary?.tax_percentage?.toFixed(1) || 0}%`}
        subtitle="Tax as % of sales"
        icon={Target}
        color="orange"
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Notifications"
        value={data.overall_stats?.total_notifications || 0}
        subtitle="All system notifications"
        icon={AlertTriangle}
        color="blue"
      />
      <MetricCard
        title="Read Notifications"
        value={data.overall_stats?.read_notifications || 0}
        subtitle="Notifications viewed"
        icon={CheckCircle}
        color="green"
      />
      <MetricCard
        title="Unread Notifications"
        value={data.overall_stats?.unread_notifications || 0}
        subtitle="Requires attention"
        icon={AlertTriangle}
        color="red"
      />
      <MetricCard
        title="Active Notifications"
        value={data.overall_stats?.active_notifications || 0}
        subtitle="Currently active"
        icon={Activity}
        color="purple"
      />
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
