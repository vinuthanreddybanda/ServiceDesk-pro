// ============================================
// Audit service — log entity changes
// ============================================

import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry.
 *
 * @param {Object} params
 * @param {string} params.entityType - From AUDIT_ENTITY_TYPES constant
 * @param {string} params.entityId - MongoDB _id of the entity
 * @param {string} params.action - From AUDIT_ACTIONS constant
 * @param {string} params.performedBy - User _id
 * @param {Object} [params.changes] - { before, after }
 * @param {Object} [params.metadata] - Extra data
 * @param {string} [params.ipAddress]
 */
export const createAuditLog = async ({
  entityType,
  entityId,
  action,
  performedBy,
  changes = {},
  metadata = {},
  ipAddress = '',
}) => {
  try {
    await AuditLog.create({
      entityType,
      entityId,
      action,
      performedBy,
      changes,
      metadata,
      ipAddress,
    });
  } catch (err) {
    // Audit logging should never crash the request
    console.error('[AUDIT] Failed to create log:', err.message);
  }
};
