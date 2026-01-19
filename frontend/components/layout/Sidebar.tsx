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
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../../app/providers';
import { useCart } from '../../app/CartContext';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const { cartCount } = useCart();

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
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">M</span>
          </div>
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