"use strict";
/**
 * Services API Routes
 * CRUD operations for salon services with TypeScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// GET /api/services - Get all active services (Public)
router.get('/', async (req, res, next) => {
    try {
        const { category, is_active } = req.query;
        let query = supabase_1.supabaseAdmin
            .from('services')
            .select('*')
            .eq('is_deleted', false)
            .order('category', { ascending: true })
            .order('name', { ascending: true });
        if (category) {
            query = query.eq('category', category);
        }
        if (is_active !== undefined) {
            query = query.eq('is_active', is_active === 'true');
        }
        else {
            query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        const response = {
            success: true,
            data: data || [],
            message: `${data?.length || 0} services found`,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/services/categories - Get all service categories (Public)
router.get('/categories', async (req, res, next) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('services')
            .select('category')
            .eq('is_active', true)
            .eq('is_deleted', false);
        if (error)
            throw error;
        const categories = [...new Set(data?.map((item) => item.category) || [])];
        const response = {
            success: true,
            data: categories,
            message: `${categories.length} categories found`,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/services/:id - Get single service (Public)
router.get('/:id', async (req, res, next) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', req.params.id)
            .eq('is_deleted', false)
            .single();
        if (error)
            throw error;
        if (!data)
            throw (0, errorHandler_1.createError)('Service not found', 404);
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
// POST /api/services - Create service (Admin only)
router.post('/', auth_1.flexibleAdminAuth, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Service name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Price must be a number').custom((v) => v > 0).withMessage('Price must be greater than 0'),
    (0, express_validator_1.body)('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    (0, express_validator_1.body)('category').trim().notEmpty().withMessage('Category is required'),
], async (req, res, next) => {
    try {
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
        const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;
        const { data, error } = await supabase_1.supabaseAdmin
            .from('services')
            .insert([{
                name,
                description,
                price,
                duration_minutes,
                category,
                image_url,
                is_active: is_active !== false,
                is_deleted: false,
            }])
            .select()
            .single();
        if (error)
            throw error;
        const response = {
            success: true,
            data: data,
            message: 'Service created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/services/:id - Update service (Admin only)
router.put('/:id', auth_1.flexibleAdminAuth, async (req, res, next) => {
    try {
        const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;
        const { data, error } = await supabase_1.supabaseAdmin
            .from('services')
            .update({
            name,
            description,
            price,
            duration_minutes,
            category,
            image_url,
            is_active,
            updated_at: new Date().toISOString(),
        })
            .eq('id', req.params.id)
            .eq('is_deleted', false)
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw (0, errorHandler_1.createError)('Service not found', 404);
        const response = {
            success: true,
            data,
            message: 'Service updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/services/:id - Soft delete service (Admin only)
router.delete('/:id', auth_1.flexibleAdminAuth, async (req, res, next) => {
    try {
        // Soft delete - mark as inactive and deleted
        const { error } = await supabase_1.supabaseAdmin
            .from('services')
            .update({
            is_active: false,
            is_deleted: true,
            updated_at: new Date().toISOString(),
        })
            .eq('id', req.params.id);
        if (error)
            throw error;
        const response = {
            success: true,
            message: 'Service deactivated successfully',
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map