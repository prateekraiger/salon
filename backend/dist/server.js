"use strict";
/**
 * Luxe Salon Booking Platform - Express TypeScript Server
 * Main entry point for the backend API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Config and middleware
const env_1 = __importDefault(require("./config/env"));
const supabase_1 = require("./config/supabase");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
// Routes
const services_1 = __importDefault(require("./routes/services"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const payments_1 = __importDefault(require("./routes/payments"));
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
// ─── Security & Middleware ──────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)(env_1.default.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use((0, cors_1.default)({
    origin: [env_1.default.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true,
}));
// Raw body for Razorpay webhook (must come before express.json())
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
    const dbHealthy = await (0, supabase_1.checkSupabaseConnection)();
    res.json({
        status: dbHealthy ? 'healthy' : 'degraded',
        service: 'Luxe Salon Booking API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected',
        environment: env_1.default.NODE_ENV,
    });
});
app.get('/', (_req, res) => {
    res.json({
        message: '✂️ Luxe Salon Booking API',
        version: '2.0.0',
        status: 'running',
        docs: '/health',
        endpoints: {
            services: '/api/services',
            bookings: '/api/bookings',
            payments: '/api/payments',
            adminAuth: '/api/admin/login',
        },
    });
});
// ─── Admin Authentication ───────────────────────────────────────────────────
app.post('/api/admin/login', auth_1.authenticateAdmin);
// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/services', services_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/payments', payments_1.default);
// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// ─── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        // Check database connection on startup
        const dbHealthy = await (0, supabase_1.checkSupabaseConnection)();
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
            console.log(`🌍 Frontend: ${env_1.default.FRONTEND_URL}`);
            console.log(`📊 Database: ${dbHealthy ? '✅ Connected' : '❌ Disconnected'}`);
            console.log(`🔒 Security: JWT Auth + Helmet + CORS`);
            console.log('');
        });
    }
    catch (error) {
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
exports.default = app;
//# sourceMappingURL=server.js.map