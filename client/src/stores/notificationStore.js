// ============================================
// Notification store (Zustand)
// ============================================

import { create } from 'zustand';
import { notificationAPI } from '../api/endpoints.js';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (params) => {
    set({ loading: true });
    try {
      const { data } = await notificationAPI.getAll(params);
      set({ notifications: data.data, unreadCount: data.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      set({ unreadCount: data.data.count });
    } catch { /* ignore */ }
  },

  markAsRead: async (id) => {
    await notificationAPI.markAsRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await notificationAPI.markAllAsRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));

export default useNotificationStore;
