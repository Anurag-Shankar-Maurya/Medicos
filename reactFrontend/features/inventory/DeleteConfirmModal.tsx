import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={onConfirm}
              isLoading={loading}
              leftIcon={<Trash2 size={18} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
