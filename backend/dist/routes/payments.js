"use strict";
/**
 * Payments API Routes
 * Razorpay integration with idempotent webhook handling and retry support
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../config/supabase");
const env_1 = __importDefault(require("../config/env"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const env_2 = require("../config/env");
// Dynamically import Razorpay to handle missing configuration
let Razorpay;
try {
    Razorpay = require('razorpay');
}
catch {
    console.warn('Razorpay not installed');
}
const router = (0, express_1.Router)();
// Initialize Razorpay client
const getRazorpay = () => {
    if (!(0, env_2.isRazorpayConfigured)()) {
        throw (0, errorHandler_1.createError)('Razorpay credentials not configured', 503);
    }
    return new Razorpay({
        key_id: env_1.default.RAZORPAY_KEY_ID,
        key_secret: env_1.default.RAZORPAY_KEY_SECRET,
    });
};
// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', [
    (0, express_validator_1.body)('booking_id').notEmpty().withMessage('Booking ID is required'),
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Amount must be a number').custom((v) => v > 0).withMessage('Amount must be greater than 0'),
], async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const response = {
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
        const { data: booking, error: bookingError } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('*, services(name)')
            .eq('id', booking_id)
            .single();
        if (bookingError || !booking) {
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        }
        // Check if booking is already paid
        if (booking.payment_status === 'paid') {
            throw (0, errorHandler_1.createError)('Booking already paid', 400);
        }
        // Check if there's an existing order that's still valid
        if (booking.razorpay_order_id) {
            const razorpay = getRazorpay();
            try {
                const existingOrder = await razorpay.orders.fetch(booking.razorpay_order_id);
                // If order exists and is still in created state, reuse it
                if (existingOrder.status === 'created') {
                    const response = {
                        success: true,
                        data: {
                            order_id: existingOrder.id,
                            amount: existingOrder.amount,
                            currency: existingOrder.currency,
                            key_id: env_1.default.RAZORPAY_KEY_ID,
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
            }
            catch {
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
        await supabase_1.supabaseAdmin
            .from('bookings')
            .update({ razorpay_order_id: order.id })
            .eq('id', booking_id);
        const response = {
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: env_1.default.RAZORPAY_KEY_ID,
                booking_number: booking.booking_number,
                customer_name: booking.customer_name,
                customer_email: booking.customer_email || '',
                customer_phone: booking.customer_phone,
                existing_order: false,
            },
            message: 'Order created successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/payments/verify - Verify Razorpay payment signature
router.post('/verify', [
    (0, express_validator_1.body)('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    (0, express_validator_1.body)('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    (0, express_validator_1.body)('razorpay_signature').notEmpty().withMessage('Signature is required'),
    (0, express_validator_1.body)('booking_id').notEmpty().withMessage('Booking ID is required'),
], async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const response = {
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto_1.default
            .createHmac('sha256', env_1.default.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');
        if (razorpay_signature !== expectedSign) {
            throw (0, errorHandler_1.createError)('Invalid payment signature', 400);
        }
        // Update booking payment status
        const { data: booking, error } = await supabase_1.supabaseAdmin
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
        if (error)
            throw error;
        // Create payment record
        await supabase_1.supabaseAdmin.from('payments').insert({
            booking_id,
            razorpay_order_id,
            razorpay_payment_id,
            amount: booking.total_amount,
            currency: 'INR',
            status: 'success',
            payment_method: 'razorpay',
        });
        const response = {
            success: true,
            data: { booking: booking },
            message: 'Payment verified successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/payments/:booking_id/retry - Retry payment for pending booking
router.post('/:booking_id/retry', async (req, res, next) => {
    try {
        const { booking_id } = req.params;
        // Get booking details
        const { data: booking, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('*, services(name, price)')
            .eq('id', booking_id)
            .single();
        if (error || !booking) {
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        }
        // Only allow retry for pending bookings
        if (booking.payment_status !== 'pending') {
            throw (0, errorHandler_1.createError)('Payment retry not allowed. Booking is already paid or cancelled.', 400);
        }
        if (booking.status === 'cancelled') {
            throw (0, errorHandler_1.createError)('Cannot retry payment for cancelled booking', 400);
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
        await supabase_1.supabaseAdmin
            .from('bookings')
            .update({ razorpay_order_id: order.id })
            .eq('id', booking_id);
        const response = {
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: env_1.default.RAZORPAY_KEY_ID,
                booking_number: booking.booking_number,
                customer_name: booking.customer_name,
                customer_email: booking.customer_email || '',
                customer_phone: booking.customer_phone,
                is_retry: true,
            },
            message: 'Retry order created successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/payments/abandoned-cleanup - Clean up abandoned pending bookings (Admin only)
router.post('/abandoned-cleanup', auth_1.flexibleAdminAuth, async (req, res, next) => {
    try {
        // Find bookings that are:
        // 1. Pending payment status
        // 2. Created more than 30 minutes ago
        // 3. Still in pending status
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { data: abandonedBookings, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('id, created_at, customer_name')
            .eq('payment_status', 'pending')
            .eq('payment_method', 'online')
            .eq('status', 'pending')
            .lt('created_at', thirtyMinutesAgo);
        if (error)
            throw error;
        const abandonedIds = abandonedBookings?.map((b) => b.id) || [];
        if (abandonedIds.length > 0) {
            // Cancel abandoned bookings
            await supabase_1.supabaseAdmin
                .from('bookings')
                .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
                .in('id', abandonedIds);
        }
        const response = {
            success: true,
            data: {
                cleaned_count: abandonedIds.length,
                cleaned_ids: abandonedIds,
            },
            message: `${abandonedIds.length} abandoned bookings cancelled`,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/payments/webhook - Razorpay webhook with idempotency
router.post('/webhook', async (req, res, next) => {
    try {
        const webhookSecret = env_1.default.RAZORPAY_WEBHOOK_SECRET;
        // Verify webhook signature if secret is configured
        if (webhookSecret) {
            const signature = req.headers['x-razorpay-signature'];
            const expectedSignature = crypto_1.default
                .createHmac('sha256', webhookSecret)
                .update(req.body)
                .digest('hex');
            if (signature !== expectedSignature) {
                throw (0, errorHandler_1.createError)('Invalid webhook signature', 400);
            }
        }
        const event = JSON.parse(req.body);
        const paymentEntity = event.payload?.payment?.entity;
        if (!paymentEntity) {
            res.json({ received: true });
            return;
        }
        const paymentId = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────────
        // Check if this webhook was already processed
        const { data: existingWebhook } = await supabase_1.supabaseAdmin
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
            const { data: booking } = await supabase_1.supabaseAdmin
                .from('bookings')
                .select('id, payment_status')
                .eq('razorpay_order_id', orderId)
                .single();
            if (booking && booking.payment_status !== 'paid') {
                await supabase_1.supabaseAdmin
                    .from('bookings')
                    .update({
                    payment_status: 'paid',
                    status: 'confirmed',
                    razorpay_payment_id: paymentId,
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', booking.id);
                // Create or update payment record
                await supabase_1.supabaseAdmin.from('payments').upsert({
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
            const { data: booking } = await supabase_1.supabaseAdmin
                .from('bookings')
                .select('id, payment_status')
                .eq('razorpay_order_id', orderId)
                .single();
            if (booking && booking.payment_status === 'pending') {
                await supabase_1.supabaseAdmin
                    .from('bookings')
                    .update({
                    payment_status: 'failed',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', booking.id);
                // Create payment record with failed status
                await supabase_1.supabaseAdmin.from('payments').insert({
                    booking_id: booking.id,
                    razorpay_order_id: orderId,
                    razorpay_payment_id: paymentId,
                    status: 'failed',
                    payment_method: 'razorpay',
                });
            }
        }
        // Record webhook as processed for idempotency
        await supabase_1.supabaseAdmin.from('processed_webhooks').insert({
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            event_type: event.event,
        });
        res.json({ received: true, processed: true });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/payments/:booking_id/status - Get payment status
router.get('/:booking_id/status', async (req, res, next) => {
    try {
        const { booking_id } = req.params;
        const { data: booking, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('payment_status, status, razorpay_order_id, total_amount')
            .eq('id', booking_id)
            .single();
        if (error || !booking) {
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        }
        // Get payment details if available
        const { data: payment } = await supabase_1.supabaseAdmin
            .from('payments')
            .select('*')
            .eq('booking_id', booking_id)
            .order('created_at', { ascending: false })
            .maybeSingle();
        const response = {
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map