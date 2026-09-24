// ============================================
// ServiceDesk Pro — Server Entry Point
// ============================================

import app from './src/app.js';
import connectDB from './src/config/db.js';
import env from './src/config/env.js';

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start HTTP server
  const server = app.listen(env.PORT, () => {
    console.log(`[SERVER] ServiceDesk Pro running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[SERVER] ${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log('[SERVER] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Unhandled rejection handler
  process.on('unhandledRejection', (err) => {
    console.error('[SERVER] Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
