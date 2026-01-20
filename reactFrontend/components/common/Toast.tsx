import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container: Fixed Bottom Right */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .toast-slide-in {
            animation: slideInRight 0.3s ease-out forwards;
          }
        `}</style>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              toast-slide-in pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border-l-4
              backdrop-blur-sm bg-white/95 dark:bg-slate-900/95
              transition-all duration-300 hover:shadow-xl hover:translate-x-[-4px]
              ${toast.type === 'success' ? 'border-green-500 text-green-700 dark:text-green-400' : ''}
              ${toast.type === 'error' ? 'border-red-500 text-red-700 dark:text-red-400' : ''}
              ${toast.type === 'info' ? 'border-blue-500 text-blue-700 dark:text-blue-400' : ''}
              ${toast.type === 'warning' ? 'border-orange-500 text-orange-700 dark:text-orange-400' : ''}
            `}
            role="alert"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
              {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
              {toast.type === 'warning' && <AlertTriangle size={20} className="text-orange-500" />}
            </div>

            {/* Message */}
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-5">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`
                  rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${toast.type === 'success' ? 'text-green-500 hover:text-green-600 focus:ring-green-500' : ''}
                  ${toast.type === 'error' ? 'text-red-500 hover:text-red-600 focus:ring-red-500' : ''}
                  ${toast.type === 'info' ? 'text-blue-500 hover:text-blue-600 focus:ring-blue-500' : ''}
                  ${toast.type === 'warning' ? 'text-orange-500 hover:text-orange-600 focus:ring-orange-500' : ''}
                `}
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Close</span>
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};