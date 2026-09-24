import mongoose from 'mongoose';
import { KB_STATUS } from '../config/constants.js';

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    status: {
      type: String,
      enum: Object.values(KB_STATUS),
      default: KB_STATUS.DRAFT,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    relatedTickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

knowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
knowledgeArticleSchema.index({ status: 1 });
knowledgeArticleSchema.index({ category: 1 });
knowledgeArticleSchema.index({ author: 1 });

const KnowledgeArticle = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
export default KnowledgeArticle;
