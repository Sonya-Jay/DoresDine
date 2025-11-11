import express from 'express';
import { getTestPool } from './setup';

// Mock db module BEFORE importing routes
// Use a getter function so the pool is created when routes actually use it
jest.mock('../src/db', () => {
  const { getTestPool } = require('./setup');
  // Return a proxy that returns the test pool when accessed
  const testPool = getTestPool();
  return {
    __esModule: true,
    default: testPool,
  };
});

// Now import routes (they will use the mocked db)
import { attachUserFromToken } from '../src/middleware/auth';
import authRouter from '../src/routes/auth';
import diningRouter from '../src/routes/dining';
import followsRouter from '../src/routes/follows';
import postsRouter from '../src/routes/posts';
import searchRouter from '../src/routes/search';
import uploadRouter from '../src/routes/upload';
import usersRouter from '../src/routes/users';

// Create test app
export const createTestApp = (): express.Application => {
  const app = express();

  // Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/upload')) {
      return next();
    }
    express.json({ limit: '20mb' })(req, res, next);
  });

  // Attach user from token
  app.use(attachUserFromToken);

  // Routes
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/posts', postsRouter);
  app.use('/follows', followsRouter);
  app.use('/search', searchRouter);
  app.use('/upload', uploadRouter);
  app.use('/api/dining', diningRouter);

  // Health check
  app.get('/health', async (req, res) => {
    try {
      const testPool = getTestPool();
      await testPool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error: any) {
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        message: error.message,
        detail: error.detail || null,
        code: error.code || null,
      });
    }
  });

  // Debug endpoint
  app.get('/debug-env', (req, res) => {
    res.json({
      DATABASE_URL: process.env.DATABASE_URL ? '***' : undefined,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
};

