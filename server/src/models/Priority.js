import mongoose from 'mongoose';

const prioritySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Priority label is required'],
      trim: true,
      unique: true,
    },
    weight: {
      type: Number,
      required: [true, 'Priority weight is required'],
      min: 1,
      max: 4,
      unique: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    slaResponseMins: {
      type: Number,
      required: [true, 'SLA response time is required'],
      min: 1,
    },
    slaResolutionMins: {
      type: Number,
      required: [true, 'SLA resolution time is required'],
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

prioritySchema.index({ weight: 1 });

const Priority = mongoose.model('Priority', prioritySchema);
export default Priority;
