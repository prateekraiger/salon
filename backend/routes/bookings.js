const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendWhatsAppNotification } = require('../services/whatsapp');
const { v4: uuidv4 } = require('uuid');

// GET /api/bookings - Get all bookings (Admin only)
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { status, payment_method, date, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services ( id, name, price, duration_minutes, category )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (payment_method) query = query.eq('payment_method', payment_method);
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query = query.gte('appointment_date', startDate.toISOString())
                   .lte('appointment_date', endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/stats - Get booking statistics (Admin only)
router.get('/stats', adminAuth, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [totalResult, todayResult, pendingResult, revenueResult] = await Promise.all([
      supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('bookings').select('total_amount').eq('payment_status', 'paid')
    ]);

    const totalRevenue = revenueResult.data?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0;

    // Monthly bookings for chart
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const { count } = await supabaseAdmin
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start)
        .lte('created_at', end);
      monthlyData.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: count || 0
      });
    }

    res.json({
      success: true,
      data: {
        total_bookings: totalResult.count || 0,
        today_bookings: todayResult.count || 0,
        pending_bookings: pendingResult.count || 0,
        total_revenue: totalRevenue,
        monthly_data: monthlyData
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`*, services ( id, name, price, duration_minutes, category )`)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - Create new booking
router.post('/', [
  body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
  body('customer_phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{10,15}$/).withMessage('Invalid phone number'),
  body('customer_email').optional().isEmail().withMessage('Invalid email address'),
  body('service_id').notEmpty().withMessage('Service ID is required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
  body('appointment_time').notEmpty().withMessage('Appointment time is required'),
  body('payment_method').isIn(['online', 'cod']).withMessage('Payment method must be online or cod'),
  body('address').trim().notEmpty().withMessage('Address is required'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      customer_name, customer_phone, customer_email,
      service_id, appointment_date, appointment_time,
      payment_method, address, city, pincode, notes
    } = req.body;

    // Fetch service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }

    const bookingId = uuidv4();
    const bookingNumber = `SLN${Date.now().toString().slice(-8)}`;

    const bookingData = {
      id: bookingId,
      booking_number: bookingNumber,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      service_id,
      appointment_date,
      appointment_time,
      payment_method,
      address,
      city: city || null,
      pincode: pincode || null,
      notes: notes || null,
      total_amount: service.price,
      status: 'pending',
      payment_status: payment_method === 'cod' ? 'pending' : 'pending',
    };

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;

    // Send WhatsApp notification for COD bookings
    if (payment_method === 'cod') {
      await sendWhatsAppNotification({
        booking: data,
        service: service
      }).catch(err => console.error('WhatsApp notification failed:', err.message));
    }

    res.status(201).json({
      success: true,
      data: {
        ...data,
        service
      },
      message: 'Booking created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/bookings/:id/status - Update booking status (Admin only)
router.patch('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status, payment_status } = req.body;

    const updateData = { status, updated_at: new Date().toISOString() };
    if (payment_status) updateData.payment_status = payment_status;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, data, message: 'Booking status updated' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id - Cancel booking (Admin only)
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
