// Avatar component — shows image or initials fallback
import clsx from 'clsx';
import { getInitials } from '../../utils/helpers.js';

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
};

export function Avatar({ name, src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover shrink-0', SIZES[size], className)}
      />
    );
  }
  return (
    <span className={clsx(
      'rounded-full bg-amber-burnt/20 text-amber-burnt font-semibold',
      'inline-flex items-center justify-center shrink-0',
      SIZES[size], className
    )}>
      {getInitials(name)}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 3, size = 'sm' }) {
  const shown = users.slice(0, max);
  const rest = users.length - max;
  return (
    <div className="flex -space-x-1.5">
      {shown.map((u) => (
        <Avatar key={u._id} name={u.name} src={u.avatar} size={size}
          className="ring-1 ring-slate-800" />
      ))}
      {rest > 0 && (
        <span className={clsx(
          'rounded-full bg-slate-700 text-slate-300 text-xs font-medium',
          'inline-flex items-center justify-center ring-1 ring-slate-800',
          SIZES[size]
        )}>+{rest}</span>
      )}
    </div>
  );
}
