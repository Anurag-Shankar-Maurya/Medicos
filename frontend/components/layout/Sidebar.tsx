import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../app/providers';

export const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/medicines', icon: <Pill size={20} />, label: 'Inventory' },
    { to: '/billing', icon: <ShoppingCart size={20} />, label: 'Billing / POS' },
    { to: '/sales', icon: <FileText size={20} />, label: 'Sales History' },
    { to: '/reports', icon: <Activity size={20} />, label: 'Reports' },
    { to: '/users', icon: <Users size={20} />, label: 'Staff' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">Medicos</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
           onClick={logout}
           className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};