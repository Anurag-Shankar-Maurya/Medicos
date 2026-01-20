import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PaymentMethodPieChartProps {
  data: Array<{
    payment_method: string;
    total: number;
    count: number;
  }>;
}

const COLORS = {
  cash: '#10b981',      // green
  card: '#3b82f6',      // blue
  upi: '#8b5cf6',       // purple
  bank_transfer: '#f59e0b', // amber
  insurance: '#ef4444', // red
};

const PAYMENT_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance',
};

export const PaymentMethodPieChart: React.FC<PaymentMethodPieChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: PAYMENT_LABELS[item.payment_method as keyof typeof PAYMENT_LABELS] || item.payment_method,
    value: item.total,
    count: item.count,
    percentage: 0, // Will be calculated below
  }));

  // Calculate percentages
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-slate-300">
            Amount: <span className="text-white font-semibold">₹{data.value.toLocaleString()}</span>
          </p>
          <p className="text-slate-300">
            Transactions: <span className="text-white font-semibold">{data.count}</span>
          </p>
          <p className="text-slate-300">
            Share: <span className="text-white font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Payment Methods</h3>
      <div className="h-80 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name.toLowerCase().replace(' ', '_') as keyof typeof COLORS] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: '#64748b' }}>
                    {value} ({entry.payload?.percentage?.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No payment data available
          </div>
        )}
      </div>
    </div>
  );
};
