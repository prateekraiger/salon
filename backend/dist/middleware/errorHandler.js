"use strict";
/**
 * Global Error Handling Middleware
 * Provides consistent error responses with proper typing
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
const zod_1 = require("zod");
/**
 * Create a custom error with status code
 */
const createError = (message, status = 500) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
exports.createError = createError;
/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    if (env_1.default.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const response = {
            success: false,
            message: 'Validation error',
            errors: err.errors.map((e) => ({
                msg: e.message,
                param: e.path.join('.'),
                location: 'body',
            })),
        };
        res.status(400).json(response);
        return;
    }
    // Express validation errors
    if (err.name === 'ValidationError' && err.errors) {
        const response = {
            success: false,
            message: 'Validation error',
            errors: Object.entries(err.errors).map(([param, msg]) => ({
                param,
                msg: msg,
                location: 'body',
            })),
        };
        res.status(400).json(response);
        return;
    }
    // Supabase/PostgreSQL errors
    if (err.code?.startsWith('PGRST') || err.code?.startsWith('23')) {
        const response = {
            success: false,
            message: 'Database error',
            errors: [{ msg: err.message }],
        };
        res.status(400).json(response);
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const response = {
            success: false,
            message: 'Invalid token',
        };
        res.status(401).json(response);
        return;
    }
    if (err.name === 'TokenExpiredError') {
        const response = {
            success: false,
            message: 'Token expired',
        };
        res.status(401).json(response);
        return;
    }
    // Razorpay errors
    if (err.message?.includes('razorpay') || err.message?.includes('Razorpay')) {
        const response = {
            success: false,
            message: 'Payment processing error',
            errors: [{ msg: err.message }],
        };
        res.status(400).json(response);
        return;
    }
    // Default error
    const status = err.status || 500;
    const response = {
        success: false,
        message: err.message || 'Internal server error',
        ...(env_1.default.NODE_ENV === 'development' && { errors: [{ msg: err.stack || '' }] }),
    };
    res.status(status).json(response);
};
exports.errorHandler = errorHandler;
// Import env for development check
const env_1 = __importDefault(require("../config/env"));
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map