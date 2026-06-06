/**
 * Staff API Routes
 * Team management operations: CRUD and status toggling
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult, query as validateQuery } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { flexibleAdminAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import type { Staff, StaffFormData, ApiResponse } from '../types';

const router: Router = Router();

// GET /api/staff - Get all staff (Public, optionally filtered)
router.get(
  '/',
  [
    validateQuery('active').optional().isBoolean().toBoolean(),
    validateQuery('designation').optional().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, designation } = req.query;

      let query = supabaseAdmin
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (active !== undefined) {
        query = query.eq('is_active', active);
      }
      if (designation) {
        query = query.eq('designation', designation as string);
      }

      const { data, error } = await query;

      if (error) throw error;

      const response: ApiResponse<Staff[]> = {
        success: true,
        data: data || [],
        message: `${data?.length || 0} staff members found`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/staff/:id - Get single staff member (Public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) throw createError('Staff member not found', 404);

    const response: ApiResponse<Staff> = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/staff - Create staff member (Admin only)
router.post(
  '/',
  flexibleAdminAuth,
  [
    body('name').trim().notEmpty().withMessage('Staff name is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('phone')
      .optional()
      .matches(/^[+]?[0-9\s-]{10,15}$/)
      .withMessage('Invalid phone number'),
    body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
    body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
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
      const {
        name, email, phone, designation, specialties,
        experience_years, rating, bio, image_url, is_active,
      } = req.body as StaffFormData;

      const { data, error } = await supabaseAdmin
        .from('staff')
        .insert([{
          name,
          email: email || null,
          phone: phone || null,
          designation,
          specialties: specialties || [],
          experience_years: experience_years || 0,
          rating: rating || 0,
          bio: bio || null,
          image_url: image_url || null,
          is_active: is_active !== false,
        }])
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<Staff> = {
        success: true,
        data: data as Staff,
        message: 'Staff member created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/staff/:id - Update staff member (Admin only)
router.put(
  '/:id',
  flexibleAdminAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('phone').optional().matches(/^[+]?[0-9\s-]{10,15}$/).withMessage('Invalid phone number'),
    body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
    body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
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
      const {
        name, email, phone, designation, specialties,
        experience_years, rating, bio, image_url, is_active,
      } = req.body as Partial<StaffFormData>;

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (designation !== undefined) updateData.designation = designation;
      if (specialties !== undefined) updateData.specialties = specialties;
      if (experience_years !== undefined) updateData.experience_years = experience_years;
      if (rating !== undefined) updateData.rating = rating;
      if (bio !== undefined) updateData.bio = bio;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data, error } = await supabaseAdmin
        .from('staff')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw createError('Staff member not found', 404);

      const response: ApiResponse<Staff> = {
        success: true,
        data: data as Staff,
        message: 'Staff member updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/staff/:id - Delete staff member (Admin only)
router.delete('/:id', flexibleAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin
      .from('staff')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    const response: ApiResponse = {
      success: true,
      message: 'Staff member deleted successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/staff/:id/status - Toggle staff active/inactive status (Admin only)
router.patch(
  '/:id/status',
  flexibleAdminAuth,
  [
    body('is_active').isBoolean().withMessage('is_active must be a boolean'),
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
      const { is_active } = req.body;

      const { data, error } = await supabaseAdmin
        .from('staff')
        .update({
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw createError('Staff member not found', 404);

      const response: ApiResponse<Staff> = {
        success: true,
        data: data as Staff,
        message: `Staff member ${is_active ? 'activated' : 'deactivated'} successfully`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
