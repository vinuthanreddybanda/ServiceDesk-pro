// ============================================
// Knowledge Base controller
// ============================================

import KnowledgeArticle from '../models/KnowledgeArticle.js';
import { AppError } from '../middleware/errorHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { PAGINATION, KB_STATUS } from '../config/constants.js';

// @desc    Get all articles (public: published only; staff: all)
// @route   GET /api/knowledge
export const getArticles = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    search,
    status,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  // Non-staff only see published articles
  if (req.user.role === 'employee') {
    query.status = KB_STATUS.PUBLISHED;
  } else if (status) {
    query.status = status;
  }

  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  sort.split(',').forEach((f) => {
    if (f.startsWith('-')) sortObj[f.substring(1)] = -1;
    else sortObj[f] = 1;
  });

  const [articles, total] = await Promise.all([
    KnowledgeArticle.find(query)
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    KnowledgeArticle.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: articles,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single article
// @route   GET /api/knowledge/:id
export const getArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate('category', 'name');

  if (!article) throw new AppError('Article not found', 404);

  // Increment view count
  article.viewCount += 1;
  await article.save({ validateBeforeSave: false });

  res.json({ success: true, data: article });
});

// @desc    Create an article
// @route   POST /api/knowledge
export const createArticle = asyncHandler(async (req, res) => {
  req.body.author = req.user._id;
  const article = await KnowledgeArticle.create(req.body);
  const populated = await KnowledgeArticle.findById(article._id)
    .populate('author', 'name avatar')
    .populate('category', 'name');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update an article
// @route   PUT /api/knowledge/:id
export const updateArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('author', 'name avatar')
    .populate('category', 'name');

  if (!article) throw new AppError('Article not found', 404);
  res.json({ success: true, data: article });
});

// @desc    Delete an article
// @route   DELETE /api/knowledge/:id
export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findById(req.params.id);
  if (!article) throw new AppError('Article not found', 404);
  await article.deleteOne();
  res.json({ success: true, message: 'Article deleted' });
});

// @desc    Mark article as helpful
// @route   POST /api/knowledge/:id/helpful
export const markHelpful = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findById(req.params.id);
  if (!article) throw new AppError('Article not found', 404);
  article.helpfulCount += 1;
  await article.save({ validateBeforeSave: false });
  res.json({ success: true, data: { helpfulCount: article.helpfulCount } });
});
