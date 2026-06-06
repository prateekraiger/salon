/**
 * Luxe Salon Booking Platform - Express TypeScript Server
 * Main entry point for the backend API
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Config and middleware
import env from './config/env';
import { checkSupabaseConnection } from './config/supabase';
import { errorHandler } from './middleware/errorHandler';
import { authenticateAdmin } from './middleware/auth';

// Routes
import servicesRouter from './routes/services';
import bookingsRouter from './routes/bookings';
import paymentsRouter from './routes/payments';
import settingsRouter from './routes/settings';
import staffRouter from './routes/staff';
import reviewsRouter from './routes/reviews';

const app: Express = express();
const PORT = env.PORT;

// ─── Security & Middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true,
  })
);

// Raw body for Razorpay webhook (must come before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await checkSupabaseConnection();

  res.json({
    status: dbHealthy ? 'healthy' : 'degraded',
    service: 'Luxe Salon Booking API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
    environment: env.NODE_ENV,
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '✂️ Luxe Salon Booking API',
    version: '2.0.0',
    status: 'running',
    docs: '/health',
    endpoints: {
      services: '/api/services',
      bookings: '/api/bookings',
      payments: '/api/payments',
      settings: '/api/settings',
      staff: '/api/staff',
      reviews: '/api/reviews',
      adminAuth: '/api/admin/login',
    },
  });
});

// ─── Admin Authentication ───────────────────────────────────────────────────
app.post('/api/admin/login', authenticateAdmin);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/reviews', reviewsRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Check database connection on startup
    const dbHealthy = await checkSupabaseConnection();
    if (!dbHealthy) {
      console.warn('⚠️ Warning: Database connection failed. Server will start but may not function correctly.');
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('✂️  ================================================');
      console.log(`✂️   Luxe Salon API v2.0.0 running on port ${PORT}`);
      console.log('✂️  ================================================');
      console.log(`📍 Local:    http://localhost:${PORT}`);
      console.log(`❤️  Health:   http://localhost:${PORT}/health`);
      console.log(`📋 Services: http://localhost:${PORT}/api/services`);
      console.log(`🔐 Admin:    http://localhost:${PORT}/api/admin/login`);
      console.log(`🌍 Frontend: ${env.FRONTEND_URL}`);
      console.log(`📊 Database: ${dbHealthy ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`🔒 Security: JWT Auth + Helmet + CORS`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
