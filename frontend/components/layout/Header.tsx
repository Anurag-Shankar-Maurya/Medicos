import React from 'react';
import { Bell, Search, Moon, Sun, Monitor, ShoppingCart } from 'lucide-react';
import { useTheme, useAuth } from '../../app/providers';
import { useCart } from '../../app/CartContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    switch(theme) {
      case 'dark': return <Moon size={20} />;
      case 'light': return <Sun size={20} />;
      default: return <Monitor size={20} />;
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors duration-200 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-96 max-w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search medicines, invoices..."
            className="block w-full pl-10 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={`Theme: ${theme}`}
        >
          {getThemeIcon()}
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
          title="Shopping Cart"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>

        <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <div className="flex items-center ml-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-200 font-medium text-sm">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.first_name || 'User'} {user?.last_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Pharmacist'}</p>
            </div>
        </div>
      </div>
    </header>
  );
};
