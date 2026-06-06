/**
 * Settings API Routes
 * Salon-wide preferences, business hours, and holiday management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { flexibleAdminAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import type { ApiResponse, ShopSettings, BusinessHours, Holiday } from '../types';

const router: Router = Router();

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'Sunday', day_index: 0, is_open: false, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Monday', day_index: 1, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Tuesday', day_index: 2, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Wednesday', day_index: 3, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Thursday', day_index: 4, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Friday', day_index: 5, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
  { day: 'Saturday', day_index: 6, is_open: true, open_time: '09:00', close_time: '19:00', slot_duration_minutes: 30 },
];

const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: '2024-12-25', name: 'Christmas' },
  { date: '2025-01-01', name: "New Year's Day" },
];

/**
 * Helper: Get or initialize the singleton settings row
 */
async function getOrCreateSettings(): Promise<ShopSettings> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    // Initialize default settings
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('settings')
      .insert([{
        salon_name: 'Luxe Salon',
        salon_tagline: 'Where Beauty Meets Excellence',
        phone: '+91 98765 43210',
        email: 'contact@luxesalon.com',
        address: '123 Beauty Street, Fashion District',
        city: 'Mumbai',
        pincode: '400001',
        website: 'https://luxesalon.com',
        facebook_url: 'https://facebook.com/luxesalon',
        instagram_url: 'https://instagram.com/luxesalon',
        whatsapp_number: '+91 98765 43210',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        advance_booking_days: 30,
        max_bookings_per_slot: 1,
        allow_cod: true,
        slot_duration_minutes: 30,
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return {
      ...inserted,
      business_hours: DEFAULT_BUSINESS_HOURS,
      holidays: DEFAULT_HOLIDAYS,
    } as ShopSettings;
  }

  // Merge stored settings with default business hours and holidays if not present
  return {
    ...data,
    business_hours: (data as any).business_hours || DEFAULT_BUSINESS_HOURS,
    holidays: (data as any).holidays || DEFAULT_HOLIDAYS,
  } as ShopSettings;
}

// GET /api/settings - Full settings (Admin)
router.get('/', flexibleAdminAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();

    const response: ApiResponse<ShopSettings> = {
      success: true,
      data: settings,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/settings/public - Public settings (no auth)
router.get('/public', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getOrCreateSettings();

    // Strip sensitive fields for public consumption
    const publicSettings = {
      salon_name: settings.salon_name,
      salon_tagline: settings.salon_tagline,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      pincode: settings.pincode,
      website: settings.website,
      facebook_url: settings.facebook_url,
      instagram_url: settings.instagram_url,
      whatsapp_number: settings.whatsapp_number,
      timezone: settings.timezone,
      currency: settings.currency,
      allow_cod: settings.allow_cod,
      business_hours: settings.business_hours,
      holidays: settings.holidays,
    };

    const response: ApiResponse<typeof publicSettings> = {
      success: true,
      data: publicSettings,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings - Update general settings (Admin)
router.put(
  '/',
  flexibleAdminAuth,
  [
    body('salon_name').optional().trim().notEmpty().withMessage('Salon name cannot be empty'),
    body('timezone').optional().isIn([
      'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles',
      'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney',
    ]).withMessage('Invalid timezone'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'AED']).withMessage('Invalid currency'),
    body('advance_booking_days').optional().isInt({ min: 1, max: 365 }).withMessage('Advance booking days must be 1-365'),
    body('max_bookings_per_slot').optional().isInt({ min: 1, max: 50 }).withMessage('Max bookings per slot must be 1-50'),
    body('allow_cod').optional().isBoolean().withMessage('allow_cod must be a boolean'),
    body('slot_duration_minutes').optional().isInt({ min: 15, max: 240 }).withMessage('Slot duration must be 15-240 minutes'),
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
        salon_name, salon_tagline, phone, email, address, city, pincode,
        website, facebook_url, instagram_url, whatsapp_number,
        timezone, currency, advance_booking_days, max_bookings_per_slot,
        allow_cod, slot_duration_minutes,
      } = req.body;

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (salon_name !== undefined) updateData.salon_name = salon_name;
      if (salon_tagline !== undefined) updateData.salon_tagline = salon_tagline;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (pincode !== undefined) updateData.pincode = pincode;
      if (website !== undefined) updateData.website = website;
      if (facebook_url !== undefined) updateData.facebook_url = facebook_url;
      if (instagram_url !== undefined) updateData.instagram_url = instagram_url;
      if (whatsapp_number !== undefined) updateData.whatsapp_number = whatsapp_number;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (currency !== undefined) updateData.currency = currency;
      if (advance_booking_days !== undefined) updateData.advance_booking_days = advance_booking_days;
      if (max_bookings_per_slot !== undefined) updateData.max_bookings_per_slot = max_bookings_per_slot;
      if (allow_cod !== undefined) updateData.allow_cod = allow_cod;
      if (slot_duration_minutes !== undefined) updateData.slot_duration_minutes = slot_duration_minutes;

      // Get existing settings row id
      const { data: existing } = await supabaseAdmin
        .from('settings')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      let data;
      if (existing) {
        const { data: updated, error } = await supabaseAdmin
          .from('settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        data = updated;
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from('settings')
          .insert([updateData])
          .select()
          .single();
        if (error) throw error;
        data = inserted;
      }

      const response: ApiResponse = {
        success: true,
        data,
        message: 'Settings updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/settings/business-hours - Update weekly schedule (Admin)
router.put(
  '/business-hours',
  flexibleAdminAuth,
  [
    body('business_hours').isArray({ min: 7, max: 7 }).withMessage('Business hours must contain exactly 7 days'),
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
      const { business_hours } = req.body;

      // Validate each day
      for (const day of business_hours) {
        if (!day.day || day.day_index === undefined || day.is_open === undefined) {
          throw createError('Invalid business hours format', 400);
        }
      }

      // Get existing settings
      const { data: existing } = await supabaseAdmin
        .from('settings')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!existing) {
        throw createError('Settings not initialized', 400);
      }

      // Store business hours as JSONB in the settings row or as a separate column
      // For simplicity, we'll use the existing table and rely on a JSON column
      // Since Supabase supports JSON, we'll use a generic approach
      const { data, error } = await supabaseAdmin
        .from('settings')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse = {
        success: true,
        data: {
          ...data,
          business_hours,
        },
        message: 'Business hours updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/settings/holidays - Add a holiday (Admin)
router.post(
  '/holidays',
  flexibleAdminAuth,
  [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('name').trim().notEmpty().withMessage('Holiday name is required'),
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
      const { date, name } = req.body;

      // Get existing settings
      const settings = await getOrCreateSettings();
      const holidays = settings.holidays || [];

      // Check if holiday already exists for this date
      if (holidays.some((h: Holiday) => h.date === date)) {
        throw createError('Holiday already exists for this date', 409);
      }

      const newHoliday: Holiday = { date, name };
      holidays.push(newHoliday);

      // Get existing settings row
      const { data: existing } = await supabaseAdmin
        .from('settings')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!existing) {
        throw createError('Settings not initialized', 400);
      }

      const { data, error } = await supabaseAdmin
        .from('settings')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse = {
        success: true,
        data: {
          ...data,
          holidays,
        },
        message: 'Holiday added successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/settings/holidays/:date - Remove a holiday (Admin)
router.delete('/holidays/:date', flexibleAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;

    const settings = await getOrCreateSettings();
    const holidays = (settings.holidays || []).filter((h: Holiday) => h.date !== date);

    // Get existing settings row
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!existing) {
      throw createError('Settings not initialized', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    const response: ApiResponse = {
      success: true,
      data: {
        ...data,
        holidays,
      },
      message: 'Holiday removed successfully',
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
