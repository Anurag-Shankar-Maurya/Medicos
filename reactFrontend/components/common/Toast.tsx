import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

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

  // Limit to last 5 toasts and reverse for stacking logic (Index 0 = Front)
  const visibleToasts = toasts.slice(-5).reverse();

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-16 right-5 z-[100] w-full max-w-sm flex flex-col items-end transition-all duration-300 pointer-events-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full min-h-[100px] flex justify-end perspective-[1000px]">
          {visibleToasts.map((toast, index) => {
            // Dynamic Styles for Stacking Effect
            const isFront = index === 0;
            const offset = index * 12; // Pixel offset for the stack look
            const scale = 1 - index * 0.05; // Shrink items further back
            const opacity = 1 - index * 0.15; // Fade items further back

            // Styles when hovering (Fan out)
            const hoverTransform = `translateY(${index * 85}px) scale(1) translateZ(0)`;
            // Styles when stacked (Card deck)
            const stackTransform = `translateY(${offset}px) scale(${scale}) translateZ(-${index * 20}px)`;

            return (
              <div
                key={toast.id}
                style={{
                  zIndex: visibleToasts.length - index,
                  transform: isHovered ? hoverTransform : stackTransform,
                  opacity: isHovered ? 1 : opacity,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
                className={`
                  w-full max-w-sm pointer-events-auto
                  flex items-start p-4 rounded-xl border-l-4 shadow-xl
                  backdrop-blur-md bg-white/90 dark:bg-slate-900/90
                  ${toast.type === 'success' ? 'border-green-500 shadow-green-500/10' : ''}
                  ${toast.type === 'error' ? 'border-red-500 shadow-red-500/10' : ''}
                  ${toast.type === 'info' ? 'border-blue-500 shadow-blue-500/10' : ''}
                  ${toast.type === 'warning' ? 'border-orange-500 shadow-orange-500/10' : ''}
                  group
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
                      rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                      ${toast.type === 'success' ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30' : ''}
                      ${toast.type === 'error' ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' : ''}
                      ${toast.type === 'info' ? 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30' : ''}
                      ${toast.type === 'warning' ? 'text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToast(toast.id);
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};