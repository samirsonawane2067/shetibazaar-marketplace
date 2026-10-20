const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search, sort, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.avatar_url as seller_avatar_url
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.status = 'approved'
    `;
    const params = [];
    let paramCount = 1;

    if (category && category !== 'All') {
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (location) {
      query += ` AND p.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.name_marathi ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Sorting
    if (sort === 'price-low') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY p.rating DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my products. This must appear before /:id so "user" is not treated
// as a product ID by the dynamic route below.
router.get('/user/mine', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Unable to load your products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.village as seller_village, u.avatar_url as seller_avatar_url
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (requires auth)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, name_marathi, marathi, category, description, price, quantity, unit, location, tag, details } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !category || !price || !quantity || !unit || !location) {
      return res.status(400).json({ message: 'Please complete all required product fields' });
    }

    const result = await pool.query(
      `INSERT INTO products (seller_id, name, name_marathi, category, description, price, quantity, unit, location, image_url, tag, details, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'approved')
       RETURNING *`,
      [req.user.id, name, name_marathi || marathi || null, category, description, price, quantity, unit, location, image_url, tag, details ? JSON.stringify(details) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, name_marathi, category, description, price, quantity, unit, location, tag, details, status } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, name_marathi = $2, category = $3, description = $4, price = $5, quantity = $6, 
           unit = $7, location = $8, tag = $9, details = $10, status = $11
       WHERE id = $12 AND seller_id = $13
       RETURNING *`,
      [name, name_marathi, category, description, price, quantity, unit, location, tag, details ? JSON.stringify(details) : null, status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
