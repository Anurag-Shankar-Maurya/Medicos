import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface InventoryHealthChartProps {
  inventorySummary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    inventoryCostValue: number;
    inventoryPotentialValue: number;
    estimatedPotentialProfit: number;
    averageProfitMargin: number;
    inventoryTurnoverRatio: number;
  };
}

export const InventoryHealthChart: React.FC<InventoryHealthChartProps> = ({ inventorySummary }) => {
  // Prepare data for inventory status chart
  const inventoryStatusData = [
    {
      name: 'In Stock',
      value: inventorySummary.totalProducts - inventorySummary.lowStockCount - inventorySummary.outOfStockCount,
      color: '#10b981', // green
    },
    {
      name: 'Low Stock',
      value: inventorySummary.lowStockCount,
      color: '#f59e0b', // amber
    },
    {
      name: 'Out of Stock',
      value: inventorySummary.outOfStockCount,
      color: '#ef4444', // red
    },
  ];

  // Prepare data for inventory value chart
  const inventoryValueData = [
    {
      name: 'Cost Value',
      value: inventorySummary.inventoryCostValue,
      color: '#3b82f6', // blue
    },
    {
      name: 'Potential Sales',
      value: inventorySummary.inventoryPotentialValue,
      color: '#10b981', // green
    },
    {
      name: 'Est. Profit',
      value: inventorySummary.estimatedPotentialProfit,
      color: '#8b5cf6', // purple
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-slate-300">
            Value: <span className="text-white font-semibold">${payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <Package size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inventory Health</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Status Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock Status</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStatusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Value Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Value Breakdown</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {inventoryValueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-1 text-xl font-bold text-slate-900 dark:text-white">
            <TrendingUp size={16} className="text-green-600" />
            <span>{inventorySummary.averageProfitMargin.toFixed(1)}%</span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Avg Margin</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ${(inventorySummary.inventoryCostValue / 1000).toFixed(1)}k
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Total Cost</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${(inventorySummary.estimatedPotentialProfit / 1000).toFixed(1)}k
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Est. Profit</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-center space-x-1">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-xl font-bold text-amber-600">{inventorySummary.expiringSoonCount}</span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Expiring Soon</p>
        </div>
      </div>
    </div>
  );
};
