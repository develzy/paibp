"use client";

import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lakukan", 
  cancelText = "Batal",
  showCancel = true,
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    primary: "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"
  };

  const iconClasses = {
    danger: "text-red-500 bg-red-50 dark:bg-red-900/20",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    primary: "text-primary-500 bg-primary-50 dark:bg-primary-900/20"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md fade-in" style={{ position: 'fixed' }}>
      <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 scale-in relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${iconClasses[variant]}`}>
            <AlertCircle size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`w-full py-3.5 px-6 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] ${variantClasses[variant]}`}
            >
              {confirmText}
            </button>
            {showCancel && (
              <button 
                onClick={onClose}
                className="w-full py-3 text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
