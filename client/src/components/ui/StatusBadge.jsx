// StatusBadge and PriorityBadge — semantic ticket badges
import { Badge } from './Badge.jsx';
import { STATUS_META, PRIORITY_META, LIFECYCLE_META, ROLES_META } from '../../utils/helpers.js';
import clsx from 'clsx';

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
  return (
    <span className={clsx('badge border text-xs px-2 py-0.5', meta.color)}>
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  if (!priority) return <span className="text-slate-500 text-xs">—</span>;
  const label = typeof priority === 'string' ? priority : priority.label;
  const meta = PRIORITY_META[label] || { color: 'bg-slate-700/20 text-slate-400 border-slate-600', dot: 'bg-slate-500' };
  return (
    <span className={clsx('badge border text-xs px-2 py-0.5 gap-1.5', meta.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />
      {label}
    </span>
  );
}

export function LifecycleBadge({ status }) {
  const meta = LIFECYCLE_META[status] || { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
  return (
    <span className={clsx('badge border text-xs px-2 py-0.5', meta.color)}>
      {meta.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const meta = ROLES_META[role] || { label: role, color: 'bg-slate-700 text-slate-300' };
  return (
    <span className={clsx('badge text-xs px-2 py-0.5', meta.color)}>
      {meta.label}
    </span>
  );
}
