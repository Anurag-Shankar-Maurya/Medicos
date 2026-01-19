import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { TopSellingProduct } from '../../types';
import { Spinner } from '../../components/common/Spinner';

export const TopProductsTable: React.FC = () => {
  const [products, setProducts] = useState<TopSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await apiClient.get<TopSellingProduct[]>('/dashboard/top-selling-products/');
        setProducts(response);
      } catch (error) {
        console.error('Failed to fetch top selling products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Selling Products</h3>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp size={20} className="text-green-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Selling Products</h3>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={`${product.medicine__name}-${index}`}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    #{index + 1}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {product.medicine__name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {product.medicine__medicine_type}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center space-x-1 text-slate-900 dark:text-white">
                  <Package size={14} className="text-blue-600" />
                  <span className="font-semibold">{product.total_qty.toLocaleString()}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">units</span>
                </div>

                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <DollarSign size={14} />
                  <span className="font-semibold">${product.total_revenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No sales data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
