/**
 * JWT-Based Admin Authentication Middleware
 * Replaces simple secret key with secure JWT tokens
 */
import { Request, Response, NextFunction } from 'express';
import type { AdminPayload } from '../types';
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
export declare const generateAdminToken: () => string;
/**
 * Verify JWT token
 */
export declare const verifyAdminToken: (token: string) => AdminPayload;
/**
 * Legacy admin authentication (for backwards compatibility during transition)
 * Validates secret key and returns JWT token
 */
export declare const authenticateAdmin: (req: Request, res: Response) => void;
/**
 * JWT middleware to protect admin routes
 */
export declare const adminAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Combined middleware - supports both legacy x-admin-key header and JWT
 * Use this during transition period, then migrate to adminAuth only
 */
export declare const flexibleAdminAuth: (req: Request, res: Response, next: NextFunction) => void;
export default adminAuth;
//# sourceMappingURL=auth.d.ts.map