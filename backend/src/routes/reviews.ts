/**
 * Reviews API Routes
 * Testimonials and admin moderation endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult, query as validateQuery } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { flexibleAdminAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import type { Review, ReviewFormData, ApiResponse, ReviewStats } from '../types';

const router: Router = Router();

// GET /api/reviews - Get public approved reviews (Public)
router.get(
  '/',
  [
    validateQuery('service_id').optional().trim(),
    validateQuery('staff_id').optional().trim(),
    validateQuery('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
    validateQuery('page').optional().isInt({ min: 1 }).toInt(),
    validateQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { service_id, staff_id, rating, page = 1, limit = 20 } = req.query as unknown as {
        service_id?: string;
        staff_id?: string;
        rating?: number;
        page?: number;
        limit?: number;
      };
      const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

      let query = supabaseAdmin
        .from('reviews')
        .select(
          `*,
          services ( id, name, category ),
          staff ( id, name, designation )`,
          { count: 'exact' }
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(String(limit)) - 1);

      if (service_id) query = query.eq('service_id', service_id);
      if (staff_id) query = query.eq('staff_id', staff_id);
      if (rating) query = query.eq('rating', rating);

      const { data, error, count } = await query;

      if (error) throw error;

      const response: ApiResponse<Review[]> = {
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          page: parseInt(String(page)),
          limit: parseInt(String(limit)),
          totalPages: Math.ceil((count || 0) / parseInt(String(limit))),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/reviews - Submit a new review (Public)
router.post(
  '/',
  [
    body('booking_id').optional().trim(),
    body('service_id').optional().trim(),
    body('staff_id').optional().trim(),
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation error',
        errors: errors.array().map((e) => ({
          msg: e.msg,
          param: e.type === 'field' ? e.path : undefined,
          location: (e as any).location,
        })),
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { booking_id, service_id, staff_id, customer_name, rating, comment } = req.body as ReviewFormData;

      // Verify booking exists if provided
      if (booking_id) {
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select('id')
          .eq('id', booking_id)
          .single();
        if (!booking) {
          throw createError('Booking not found', 404);
        }
      }

      // Verify service exists if provided
      if (service_id) {
        const { data: service } = await supabaseAdmin
          .from('services')
          .select('id')
          .eq('id', service_id)
          .eq('is_deleted', false)
          .single();
        if (!service) {
          throw createError('Service not found', 404);
        }
      }

      // Verify staff exists if provided
      if (staff_id) {
        const { data: staff } = await supabaseAdmin
          .from('staff')
          .select('id')
          .eq('id', staff_id)
          .single();
        if (!staff) {
          throw createError('Staff member not found', 404);
        }
      }

      // Check for duplicate review by same customer for same booking
      if (booking_id) {
        const { data: existing } = await supabaseAdmin
          .from('reviews')
          .select('id')
          .eq('booking_id', booking_id)
          .eq('customer_name', customer_name)
          .maybeSingle();

        if (existing) {
          throw createError('You have already submitted a review for this booking', 409);
        }
      }

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .insert([{
          booking_id: booking_id || null,
          service_id: service_id || null,
          staff_id: staff_id || null,
          customer_name,
          rating,
          comment: comment || null,
          is_approved: false, // Reviews require admin approval
        }])
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<Review> = {
        success: true,
        data: data as Review,
        message: 'Review submitted successfully and is pending approval',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reviews - Admin view of all reviews (Admin only)
router.get(
  '/admin/reviews',
  flexibleAdminAuth,
  [
    validateQuery('status').optional().isIn(['approved', 'pending']).trim(),
    validateQuery('page').optional().isInt({ min: 1 }).toInt(),
    validateQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, page = 1, limit = 20 } = req.query as unknown as {
        status?: 'approved' | 'pending';
        page?: number;
        limit?: number;
      };
      const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

      let query = supabaseAdmin
        .from('reviews')
        .select(
          `*,
          services ( id, name, category ),
          staff ( id, name, designation )`,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(String(limit)) - 1);

      if (status === 'approved') query = query.eq('is_approved', true);
      if (status === 'pending') query = query.eq('is_approved', false);

      const { data, error, count } = await query;

      if (error) throw error;

      const response: ApiResponse<Review[]> = {
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          page: parseInt(String(page)),
          limit: parseInt(String(limit)),
          totalPages: Math.ceil((count || 0) / parseInt(String(limit))),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reviews/stats - Review statistics (Admin only)
router.get('/admin/reviews/stats', flexibleAdminAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalResult, averageResult] = await Promise.all([
      supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('reviews').select('rating').eq('is_approved', true),
    ]);

    const ratings = averageResult.data || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
      : 0;

    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratings.filter((r) => r.rating === rating).length,
    }));

    const stats: ReviewStats = {
      total_reviews: totalResult.count || 0,
      average_rating: Number(avgRating.toFixed(1)),
      rating_distribution: distribution,
      recent_reviews: [],
    };

    const response: ApiResponse<ReviewStats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/reviews/:id/moderate - Approve/reject a review (Admin only)
router.patch(
  '/admin/reviews/:id/moderate',
  flexibleAdminAuth,
  [
    body('is_approved').isBoolean().withMessage('is_approved must be a boolean'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation error',
        errors: errors.array().map((e) => ({
          msg: e.msg,
          param: e.type === 'field' ? e.path : undefined,
          location: (e as any).location,
        })),
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { is_approved } = req.body;

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({
          is_approved,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw createError('Review not found', 404);

      const response: ApiResponse<Review> = {
        success: true,
        data: data as Review,
        message: `Review ${is_approved ? 'approved' : 'rejected'} successfully`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/reviews/:id - Delete a review (Admin only)
router.delete('/admin/reviews/:id', flexibleAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    const response: ApiResponse = {
      success: true,
      message: 'Review deleted successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
