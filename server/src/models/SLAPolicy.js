import mongoose from 'mongoose';

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'SLA policy name is required'],
      trim: true,
    },
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Priority',
      required: [true, 'Priority reference is required'],
    },
    businessHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5] },
      timezone: { type: String, default: 'UTC' },
    },
    responseTime: {
      type: Number,
      required: [true, 'Response time (minutes) is required'],
      min: 1,
    },
    resolutionTime: {
      type: Number,
      required: [true, 'Resolution time (minutes) is required'],
      min: 1,
    },
    escalationChain: [
      {
        level: { type: Number, required: true },
        notifyRole: { type: String, trim: true },
        notifyUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        afterMinutes: { type: Number, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

slaPolicySchema.index({ priority: 1 });
slaPolicySchema.index({ isActive: 1 });

const SLAPolicy = mongoose.model('SLAPolicy', slaPolicySchema);
export default SLAPolicy;
