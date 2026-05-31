/**
 * Global Error Handling Middleware
 * Provides consistent error responses with proper typing
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiResponse } from '../types';

export interface AppError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string>;
}

/**
 * Create a custom error with status code
 */
export const createError = (message: string, status: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error:', err.message);
  
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiResponse = {
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
    const response: ApiResponse = {
      success: false,
      message: 'Validation error',
      errors: Object.entries(err.errors).map(([param, msg]) => ({
        param,
        msg: msg as string,
        location: 'body',
      })),
    };
    res.status(400).json(response);
    return;
  }

  // Supabase/PostgreSQL errors
  if (err.code?.startsWith('PGRST') || err.code?.startsWith('23')) {
    const response: ApiResponse = {
      success: false,
      message: 'Database error',
      errors: [{ msg: err.message }],
    };
    res.status(400).json(response);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid token',
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      success: false,
      message: 'Token expired',
    };
    res.status(401).json(response);
    return;
  }

  // Razorpay errors
  if (err.message?.includes('razorpay') || err.message?.includes('Razorpay')) {
    const response: ApiResponse = {
      success: false,
      message: 'Payment processing error',
      errors: [{ msg: err.message }],
    };
    res.status(400).json(response);
    return;
  }

  // Default error
  const status = err.status || 500;
  const response: ApiResponse = {
    success: false,
    message: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { errors: [{ msg: err.stack || '' }] }),
  };
  
  res.status(status).json(response);
};

// Import env for development check
import env from '../config/env';

export default errorHandler;
