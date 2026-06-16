import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './backend/routes';
import { rateLimiter } from './backend/middleware/rateLimiter';
import { sanitizeMiddleware } from './backend/middleware/sanitize';
import { errorHandler } from './backend/middleware/errorHandler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy to allow express-rate-limit to correctly identify client IPs
  app.set('trust proxy', 1);

  // 1. Basic parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 2. Logging custom middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // 3. Security sanitization (anti-NoSQL operator injection)
  app.use(sanitizeMiddleware);

  // 4. Rate Limiting on API endpoints
  app.use('/api', rateLimiter);

  // 5. Register modular backend Router
  app.use('/api', apiRouter);

  // 6. Vite Dev / Production Routing Wrapper
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite Dev Server Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 7. Global system try/catch error handler middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 Green Bistro Server running on port ${PORT}`);
    console.log(`🔗 Interface available: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer();
