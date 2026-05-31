const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { body, validationResult } = require('express-validator');

// Initialize Razorpay
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', [
  body('booking_id').notEmpty().withMessage('Booking ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
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
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to paise
      currency: 'INR',
      receipt: `booking_${booking_id}`,
      notes: {
        booking_id,
        customer_name: booking.customer_name,
        service_name: booking.services?.name || 'Salon Service'
      }
    });

    // Save Razorpay order ID to booking
    await supabaseAdmin
      .from('bookings')
      .update({ razorpay_order_id: order.id })
      .eq('id', booking_id);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        booking_number: booking.booking_number,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email || '',
        customer_phone: booking.customer_phone
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/verify - Verify Razorpay payment
router.post('/verify', [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
  body('booking_id').notEmpty().withMessage('Booking ID is required'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update booking payment status
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_payment_id,
        razorpay_order_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (error) throw error;

    // Create payment record
    await supabaseAdmin
      .from('payments')
      .insert([{
        booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: data.total_amount,
        currency: 'INR',
        status: 'success',
        payment_method: 'razorpay'
      }]);

    res.json({
      success: true,
      data: { booking: data },
      message: 'Payment verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/webhook - Razorpay webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event = JSON.parse(req.body);
    
    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;

      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('razorpay_order_id', orderId)
        .single();

      if (booking) {
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id: paymentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
