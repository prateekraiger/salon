"use strict";
/**
 * Bookings API Routes
 * Handles booking creation with double-booking prevention and slot validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const whatsapp_1 = require("../services/whatsapp");
const router = (0, express_1.Router)();
// GET /api/bookings - Get all bookings (Admin only)
router.get('/', auth_1.flexibleAdminAuth, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res, next) => {
    try {
        const { status, payment_method, date, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));
        let dbQuery = supabase_1.supabaseAdmin
            .from('bookings')
            .select(`*,
          services ( id, name, price, duration_minutes, category )`, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(String(limit)) - 1);
        if (status)
            dbQuery = dbQuery.eq('status', status);
        if (payment_method)
            dbQuery = dbQuery.eq('payment_method', payment_method);
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            dbQuery = dbQuery
                .gte('appointment_date', startDate.toISOString())
                .lte('appointment_date', endDate.toISOString());
        }
        const { data, error, count } = await dbQuery;
        if (error)
            throw error;
        const response = {
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/bookings/stats - Get booking statistics (Admin only)
router.get('/stats', auth_1.flexibleAdminAuth, async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();
        const [totalResult, todayResult, pendingResult, revenueResult, monthlyData] = await Promise.all([
            supabase_1.supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }),
            supabase_1.supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
            supabase_1.supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase_1.supabaseAdmin.from('bookings').select('total_amount').eq('payment_status', 'paid'),
            getMonthlyBookingsData(),
        ]);
        const totalRevenue = revenueResult.data?.reduce((sum, b) => sum + parseFloat(String(b.total_amount || 0)), 0) || 0;
        const response = {
            success: true,
            data: {
                total_bookings: totalResult.count || 0,
                today_bookings: todayResult.count || 0,
                pending_bookings: pendingResult.count || 0,
                total_revenue: totalRevenue,
                monthly_data: monthlyData,
            },
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/bookings/available-slots - Get available time slots for a date
router.get('/available-slots', async (req, res, next) => {
    try {
        const { date, service_id } = req.query;
        if (!date) {
            throw (0, errorHandler_1.createError)('Date is required', 400);
        }
        // All possible time slots
        const ALL_SLOTS = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
            '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
            '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
            '07:00 PM', '07:30 PM',
        ];
        // Get booked slots for the date
        const { data: bookedSlots, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('appointment_time, status')
            .eq('appointment_date', date)
            .in('status', ['pending', 'confirmed', 'in_progress']);
        if (error)
            throw error;
        const bookedTimes = new Set(bookedSlots?.map((b) => b.appointment_time) || []);
        // Check service duration if service_id provided
        let slotDuration = 30; // default 30 min slots
        if (service_id) {
            const { data: service } = await supabase_1.supabaseAdmin
                .from('services')
                .select('duration_minutes')
                .eq('id', service_id)
                .single();
            if (service) {
                slotDuration = service.duration_minutes;
            }
        }
        // Mark slots as available or unavailable
        const slots = ALL_SLOTS.map((time) => ({
            time,
            available: !bookedTimes.has(time),
        }));
        const response = {
            success: true,
            data: {
                date,
                slots,
                slot_duration_minutes: slotDuration,
            },
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/bookings/:id - Get single booking (Public - for confirmation page)
router.get('/:id', async (req, res, next) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select(`*, services ( id, name, price, duration_minutes, category )`)
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!data)
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        const response = {
            success: true,
            data,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/bookings - Create new booking with double-booking prevention
router.post('/', [
    (0, express_validator_1.body)('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    (0, express_validator_1.body)('customer_phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[+]?[0-9]{10,15}$/)
        .withMessage('Invalid phone number'),
    (0, express_validator_1.body)('customer_email').optional().isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('service_id').notEmpty().withMessage('Service ID is required'),
    (0, express_validator_1.body)('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
    (0, express_validator_1.body)('appointment_time').notEmpty().withMessage('Appointment time is required'),
    (0, express_validator_1.body)('payment_method').isIn(['online', 'cod']).withMessage('Payment method must be online or cod'),
    (0, express_validator_1.body)('address').trim().notEmpty().withMessage('Address is required'),
], async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const response = {
            success: false,
            message: 'Validation error',
            errors: errors.array().map((e) => ({
                msg: e.msg,
                param: e.type === 'field' ? e.path : undefined,
                location: e.location,
            })),
        };
        res.status(400).json(response);
        return;
    }
    try {
        const { customer_name, customer_phone, customer_email, service_id, appointment_date, appointment_time, payment_method, address, city, pincode, notes, } = req.body;
        // ─── DOUBLE-BOOKING VALIDATION ─────────────────────────────────────
        // Check if the slot is already booked
        const { data: existingBooking, error: checkError } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('id, status, customer_name')
            .eq('appointment_date', appointment_date)
            .eq('appointment_time', appointment_time)
            .in('status', ['pending', 'confirmed', 'in_progress'])
            .maybeSingle();
        if (checkError)
            throw checkError;
        if (existingBooking) {
            const response = {
                success: false,
                message: 'This time slot is already booked. Please select a different time.',
                errors: [
                    {
                        msg: `Slot already booked by ${existingBooking.customer_name}`,
                        param: 'appointment_time',
                    },
                ],
            };
            res.status(409).json(response);
            return;
        }
        // ───────────────────────────────────────────────────────────────────
        // Fetch service details
        const { data: service, error: serviceError } = await supabase_1.supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', service_id)
            .eq('is_active', true)
            .eq('is_deleted', false)
            .single();
        if (serviceError || !service) {
            throw (0, errorHandler_1.createError)('Service not found or inactive', 404);
        }
        const bookingId = (0, uuid_1.v4)();
        const bookingNumber = `SLN${Date.now().toString(36).toUpperCase().slice(-8)}`;
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
            payment_status: 'pending',
        };
        const { data, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .insert([bookingData])
            .select()
            .single();
        if (error)
            throw error;
        // Send WhatsApp notification for COD bookings
        if (payment_method === 'cod') {
            const notificationService = {
                ...service,
                created_at: service.created_at || new Date().toISOString(),
                updated_at: service.updated_at || new Date().toISOString(),
            };
            (0, whatsapp_1.sendWhatsAppNotification)({
                booking: data,
                service: notificationService,
            }).catch((err) => console.error('WhatsApp notification failed:', err.message));
        }
        const response = {
            success: true,
            data: {
                ...data,
                services: service,
            },
            message: 'Booking created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/bookings/:id/status - Update booking status (Admin only)
router.patch('/:id/status', auth_1.flexibleAdminAuth, [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status value'),
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
        const { status, payment_status } = req.body;
        const updateData = { status, updated_at: new Date().toISOString() };
        if (payment_status)
            updateData.payment_status = payment_status;
        const { data, error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        const response = {
            success: true,
            data: data,
            message: 'Booking status updated',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/bookings/:id - Cancel booking (Admin only)
router.delete('/:id', auth_1.flexibleAdminAuth, async (req, res, next) => {
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', req.params.id);
        if (error)
            throw error;
        const response = {
            success: true,
            message: 'Booking cancelled successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// Helper function to get monthly bookings data
async function getMonthlyBookingsData() {
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const { count } = await supabase_1.supabaseAdmin
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', start)
            .lte('created_at', end);
        monthlyData.push({
            month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count: count || 0,
        });
    }
    return monthlyData;
}
exports.default = router;
//# sourceMappingURL=bookings.js.map