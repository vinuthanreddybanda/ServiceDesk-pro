import mongoose from 'mongoose';

const workLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Technician reference is required'],
    },
    timeSpentMins: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

workLogSchema.index({ ticket: 1 });
workLogSchema.index({ technician: 1 });

const WorkLog = mongoose.model('WorkLog', workLogSchema);
export default WorkLog;
