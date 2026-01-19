import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, User, Receipt } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { RecentTransaction } from '../../types';
import { Spinner } from '../../components/common/Spinner';

export const TransactionsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get<RecentTransaction[]>('/dashboard/recent-transactions/');
        setTransactions(response);
      } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Transactions</h3>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Transactions</h3>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Receipt size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {transaction.invoice}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <User size={12} />
                    <span>{transaction.customer}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 text-lg font-semibold text-slate-900 dark:text-white">
                  <DollarSign size={16} className="text-green-600" />
                  <span>{transaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">{transaction.time}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'Paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recent transactions</p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={() => navigate('/sales')} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View all transactions →
          </button>
        </div>
      )}
    </div>
  );
};
