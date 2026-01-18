import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-600 dark:text-red-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-600 dark:text-orange-400'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      icon: 'text-teal-600 dark:text-teal-400',
      text: 'text-teal-600 dark:text-teal-400'
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: 'text-cyan-600 dark:text-cyan-400',
      text: 'text-cyan-600 dark:text-cyan-400'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      icon: 'text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400'
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      icon: 'text-violet-600 dark:text-violet-400',
      text: 'text-violet-600 dark:text-violet-400'
    },
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      icon: 'text-slate-600 dark:text-slate-400',
      text: 'text-slate-600 dark:text-slate-400'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`relative overflow-hidden rounded-xl ${classes.bg} p-6 transition-all duration-200 hover:shadow-lg hover:scale-105`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 opacity-20"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${classes.text} mb-1`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-3 ${classes.bg} ${classes.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};
