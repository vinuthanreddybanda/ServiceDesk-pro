// EmptyState, Spinner, and PageHeader shared components
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2 size={size} className={clsx('animate-spin text-amber-burnt', className)} />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full min-h-64">
      <Spinner size={32} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
          <Icon size={24} className="text-slate-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <p className="text-xs text-slate-500 mb-0.5">{breadcrumb}</p>
        )}
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function Card({ children, className = '', padding = true }) {
  return (
    <div className={clsx('card', padding && 'p-4', className)}>
      {children}
    </div>
  );
}

export function Divider({ className = '' }) {
  return <hr className={clsx('border-slate-700', className)} />;
}
