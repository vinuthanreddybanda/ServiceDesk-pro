// ============================================
// App layout wrapper
// ============================================
import { Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { ToastStack } from '../ui/Toast.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import useAuthStore from '../../stores/authStore.js';
import useNotificationStore from '../../stores/notificationStore.js';

export function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  // Periodically refresh notification count
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 60000); // every minute
    return () => clearInterval(id);
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastStack />
      <ConfirmDialog />
    </div>
  );
}
