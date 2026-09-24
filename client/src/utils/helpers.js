// ============================================
// Shared utility helpers
// ============================================

import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';

// Format dates
export const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';
export const fmtDateTime = (d) => d ? format(new Date(d), 'dd MMM yyyy, HH:mm') : '—';
export const fmtRelative = (d) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—';

// SLA countdown
export const getSlaStatus = (slaDueAt, slaBreached) => {
  if (slaBreached) return 'breached';
  if (!slaDueAt) return 'none';
  const mins = differenceInMinutes(new Date(slaDueAt), new Date());
  if (mins <= 0) return 'breached';
  if (mins <= 60) return 'critical';
  if (mins <= 240) return 'warning';
  return 'on_track';
};

export const fmtSlaCountdown = (slaDueAt) => {
  if (!slaDueAt) return null;
  const mins = differenceInMinutes(new Date(slaDueAt), new Date());
  if (mins <= 0) {
    const elapsed = Math.abs(mins);
    const h = Math.floor(elapsed / 60);
    const m = elapsed % 60;
    return h > 0 ? `-${h}h ${m}m` : `-${m}m`;
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Status → label/color mappings
export const STATUS_META = {
  open:        { label: 'Open',        color: 'bg-info/10 text-info border-info/20' },
  in_progress: { label: 'In Progress', color: 'bg-amber-burnt/10 text-amber-burnt border-amber-burnt/20' },
  pending:     { label: 'Pending',     color: 'bg-warning/10 text-warning border-warning/20' },
  resolved:    { label: 'Resolved',    color: 'bg-success/10 text-success border-success/20' },
  closed:      { label: 'Closed',      color: 'bg-slate-600/20 text-slate-400 border-slate-600/20' },
  escalated:   { label: 'Escalated',   color: 'bg-danger/10 text-danger border-danger/20' },
};
export const TICKET_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'escalated', label: 'Escalated' },
];

export const PRIORITY_META = {
  Critical: { color: 'bg-danger/10 text-danger border-danger/20',       dot: 'bg-danger' },
  High:     { color: 'bg-amber-burnt/10 text-amber-burnt border-amber-burnt/20', dot: 'bg-amber-burnt' },
  Medium:   { color: 'bg-warning/10 text-warning border-warning/20',    dot: 'bg-warning' },
  Low:      { color: 'bg-info/10 text-info border-info/20',             dot: 'bg-info' },
};

export const LIFECYCLE_META = {
  procured:  { label: 'Procured',   color: 'bg-info/10 text-info border-info/20' },
  assigned:  { label: 'Assigned',   color: 'bg-success/10 text-success border-success/20' },
  in_repair: { label: 'In Repair',  color: 'bg-warning/10 text-warning border-warning/20' },
  replaced:  { label: 'Replaced',   color: 'bg-slate-600/20 text-slate-400 border-slate-600/20' },
  retired:   { label: 'Retired',    color: 'bg-danger/10 text-danger border-danger/20' },
};
export const ASSET_TRANSITIONS = {
  procured: ['assigned', 'retired'],
  assigned: ['in_repair', 'replaced', 'retired'],
  in_repair: ['assigned', 'replaced', 'retired'],
  replaced: ['assigned', 'retired'],
  retired: [],
};

export const ROLES_META = {
  admin:         { label: 'Admin',         color: 'bg-danger/10 text-danger' },
  manager:       { label: 'Manager',       color: 'bg-amber-burnt/10 text-amber-burnt' },
  technician:    { label: 'Technician',    color: 'bg-info/10 text-info' },
  employee:      { label: 'Employee',      color: 'bg-success/10 text-success' },
  asset_manager: { label: 'Asset Manager', color: 'bg-warning/10 text-warning' },
};


// Truncate string
export const truncate = (str, n = 60) =>
  str && str.length > n ? `${str.slice(0, n)}…` : str;

// Extract error message from axios error
export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

// Avatar initials fallback
export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// Role-based checks
export const canManageTickets = (role) =>
  ['admin', 'manager', 'technician'].includes(role);
export const canManageAssets = (role) =>
  ['admin', 'manager', 'asset_manager'].includes(role);
export const isAdmin = (role) => role === 'admin';
export const isAdminOrManager = (role) => ['admin', 'manager'].includes(role);

// Build query string from object (removes undefined/null/empty values)
export const buildQuery = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  return params;
};
