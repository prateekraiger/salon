/**
 * Global Error Handling Middleware
 * Provides consistent error responses with proper typing
 */
import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    status?: number;
    code?: string;
    errors?: Record<string, string>;
}
/**
 * Create a custom error with status code
 */
export declare const createError: (message: string, status?: number) => AppError;
/**
 * Global error handler middleware
 */
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map