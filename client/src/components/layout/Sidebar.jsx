// ============================================
// Sidebar navigation
// ============================================
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Monitor, Users, Settings,
  BookOpen, ChevronLeft, ChevronRight, Zap, BarChart2,
} from 'lucide-react';
import clsx from 'clsx';
import useUIStore from '../../stores/uiStore.js';
import useAuthStore from '../../stores/authStore.js';
import { Avatar } from '../ui/Avatar.jsx';
import { canManageAssets, isAdminOrManager } from '../../utils/helpers.js';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',     roles: ['admin','manager','technician','asset_manager'] },
  { to: '/tickets',   icon: Ticket,          label: 'Tickets',        roles: ['admin','manager','technician','employee'] },
  { to: '/assets',    icon: Monitor,         label: 'Assets',         roles: ['admin','manager','technician','asset_manager'] },
  { to: '/knowledge', icon: BookOpen,        label: 'Knowledge Base', roles: ['admin','manager','technician','employee'] },
  { to: '/users',     icon: Users,           label: 'Users',          roles: ['admin','manager'] },
  { to: '/settings',  icon: Settings,        label: 'Settings',       roles: ['admin','manager'] },
];

function NavItem({ to, icon: Icon, label, collapsed }) {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded transition-default text-sm font-medium group relative',
        active
          ? 'bg-amber-burnt/15 text-amber-burnt'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
      )}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {active && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-amber-burnt rounded-full" />}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const visibleNav = NAV.filter((n) => n.roles.includes(role));

  return (
    <aside className={clsx(
      'h-screen flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 shrink-0 relative z-20',
      sidebarCollapsed ? 'w-14' : 'w-[220px]'
    )}>
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-2.5 px-3 h-14 border-b border-slate-800 shrink-0',
        sidebarCollapsed && 'justify-center'
      )}>
        <div className="w-7 h-7 rounded bg-amber-burnt flex items-center justify-center shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="text-sm font-bold text-slate-100">ServiceDesk</span>
            <span className="text-amber-burnt text-sm font-bold"> Pro</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleNav.map((item) => (
          <NavItem key={item.to} {...item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="mx-2 mb-2 px-2 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded transition-default flex items-center justify-center"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User card */}
      <div className={clsx(
        'border-t border-slate-800 p-3 flex items-center gap-2.5 shrink-0',
        sidebarCollapsed && 'justify-center'
      )}>
        <Avatar name={user?.name} src={user?.avatar} size="sm" />
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize truncate">{user?.role}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
