import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { ToastProvider } from '../components/common/Toast';
import { CartProvider } from './CartContext';

// --- Theme Context ---
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (token: string, user: User, remember?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (token: string, userData: User, remember: boolean = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('auth_token', token);
    storage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!isAuthenticated }}>
      <ToastProvider>
        <CartProvider>
          {isAuthenticated === null ? (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : children}
        </CartProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};