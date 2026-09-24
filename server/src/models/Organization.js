import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: 100,
    },
    departments: [
      {
        type: String,
        trim: true,
      },
    ],
    settings: {
      businessHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
        days: { type: [Number], default: [1, 2, 3, 4, 5] },
        timezone: { type: String, default: 'UTC' },
      },
      ticketPrefix: { type: String, default: 'SD' },
      assetPrefix: { type: String, default: 'AST' },
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
