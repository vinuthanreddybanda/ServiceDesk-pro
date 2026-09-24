// ============================================
// Dashboard page
// ============================================
import { useState, useEffect } from 'react';
import { Ticket, Monitor, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../api/endpoints.js';
import { PageHeader, Card, LoadingScreen } from '../components/ui/Common.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { fmtRelative, fmtDate } from '../utils/helpers.js';

const KPI_COLORS = {
  amber: 'bg-amber-burnt/10 border-amber-burnt/20 text-amber-burnt',
  info:  'bg-info/10 border-info/20 text-info',
  success:'bg-success/10 border-success/20 text-success',
  danger:'bg-danger/10 border-danger/20 text-danger',
};

function KPICard({ label, value, icon: Icon, color = 'amber', sub }) {
  return (
    <div className="card p-4 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${KPI_COLORS[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CHART_COLORS = ['#c2742f','#3b82b0','#4a7c59','#b8860b','#b91c1c','#6b7280'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs shadow-dropdown">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(({ data: d }) => setData(d.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const { kpis, charts, recentTickets } = data || {};

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Live overview of your helpdesk operations" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Open Tickets" value={kpis?.openTickets} icon={Ticket} color="amber" sub={`${kpis?.escalatedTickets} escalated`} />
        <KPICard label="SLA Breached" value={kpis?.slaBreached} icon={AlertTriangle} color="danger" sub="Active tickets" />
        <KPICard label="Total Assets" value={kpis?.totalAssets} icon={Monitor} color="info" sub={`${kpis?.assignedAssets} assigned`} />
        <KPICard label="Active Users" value={kpis?.activeUsers} icon={Users} color="success" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Ticket trend */}
        <Card className="lg:col-span-2">
          <p className="text-sm font-semibold text-slate-200 mb-4">Ticket Volume (30 days)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={charts?.ticketTrend || []}>
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Tickets" stroke="#c2742f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* By Status */}
        <Card>
          <p className="text-sm font-semibold text-slate-200 mb-4">By Status</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={charts?.ticketsByStatus || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                {(charts?.ticketsByStatus || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {(charts?.ticketsByStatus || []).map((s, i) => (
              <div key={s._id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-xs text-slate-400 capitalize truncate">{s._id}</span>
                <span className="text-xs text-slate-200 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* By Priority bar + Recent tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority chart */}
        <Card>
          <p className="text-sm font-semibold text-slate-200 mb-4">By Priority</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={charts?.ticketsByPriority || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Tickets" radius={[0, 2, 2, 0]}>
                {(charts?.ticketsByPriority || []).map((entry, i) => (
                  <Cell key={i} fill={entry.color || CHART_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent tickets */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-semibold text-slate-200">Recent Tickets</p>
          </div>
          <div className="divide-y divide-slate-700/50">
            {(recentTickets || []).slice(0, 6).map((t) => (
              <div key={t._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors-fast">
                <Avatar name={t.requester?.name} src={t.requester?.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{t.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.ticketId} · {fmtRelative(t.createdAt)}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
