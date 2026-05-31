const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/services - Get all active services
router.get('/', async (req, res, next) => {
  try {
    const { category, is_active } = req.query;
    
    let query = supabaseAdmin
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/services/categories - Get all service categories
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = [...new Set(data.map(item => item.category))];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:id - Get single service
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Service not found' });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/services - Create service (Admin only)
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert([{ name, description, price, duration_minutes, category, image_url, is_active: is_active !== false }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data, message: 'Service created successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/services/:id - Update service (Admin only)
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ name, description, price, duration_minutes, category, image_url, is_active, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Service not found' });

    res.json({ success: true, data, message: 'Service updated successfully' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id - Delete service (Admin only)
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('services')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
