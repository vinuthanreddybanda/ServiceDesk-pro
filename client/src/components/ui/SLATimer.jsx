// SLA countdown timer component
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { getSlaStatus, fmtSlaCountdown } from '../../utils/helpers.js';

const STATUS_STYLES = {
  breached:  { text: 'text-danger',       icon: AlertTriangle, label: 'Breached' },
  critical:  { text: 'text-warning',      icon: Clock,          label: 'Critical' },
  warning:   { text: 'text-amber-muted',  icon: Clock,          label: 'Warning' },
  on_track:  { text: 'text-success',      icon: Clock,          label: 'On Track' },
  none:      { text: 'text-slate-500',    icon: CheckCircle,    label: 'No SLA' },
};

export function SLATimer({ slaDueAt, slaBreached, resolved = false }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (resolved || !slaDueAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [slaDueAt, resolved]);

  if (!slaDueAt) return <span className="text-slate-500 text-xs">—</span>;

  const status = getSlaStatus(slaDueAt, slaBreached);
  const countdown = fmtSlaCountdown(slaDueAt);
  const { text, icon: Icon } = STATUS_STYLES[status] || STATUS_STYLES.none;

  return (
    <span className={clsx('sla-timer inline-flex items-center gap-1', text)}>
      <Icon size={12} className="shrink-0" />
      {resolved ? <span className="text-success text-xs">Resolved</span> : countdown}
    </span>
  );
}
