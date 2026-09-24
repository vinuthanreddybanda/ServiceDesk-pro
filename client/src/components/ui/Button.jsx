// Button component
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary:   'bg-amber-burnt hover:bg-amber-muted text-white border-transparent',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600',
    danger:    'bg-danger hover:bg-danger-light text-white border-transparent',
    ghost:     'bg-transparent hover:bg-slate-700 text-slate-300 border-transparent',
    outline:   'bg-transparent hover:bg-slate-700 text-slate-300 border-slate-600',
    success:   'bg-success hover:bg-success-light text-white border-transparent',
  };
  const sizes = {
    xs: 'h-7 px-2.5 text-xs gap-1',
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-5 text-base gap-2',
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium border rounded transition-default',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 13 : 15} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
