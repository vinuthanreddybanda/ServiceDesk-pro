import mongoose from 'mongoose';
import { ASSET_LIFECYCLE } from '../config/constants.js';

const assetHistorySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    fromStatus: { type: String },
    toStatus: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  { _id: true, timestamps: true }
);

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer', 'phone', 'tablet', 'server', 'network_device', 'software_license', 'other'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: 200,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    purchaseDate: {
      type: Date,
    },
    purchaseCost: {
      type: Number,
      min: 0,
    },
    warrantyExpiry: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    lifecycleStatus: {
      type: String,
      enum: Object.values(ASSET_LIFECYCLE),
      default: ASSET_LIFECYCLE.PROCURED,
    },
    notes: {
      type: String,
      trim: true,
    },
    history: [assetHistorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate assetTag
assetSchema.pre('save', async function (next) {
  if (!this.assetTag) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetTag = `AST-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Text indexes for search
assetSchema.index({ assetTag: 'text', serialNumber: 'text', name: 'text' });
assetSchema.index({ type: 1 });
assetSchema.index({ lifecycleStatus: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ vendor: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
