// Toast notification stack
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useUIStore from '../../stores/uiStore.js';
import clsx from 'clsx';

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};
const COLORS = {
  success: 'border-success/40 bg-success/10 text-success',
  error:   'border-danger/40 bg-danger/10 text-danger',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info:    'border-info/40 bg-info/10 text-info',
};

function Toast({ id, type = 'info', title, message }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const Icon = ICONS[type] || Info;
  return (
    <div className={clsx(
      'flex items-start gap-3 p-3.5 rounded-lg border shadow-dropdown',
      'bg-slate-800 border-slate-700 animate-slide-in min-w-[300px] max-w-sm'
    )}>
      <Icon size={16} className={clsx('shrink-0 mt-0.5', COLORS[type].split(' ')[2])} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-slate-200">{title}</p>}
        {message && <p className="text-xs text-slate-400 mt-0.5">{message}</p>}
      </div>
      <button onClick={() => removeToast(id)} className="text-slate-500 hover:text-slate-300 shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => <Toast key={t.id} {...t} />)}
    </div>
  );
}

// Helper hook
export function useToast() {
  const addToast = useUIStore((s) => s.addToast);
  return {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
  };
}
