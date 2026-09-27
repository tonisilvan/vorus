'use client';

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="toast-position" role="status" aria-live="polite">
      <div className="toast-surface">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{message}</span>
        <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100" aria-label="Cerrar aviso">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
