// Badge component
import clsx from 'clsx';

export function Badge({ children, className = '', variant = 'default', size = 'sm' }) {
  const variants = {
    default:  'bg-slate-700 text-slate-300 border-slate-600',
    success:  'bg-success/10 text-success border-success/30',
    danger:   'bg-danger/10 text-danger border-danger/30',
    warning:  'bg-warning/10 text-warning border-warning/30',
    info:     'bg-info/10 text-info border-info/30',
    amber:    'bg-amber-burnt/10 text-amber-burnt border-amber-burnt/30',
  };
  const sizes = {
    sm:  'text-xs px-2 py-0.5',
    md:  'text-sm px-2.5 py-1',
  };
  return (
    <span className={clsx(
      'badge border',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}
