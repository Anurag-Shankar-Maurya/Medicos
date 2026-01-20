import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Activity,
  X,
  Bell,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth, useTheme } from '../../app/providers';
import { useCart } from '../../app/CartContext';
import { NotificationDropdown } from './NotificationDropdown';
import { apiClient } from '../../services/apiClient';
import logo from '/public/logo.svg';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/inventory', icon: <Pill size={20} />, label: 'Inventory' },
    { to: '/billing', icon: <ShoppingCart size={20} />, label: 'Billing / POS', badge: cartCount > 0 ? cartCount : null },
    { to: '/sales', icon: <FileText size={20} />, label: 'Sales History' },
    { to: '/reports', icon: <Activity size={20} />, label: 'Reports' },
    { to: '/users', icon: <Users size={20} />, label: 'Staff' },
  ];

  return (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Medicos Logo"
            className="h-8 w-8 mr-3"
          />
          <span className="text-xl font-bold text-slate-900 dark:text-white">Medicos</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
               <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-primary-600 text-white rounded-full">
                  {item.badge}
               </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors w-full text-left"
            title={`Theme: ${theme}`}
          >
            {getThemeIcon()}
            <span className="ml-3">Theme</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigate('/cart');
                onClose?.();
              }}
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
                className="flex items-center p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
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
          </div>
        </div>

        <div className="flex items-center px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-200 font-medium text-sm mr-3">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.first_name || 'User'} {user?.last_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role || 'Pharmacist'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
           onClick={() => {
             logout();
             onClose?.();
           }}
           className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </button>
      </div>
    </>
  );
};
