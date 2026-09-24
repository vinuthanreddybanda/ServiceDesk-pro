// ============================================
// ServiceDesk Pro — Application Constants
// ============================================

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  EMPLOYEE: 'employee',
  ASSET_MANAGER: 'asset_manager',
};

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
};

export const ASSET_LIFECYCLE = {
  PROCURED: 'procured',
  ASSIGNED: 'assigned',
  IN_REPAIR: 'in_repair',
  REPLACED: 'replaced',
  RETIRED: 'retired',
};

export const PRIORITY_WEIGHTS = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

export const KB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const NOTIFICATION_TYPES = {
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_STATUS_CHANGED: 'ticket_status_changed',
  TICKET_COMMENTED: 'ticket_commented',
  SLA_WARNING: 'sla_warning',
  SLA_BREACHED: 'sla_breached',
  TICKET_ESCALATED: 'ticket_escalated',
  ASSET_ASSIGNED: 'asset_assigned',
};

export const AUDIT_ENTITY_TYPES = {
  TICKET: 'Ticket',
  ASSET: 'Asset',
  USER: 'User',
  SLA_POLICY: 'SLAPolicy',
  CATEGORY: 'Category',
  PRIORITY: 'Priority',
  KNOWLEDGE_ARTICLE: 'KnowledgeArticle',
  VENDOR: 'Vendor',
  ORGANIZATION: 'Organization',
};

export const AUDIT_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  ESCALATED: 'escalated',
  COMMENT_ADDED: 'comment_added',
  NOTE_ADDED: 'note_added',
  ATTACHMENT_ADDED: 'attachment_added',
  SLA_BREACHED: 'sla_breached',
  LIFECYCLE_CHANGED: 'lifecycle_changed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_RESET: 'password_reset',
};

// Valid lifecycle transitions for assets
export const ASSET_TRANSITIONS = {
  procured: ['assigned', 'retired'],
  assigned: ['in_repair', 'replaced', 'retired'],
  in_repair: ['assigned', 'replaced', 'retired'],
  replaced: ['retired'],
  retired: [],
};

// Business hours default config
export const DEFAULT_BUSINESS_HOURS = {
  start: '09:00',
  end: '18:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
  timezone: 'UTC',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
