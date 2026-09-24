import mongoose from 'mongoose';
import { TICKET_STATUS } from '../config/constants.js';

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: true, timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
  },
  { _id: true, timestamps: true }
);

const internalNoteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
  },
  { _id: true, timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Priority',
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },
    department: {
      type: String,
      trim: true,
    },
    attachments: [attachmentSchema],
    comments: [commentSchema],
    internalNotes: [internalNoteSchema],

    // SLA fields
    slaDueAt: {
      type: Date,
    },
    slaBreached: {
      type: Boolean,
      default: false,
    },
    slaBreachedAt: {
      type: Date,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
    reopenCount: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },

    // AI classification
    aiClassification: {
      suggestedCategory: { type: String },
      suggestedPriority: { type: String },
      probableIssue: { type: String },
      confidence: { type: Number },
      accepted: { type: Boolean },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate ticketId
ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `SD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Text indexes for search
ticketSchema.index({ subject: 'text', description: 'text' });
ticketSchema.index({ requester: 1 });
ticketSchema.index({ assignee: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ department: 1 });
ticketSchema.index({ slaBreached: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
