import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Bell, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { DashboardStats, ChartDataPoint } from '../../types';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import { PaymentMethodPieChart } from './PaymentMethodPieChart';
import { TransactionsFeed } from './TransactionsFeed';
import { TopProductsTable } from './TopProductsTable';
import { InventoryHealthChart } from './InventoryHealthChart';
import { SalesTrendChart } from './SalesTrendChart';

// Enhanced Stat Card with modern styling
const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {subtitle}
            </span>
            {trend && <span className="text-xs text-green-500 font-medium">{trend}</span>}
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110 duration-300`}>
        {React.cloneElement(icon, { size: 24, className: color.replace('bg-', 'text-').replace('/10', '') })}
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
    <div className="min-h-[60vh] flex items-center justify-center p-6">
        <EmptyState
            title="Unable to load dashboard"
            description="We encountered technical difficulty while fetching your analytics data."
            actionLabel="Try Again"
            onAction={fetchData}
            icon={<AlertTriangle size={64} className="text-red-500 opacity-80" />}
        />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center">
            <Activity size={16} className="mr-2 text-blue-500" />
            Here's what's happening with your pharmacy today.
          </p>
        </div>

        <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>
          
            {stats.alerts_summary.unreadNotifications > 0 && (
                <button className="relative p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group">
                    <Bell size={20} className="text-red-600 dark:text-red-400 group-hover:animate-pulse" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {stats.alerts_summary.unreadNotifications}
                    </span>
                </button>
            )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`$${stats.sales_summary.todaysRevenue.toLocaleString()}`}
          subtitle={`${stats.sales_summary.todaysTransactions} transactions`}
          icon={<DollarSign />}
          color="bg-emerald-500 text-emerald-600"
          trend="+12% vs yesterday"
        />
        <StatCard
          title="Avg. Order Value"
          value={`$${stats.sales_summary.averageOrderValue.toFixed(2)}`}
          subtitle="Per transaction"
          icon={<ShoppingCart />}
          color="bg-blue-500 text-blue-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.inventory_summary.lowStockCount}
          subtitle={`${stats.inventory_summary.outOfStockCount} out of stock`}
          icon={<Package />}
          color="bg-amber-500 text-amber-600"
        />
        <StatCard
          title="Inventory Value"
          value={`$${(stats.inventory_summary.inventoryCostValue / 1000).toFixed(1)}k`}
          subtitle={`$${(stats.inventory_summary.estimatedPotentialProfit / 1000).toFixed(1)}k pot. profit`}
          icon={<TrendingUp />}
          color="bg-violet-500 text-violet-600"
        />
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Trend Chart - Takes up 2 columns */}
        <div className="xl:col-span-2">
          <SalesTrendChart data={chartData} />
        </div>
        
        {/* Payment Methods - Takes up 1 column */}
        <div className="xl:col-span-1">
           <PaymentMethodPieChart data={stats.payment_analytics} />
        </div>
      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryHealthChart inventorySummary={stats.inventory_summary} />
        <TopProductsTable />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <TransactionsFeed />
      </div>
    </div>
  );
};
