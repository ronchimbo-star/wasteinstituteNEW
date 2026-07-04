import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const CONFIG: Record<ToastType, { icon: React.ElementType; bar: string; bg: string; text: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-emerald-500' },
  error:   { icon: XCircle,      bar: 'bg-red-500',     bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500',  bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-amber-500' },
  info:    { icon: Info,          bar: 'bg-blue-500',   bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-blue-500' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { icon: Icon, bar, bg, text, iconColor } = CONFIG[toast.type];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const dismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3700);
    return () => { clearTimeout(t); clearTimeout(dismiss); };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${bg} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <div className={`w-1 self-stretch flex-shrink-0 rounded-l-xl ${bar}`} />
      <div className="flex items-start gap-3 flex-1 py-3 pr-3">
        <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
        <p className={`text-sm font-medium flex-1 leading-snug ${text}`}>{toast.message}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${++counter.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
