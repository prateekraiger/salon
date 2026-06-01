"use strict";
/**
 * JWT-Based Admin Authentication Middleware
 * Replaces simple secret key with secure JWT tokens
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexibleAdminAuth = exports.adminAuth = exports.authenticateAdmin = exports.verifyAdminToken = exports.generateAdminToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
/**
 * Generate JWT token for admin
 */
const generateAdminToken = () => {
    const payload = {
        adminId: 'admin',
        role: 'admin',
    };
    return jsonwebtoken_1.default.sign(payload, env_1.default.JWT_SECRET, {
        expiresIn: '24h', // Token expires in 24 hours
        issuer: 'luxe-salon-api',
        audience: 'luxe-salon-admin',
    });
};
exports.generateAdminToken = generateAdminToken;
/**
 * Verify JWT token
 */
const verifyAdminToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET, {
        issuer: 'luxe-salon-api',
        audience: 'luxe-salon-admin',
    });
};
exports.verifyAdminToken = verifyAdminToken;
/**
 * Legacy admin authentication (for backwards compatibility during transition)
 * Validates secret key and returns JWT token
 */
const authenticateAdmin = (req, res) => {
    const { secretKey } = req.body;
    if (!secretKey) {
        res.status(400).json({
            success: false,
            message: 'Secret key is required',
        });
        return;
    }
    if (secretKey !== env_1.default.ADMIN_SECRET_KEY) {
        res.status(401).json({
            success: false,
            message: 'Invalid admin credentials',
        });
        return;
    }
    // Generate and return JWT token
    const token = (0, exports.generateAdminToken)();
    res.json({
        success: true,
        data: {
            token,
            expiresIn: '24h',
        },
        message: 'Authentication successful',
    });
};
exports.authenticateAdmin = authenticateAdmin;
/**
 * JWT middleware to protect admin routes
 */
const adminAuth = (req, res, next) => {
    try {
        // Check for Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        // Extract token
        const token = authHeader.substring(7);
        // Verify token
        const decoded = (0, exports.verifyAdminToken)(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
            return;
        }
        // Attach admin info to request
        req.admin = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Authentication error.',
        });
    }
};
exports.adminAuth = adminAuth;
/**
 * Combined middleware - supports both legacy x-admin-key header and JWT
 * Use this during transition period, then migrate to adminAuth only
 */
const flexibleAdminAuth = (req, res, next) => {
    // Check for JWT first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = (0, exports.verifyAdminToken)(token);
            if (decoded.exp * 1000 < Date.now()) {
                res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.',
                });
                return;
            }
            req.admin = decoded;
            return next();
        }
        catch {
            // JWT failed, fall through to legacy check
        }
    }
    // Legacy x-admin-key check (for backwards compatibility)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey && adminKey === env_1.default.ADMIN_SECRET_KEY) {
        // Create a temporary admin payload for legacy auth
        req.admin = {
            adminId: 'admin',
            role: 'admin',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry for legacy
        };
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.',
    });
};
exports.flexibleAdminAuth = flexibleAdminAuth;
exports.default = exports.adminAuth;
//# sourceMappingURL=auth.js.map