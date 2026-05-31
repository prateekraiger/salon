/**
 * JWT-Based Admin Authentication Middleware
 * Replaces simple secret key with secure JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import type { AdminPayload } from '../types';

// Extend Express Request to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

/**
 * Generate JWT token for admin
 */
export const generateAdminToken = (): string => {
  const payload: Omit<AdminPayload, 'iat' | 'exp'> = {
    adminId: 'admin',
    role: 'admin',
  };
  
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
    issuer: 'luxe-salon-api',
    audience: 'luxe-salon-admin',
  });
};

/**
 * Verify JWT token
 */
export const verifyAdminToken = (token: string): AdminPayload => {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'luxe-salon-api',
    audience: 'luxe-salon-admin',
  }) as AdminPayload;
};

/**
 * Legacy admin authentication (for backwards compatibility during transition)
 * Validates secret key and returns JWT token
 */
export const authenticateAdmin = (req: Request, res: Response): void => {
  const { secretKey } = req.body;
  
  if (!secretKey) {
    res.status(400).json({
      success: false,
      message: 'Secret key is required',
    });
    return;
  }
  
  if (secretKey !== env.ADMIN_SECRET_KEY) {
    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials',
    });
    return;
  }
  
  // Generate and return JWT token
  const token = generateAdminToken();
  
  res.json({
    success: true,
    data: {
      token,
      expiresIn: '24h',
    },
    message: 'Authentication successful',
  });
};

/**
 * JWT middleware to protect admin routes
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
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
    const decoded = verifyAdminToken(token);
    
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
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
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

/**
 * Combined middleware - supports both legacy x-admin-key header and JWT
 * Use this during transition period, then migrate to adminAuth only
 */
export const flexibleAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Check for JWT first
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = verifyAdminToken(token);
      
      if (decoded.exp * 1000 < Date.now()) {
        res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
        });
        return;
      }
      
      req.admin = decoded;
      return next();
    } catch {
      // JWT failed, fall through to legacy check
    }
  }
  
  // Legacy x-admin-key check (for backwards compatibility)
  const adminKey = req.headers['x-admin-key'] as string;
  
  if (adminKey && adminKey === env.ADMIN_SECRET_KEY) {
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

export default adminAuth;
