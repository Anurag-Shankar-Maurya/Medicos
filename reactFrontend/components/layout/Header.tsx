import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Moon, Sun, Monitor, ShoppingCart, X, Pill, Receipt, Menu } from 'lucide-react';
import { useTheme, useAuth } from '../../app/providers';
import { useCart } from '../../app/CartContext';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import { apiClient } from '../../services/apiClient';
import { Medicine, Sale, PaginatedResponse } from '../../types';

interface SearchResult {
  type: 'medicine' | 'sale';
  id: number;
  title: string;
  subtitle: string;
  path: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up polling for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get<{ unread_count: number }>('/medicines/notifications/unread_count/');
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      // Search medicines
      try {
        const medicineResponse: PaginatedResponse<Medicine> = await apiClient.get(`/medicines/medicines/`, { search: query });
        const medicines = medicineResponse.results.slice(0, 5); // Limit to 5 results
        medicines.forEach((medicine: Medicine) => {
          results.push({
            type: 'medicine',
            id: medicine.id,
            title: medicine.name,
            subtitle: `${medicine.generic_name} - Stock: ${medicine.quantity_in_stock}`,
            path: `/inventory?search=${encodeURIComponent(medicine.name)}`
          });
        });
      } catch (error) {
        console.error('Error searching medicines:', error);
      }

      // Search sales/invoices
      try {
        const saleResponse: PaginatedResponse<Sale> = await apiClient.get(`/medicines/sales/`, { search: query });
        const sales = saleResponse.results.slice(0, 5); // Limit to 5 results
        sales.forEach((sale: Sale) => {
          results.push({
            type: 'sale',
            id: sale.id,
            title: sale.invoice_number,
            subtitle: `${sale.customer_name} - ₹${sale.total_amount}`,
            path: `/sales?search=${encodeURIComponent(sale.invoice_number)}`
          });
        });
      } catch (error) {
        console.error('Error searching sales:', error);
      }

      setSearchResults(results);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors duration-200 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div ref={searchRef} className="relative w-full max-w-md lg:max-w-none lg:w-96 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search medicines, invoices..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-10 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-3 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {result.type === 'medicine' ? (
                          <Pill size={16} className="text-primary-600 dark:text-primary-400" />
                        ) : (
                          <Receipt size={16} className="text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {result.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {result.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
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

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <div className="flex items-center ml-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-200 font-medium text-sm">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="ml-3 hidden lg:block">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.first_name || 'User'} {user?.last_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Pharmacist'}</p>
            </div>
        </div>
      </div>
    </header>
  );
};
