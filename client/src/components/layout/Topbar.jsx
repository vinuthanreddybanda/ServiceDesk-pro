// ============================================
// Topbar — search, notifications, user menu
// ============================================
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import useAuthStore from '../../stores/authStore.js';
import useNotificationStore from '../../stores/notificationStore.js';
import { Avatar } from '../ui/Avatar.jsx';
import { fmtRelative } from '../../utils/helpers.js';

function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();
  useEffect(() => { fetchNotifications({ limit: 10 }); }, []);
  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-dropdown z-50 overflow-hidden animate-slide-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-semibold text-slate-200">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-amber-burnt hover:text-amber-muted">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={clsx(
                'w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors-fast',
                !n.isRead && 'bg-amber-burnt/5'
              )}
            >
              <div className="flex items-start gap-2">
                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-burnt mt-1.5 shrink-0" />}
                <div className={clsx('flex-1', n.isRead && 'ml-3.5')}>
                  <p className="text-xs font-medium text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1">{fmtRelative(n.createdAt)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function UserMenu({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-dropdown z-50 overflow-hidden animate-slide-in">
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
      </div>
      <button
        onClick={() => { navigate('/profile'); onClose(); }}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors-fast"
      >
        <User size={14} /> My Profile
      </button>
      <button
        onClick={() => { logout(); navigate('/login'); onClose(); }}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-slate-700/50 transition-colors-fast"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  );
}

export function Topbar() {
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const notifRef = useRef();
  const userRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/tickets?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-4 gap-4 shrink-0">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full h-8 pl-8 pr-3 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt transition-colors-fast"
          />
        </div>
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-default"
            id="notif-btn"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger text-white text-[9px] leading-none flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 h-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-default"
            id="user-menu-btn"
          >
            <Avatar name={user?.name} src={user?.avatar} size="xs" />
            <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate hidden sm:block">
              {user?.name}
            </span>
            <ChevronDown size={12} />
          </button>
          {userOpen && <UserMenu onClose={() => setUserOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
