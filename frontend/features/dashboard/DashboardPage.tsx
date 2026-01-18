import React, { useEffect, useState } from 'react';
import { DollarSign, Package, AlertTriangle, ShoppingCart, Bell } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { DashboardStats, ChartDataPoint } from '../../types';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import { PaymentMethodPieChart } from './PaymentMethodPieChart';
import { TransactionsFeed } from './TransactionsFeed';
import { TopProductsTable } from './TopProductsTable';
import { InventoryHealthChart } from './InventoryHealthChart';

const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsData, chartRes] = await Promise.all([
        apiClient.get<DashboardStats>('/dashboard/stats/'),
        apiClient.get<ChartDataPoint[]>('/dashboard/sales-chart/')
      ]);
      setStats(statsData);
      setChartData(chartRes);
    } catch (e: any) {
      console.error("Failed to fetch dashboard stats", e);
      addToast("Failed to load dashboard data. " + e.message, 'error');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  if (error || !stats) return (
    <div className="min-h-[400px] flex items-center justify-center">
        <EmptyState
            title="Failed to load dashboard"
            description="We encountered an error while fetching the dashboard data."
            actionLabel="Retry"
            onAction={fetchData}
            icon={<AlertTriangle size={48} className="text-red-500" />}
        />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          {stats.alerts_summary.unreadNotifications > 0 && (
            <div className="relative">
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.alerts_summary.unreadNotifications}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`$${stats.sales_summary.todaysRevenue.toLocaleString()}`}
          subtitle={`${stats.sales_summary.todaysTransactions} transactions`}
          icon={<DollarSign size={24} className="text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="Average Order Value"
          value={`$${stats.sales_summary.averageOrderValue.toFixed(2)}`}
          subtitle={`${stats.sales_summary.totalLifetimeSales} total sales`}
          icon={<ShoppingCart size={24} className="text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.inventory_summary.lowStockCount}
          subtitle={`${stats.inventory_summary.outOfStockCount} out of stock`}
          icon={<Package size={24} className="text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          title="Inventory Value"
          value={`$${(stats.inventory_summary.inventoryCostValue / 1000).toFixed(0)}K`}
          subtitle={`${stats.inventory_summary.averageProfitMargin.toFixed(1)}% margin`}
          icon={<AlertTriangle size={24} className="text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Analytics (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          <InventoryHealthChart inventorySummary={stats.inventory_summary} />
          <PaymentMethodPieChart data={stats.payment_analytics} />
        </div>

        {/* Right Column - Activity Feeds (1/3 width) */}
        <div className="space-y-6">
          <TransactionsFeed />
          <TopProductsTable />
        </div>
      </div>
    </div>
  );
};
