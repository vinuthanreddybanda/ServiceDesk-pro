// ============================================
// Async handler wrapper — eliminates try/catch in every controller
// ============================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
