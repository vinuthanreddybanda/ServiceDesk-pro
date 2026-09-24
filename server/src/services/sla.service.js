// ============================================
// SLA service — due-date calculation & breach detection
// ============================================

import { addMinutes, isAfter, differenceInMinutes } from 'date-fns';

/**
 * Calculate the SLA due date based on priority's resolution time.
 * For simplicity, uses calendar time. A production system would
 * factor in business hours from the SLA policy.
 *
 * @param {Date} createdAt - Ticket creation time
 * @param {number} resolutionMins - Resolution time in minutes from priority/SLA
 * @returns {Date}
 */
export const calculateSlaDueDate = (createdAt, resolutionMins) => {
  return addMinutes(new Date(createdAt), resolutionMins);
};

/**
 * Check if an SLA is breached.
 * @param {Date} slaDueAt
 * @returns {boolean}
 */
export const isSlaBreached = (slaDueAt) => {
  if (!slaDueAt) return false;
  return isAfter(new Date(), new Date(slaDueAt));
};

/**
 * Get remaining minutes until SLA breach.
 * Returns negative value if already breached.
 */
export const getRemainingMinutes = (slaDueAt) => {
  if (!slaDueAt) return null;
  return differenceInMinutes(new Date(slaDueAt), new Date());
};

/**
 * Determine the SLA status label for display.
 */
export const getSlaStatus = (slaDueAt, slaBreached) => {
  if (slaBreached) return 'breached';
  if (!slaDueAt) return 'none';

  const remaining = getRemainingMinutes(slaDueAt);
  if (remaining <= 0) return 'breached';
  if (remaining <= 60) return 'critical'; // ≤ 1 hour
  if (remaining <= 240) return 'warning'; // ≤ 4 hours
  return 'on_track';
};
