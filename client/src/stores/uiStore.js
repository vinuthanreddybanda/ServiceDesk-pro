// ============================================
// UI store (Zustand) — sidebar, modals, toasts
// ============================================

import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Toast notifications
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    // Auto-remove after duration
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Confirm dialog
  confirmDialog: null,
  showConfirm: (config) =>
    new Promise((resolve) => {
      set({
        confirmDialog: {
          ...config,
          onConfirm: () => { set({ confirmDialog: null }); resolve(true); },
          onCancel: () => { set({ confirmDialog: null }); resolve(false); },
        },
      });
    }),
  closeConfirm: () => set({ confirmDialog: null }),
}));

export default useUIStore;
