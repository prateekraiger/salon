/**
 * Payments API Routes
 * Razorpay integration with idempotent webhook handling and retry support
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import env from '../config/env';
import { flexibleAdminAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { isRazorpayConfigured } from '../config/env';
import type { Payment, PaymentVerification, RazorpayWebhookEvent, ApiResponse, Booking } from '../types';

// Dynamically import Razorpay to handle missing configuration
let Razorpay: any;
try {
  Razorpay = require('razorpay');
} catch {
  console.warn('Razorpay not installed');
}

const router = Router();

// Initialize Razorpay client
const getRazorpay = () => {
  if (!isRazorpayConfigured()) {
    throw createError('Razorpay credentials not configured', 503);
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order - Create Razorpay order
router.post(
  '/create-order',
  [
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number').custom((v) => v > 0).withMessage('Amount must be greater than 0'),
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
        })),
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { booking_id, amount } = req.body;

      // Verify booking exists
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('*, services(name)')
        .eq('id', booking_id)
        .single();

      if (bookingError || !booking) {
        throw createError('Booking not found', 404);
      }

      // Check if booking is already paid
      if (booking.payment_status === 'paid') {
        throw createError('Booking already paid', 400);
      }

      // Check if there's an existing order that's still valid
      if (booking.razorpay_order_id) {
        const razorpay = getRazorpay();
        try {
          const existingOrder = await razorpay.orders.fetch(booking.razorpay_order_id);
          // If order exists and is still in created state, reuse it
          if (existingOrder.status === 'created') {
            const response: ApiResponse = {
              success: true,
              data: {
                order_id: existingOrder.id,
                amount: existingOrder.amount,
                currency: existingOrder.currency,
                key_id: env.RAZORPAY_KEY_ID,
                booking_number: booking.booking_number,
                customer_name: booking.customer_name,
                customer_email: booking.customer_email || '',
                customer_phone: booking.customer_phone,
                existing_order: true,
              },
              message: 'Existing order found',
            };
            res.json(response);
            return;
          }
        } catch {
          // Order not found or expired, create new one
        }
      }

      const razorpay = getRazorpay();

      const order = await razorpay.orders.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise
        currency: 'INR',
        receipt: `booking_${booking_id}`,
        notes: {
          booking_id,
          customer_name: booking.customer_name,
          service_name: booking.services?.name || 'Salon Service',
        },
      });

      // Save Razorpay order ID to booking
      await supabaseAdmin
        .from('bookings')
        .update({ razorpay_order_id: order.id })
        .eq('id', booking_id);

      const response: ApiResponse = {
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: env.RAZORPAY_KEY_ID,
          booking_number: booking.booking_number,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email || '',
          customer_phone: booking.customer_phone,
          existing_order: false,
        },
        message: 'Order created successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/payments/verify - Verify Razorpay payment signature
router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
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
        })),
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body as PaymentVerification;

      // Verify signature
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        throw createError('Invalid payment signature', 400);
      }

      // Update booking payment status
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking_id)
        .select()
        .single();

      if (error) throw error;

      // Create payment record
      await supabaseAdmin.from('payments').insert({
        booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: booking.total_amount,
        currency: 'INR',
        status: 'success',
        payment_method: 'razorpay',
      });

      const response: ApiResponse<{ booking: Booking }> = {
        success: true,
        data: { booking: booking as Booking },
        message: 'Payment verified successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/payments/:booking_id/retry - Retry payment for pending booking
router.post('/:booking_id/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { booking_id } = req.params;

    // Get booking details
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, services(name, price)')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      throw createError('Booking not found', 404);
    }

    // Only allow retry for pending bookings
    if (booking.payment_status !== 'pending') {
      throw createError('Payment retry not allowed. Booking is already paid or cancelled.', 400);
    }

    if (booking.status === 'cancelled') {
      throw createError('Cannot retry payment for cancelled booking', 400);
    }

    // Create new Razorpay order
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(String(booking.total_amount)) * 100),
      currency: 'INR',
      receipt: `booking_${booking_id}_retry_${Date.now()}`,
      notes: {
        booking_id,
        customer_name: booking.customer_name,
        service_name: booking.services?.name || 'Salon Service',
        retry: 'true',
      },
    });

    // Update booking with new order ID
    await supabaseAdmin
      .from('bookings')
      .update({ razorpay_order_id: order.id })
      .eq('id', booking_id);

    const response: ApiResponse = {
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: env.RAZORPAY_KEY_ID,
        booking_number: booking.booking_number,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email || '',
        customer_phone: booking.customer_phone,
        is_retry: true,
      },
      message: 'Retry order created successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/abandoned-cleanup - Clean up abandoned pending bookings (Admin only)
router.post('/abandoned-cleanup', flexibleAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find bookings that are:
    // 1. Pending payment status
    // 2. Created more than 30 minutes ago
    // 3. Still in pending status
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: abandonedBookings, error } = await supabaseAdmin
      .from('bookings')
      .select('id, created_at, customer_name')
      .eq('payment_status', 'pending')
      .eq('payment_method', 'online')
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo);

    if (error) throw error;

    const abandonedIds = abandonedBookings?.map((b) => b.id) || [];

    if (abandonedIds.length > 0) {
      // Cancel abandoned bookings
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .in('id', abandonedIds);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        cleaned_count: abandonedIds.length,
        cleaned_ids: abandonedIds,
      },
      message: `${abandonedIds.length} abandoned bookings cancelled`,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/webhook - Razorpay webhook with idempotency
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] as string;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw createError('Invalid webhook signature', 400);
      }
    }

    const event = JSON.parse(req.body) as RazorpayWebhookEvent;
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity) {
      res.json({ received: true });
      return;
    }

    const paymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;

    // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────────
    // Check if this webhook was already processed
    const { data: existingWebhook } = await supabaseAdmin
      .from('processed_webhooks')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .eq('event_type', event.event)
      .maybeSingle();

    if (existingWebhook) {
      console.log(`Webhook ${event.event} for payment ${paymentId} already processed, skipping`);
      res.json({ received: true, processed: false, reason: 'already_processed' });
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_status')
        .eq('razorpay_order_id', orderId)
        .single();

      if (booking && booking.payment_status !== 'paid') {
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        // Create or update payment record
        await supabaseAdmin.from('payments').upsert({
          booking_id: booking.id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          status: 'success',
          payment_method: 'razorpay',
        }, {
          onConflict: 'razorpay_payment_id',
        });
      }
    }

    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_status')
        .eq('razorpay_order_id', orderId)
        .single();

      if (booking && booking.payment_status === 'pending') {
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        // Create payment record with failed status
        await supabaseAdmin.from('payments').insert({
          booking_id: booking.id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          status: 'failed',
          payment_method: 'razorpay',
        });
      }
    }

    // Record webhook as processed for idempotency
    await supabaseAdmin.from('processed_webhooks').insert({
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      event_type: event.event,
    });

    res.json({ received: true, processed: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/:booking_id/status - Get payment status
router.get('/:booking_id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { booking_id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('payment_status, status, razorpay_order_id, total_amount')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      throw createError('Booking not found', 404);
    }

    // Get payment details if available
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: false })
      .maybeSingle();

    const response: ApiResponse = {
      success: true,
      data: {
        booking_id,
        payment_status: booking.payment_status,
        booking_status: booking.status,
        amount: booking.total_amount,
        can_retry: booking.payment_status === 'pending' && booking.status !== 'cancelled',
        razorpay_order_id: booking.razorpay_order_id,
        payment_details: payment || null,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
