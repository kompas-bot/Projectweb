'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    borderColor: 'border-green-400',
    iconBg: 'bg-white/20',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-red-500 to-rose-500',
    borderColor: 'border-red-400',
    iconBg: 'bg-white/20',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    borderColor: 'border-amber-400',
    iconBg: 'bg-white/20',
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    borderColor: 'border-blue-400',
    iconBg: 'bg-white/20',
  },
};

export default function Toast({ message, type, isVisible, onClose, duration = 4000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${config.bgColor}
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          rounded-xl shadow-2xl overflow-hidden
          min-w-[320px] max-w-[420px]
        `}
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/30 overflow-hidden">
          <div 
            className="h-full bg-white/60 animate-progress"
            style={{ 
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
        
        <div className="p-4 flex items-start gap-3">
          <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 pt-0.5">
            <p className="text-white font-medium leading-relaxed">{message}</p>
          </div>
          
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}
