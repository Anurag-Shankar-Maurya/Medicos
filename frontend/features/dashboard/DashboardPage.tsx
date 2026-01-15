import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { DashboardStats } from '../../types';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

const StatCard = ({ title, value, icon, trend, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp size={14} className="mr-1" /> {trend}
      </span>
      <span className="text-slate-400 ml-2">vs last week</span>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsData, chartRes] = await Promise.all([
        apiClient.get<DashboardStats>('/dashboard/stats/'),
        apiClient.get<any[]>('/dashboard/sales-chart/')
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.todaysRevenue?.toLocaleString() ?? 0}`} 
          icon={<DollarSign size={24} className="text-primary-600" />}
          trend="+12.5%"
          color="bg-primary-50 dark:bg-primary-900/20"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStockCount} 
          icon={<Package size={24} className="text-orange-600" />}
          trend="-2.4%"
          color="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard 
          title="Expiring Batches" 
          value={stats.expiringSoonCount} 
          icon={<AlertTriangle size={24} className="text-red-600" />}
          trend="+4.1%"
          color="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard 
          title="Total Sales" 
          value={stats.totalSales} 
          icon={<Package size={24} className="text-blue-600" />}
          trend="+0.2%"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Weekly Sales Overview</h3>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No chart data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-80 w-full">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                </LineChart>
                </ResponsiveContainer>
             ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">No trend data available</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};