// Input component
import clsx from 'clsx';

export function Input({ label, error, hint, icon: Icon, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        )}
        <input
          id={id}
          className={clsx(
            'w-full h-9 bg-slate-800 border rounded text-sm text-slate-200 placeholder-slate-500',
            'focus:outline-none focus:border-amber-burnt transition-colors-fast',
            Icon ? 'pl-8 pr-3' : 'px-3',
            error ? 'border-danger' : 'border-slate-600',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', id, rows = 4, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={clsx(
          'w-full bg-slate-800 border rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none',
          'focus:outline-none focus:border-amber-burnt transition-colors-fast',
          error ? 'border-danger' : 'border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, className = '', id, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          'w-full h-9 bg-slate-800 border rounded px-3 text-sm text-slate-200',
          'focus:outline-none focus:border-amber-burnt transition-colors-fast appearance-none',
          error ? 'border-danger' : 'border-slate-600',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
