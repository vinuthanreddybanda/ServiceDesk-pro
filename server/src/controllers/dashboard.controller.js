// ============================================
// Dashboard / Stats controller
// ============================================

import Ticket from '../models/Ticket.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { TICKET_STATUS, ASSET_LIFECYCLE } from '../config/constants.js';

// @desc    Get dashboard KPIs & chart data
// @route   GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    ticketStats,
    assetStats,
    userCount,
    recentTickets,
    slaBreach,
    ticketsByStatus,
    ticketsByPriority,
    ticketTrend,
  ] = await Promise.all([
    // Ticket counts
    Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.OPEN] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.IN_PROGRESS] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.PENDING] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.RESOLVED] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.CLOSED] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', TICKET_STATUS.ESCALATED] }, 1, 0] } },
        },
      },
    ]),

    // Asset counts
    Asset.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          assigned: { $sum: { $cond: [{ $eq: ['$lifecycleStatus', ASSET_LIFECYCLE.ASSIGNED] }, 1, 0] } },
          inRepair: { $sum: { $cond: [{ $eq: ['$lifecycleStatus', ASSET_LIFECYCLE.IN_REPAIR] }, 1, 0] } },
          retired: { $sum: { $cond: [{ $eq: ['$lifecycleStatus', ASSET_LIFECYCLE.RETIRED] }, 1, 0] } },
        },
      },
    ]),

    // Active user count
    User.countDocuments({ status: 'active' }),

    // Recent tickets (last 10)
    Ticket.find()
      .populate('requester', 'name avatar')
      .populate('assignee', 'name avatar')
      .populate('priority', 'label color weight')
      .sort('-createdAt')
      .limit(10)
      .lean(),

    // SLA breached count
    Ticket.countDocuments({
      slaBreached: true,
      status: { $nin: [TICKET_STATUS.CLOSED, TICKET_STATUS.RESOLVED] },
    }),

    // Tickets by status (for pie chart)
    Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Tickets by priority (for bar chart)
    Ticket.aggregate([
      {
        $lookup: {
          from: 'priorities',
          localField: 'priority',
          foreignField: '_id',
          as: 'priorityDoc',
        },
      },
      { $unwind: { path: '$priorityDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$priorityDoc.label',
          count: { $sum: 1 },
          color: { $first: '$priorityDoc.color' },
          weight: { $first: '$priorityDoc.weight' },
        },
      },
      { $sort: { weight: 1 } },
    ]),

    // Ticket trend (last 30 days)
    Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const tickets = ticketStats[0] || { total: 0, open: 0, inProgress: 0, pending: 0, resolved: 0, closed: 0, escalated: 0 };
  const assets = assetStats[0] || { total: 0, assigned: 0, inRepair: 0, retired: 0 };

  res.json({
    success: true,
    data: {
      kpis: {
        totalTickets: tickets.total,
        openTickets: tickets.open + tickets.inProgress + tickets.pending,
        resolvedTickets: tickets.resolved + tickets.closed,
        escalatedTickets: tickets.escalated,
        slaBreached: slaBreach,
        totalAssets: assets.total,
        assignedAssets: assets.assigned,
        activeUsers: userCount,
      },
      charts: {
        ticketsByStatus,
        ticketsByPriority,
        ticketTrend,
      },
      recentTickets,
    },
  });
});

// @desc    Get asset breakdown for dashboard
// @route   GET /api/dashboard/assets
export const getAssetBreakdown = asyncHandler(async (_req, res) => {
  const [byType, byStatus, byDepartment] = await Promise.all([
    Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Asset.aggregate([
      { $group: { _id: '$lifecycleStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Asset.aggregate([
      { $match: { department: { $ne: null, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({
    success: true,
    data: { byType, byStatus, byDepartment },
  });
});
