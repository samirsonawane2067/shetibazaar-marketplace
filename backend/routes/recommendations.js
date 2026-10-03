const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

// Track user behavior
router.post('/track', auth, async (req, res) => {
  try {
    const { product_id, action_type, metadata } = req.body;

    if (!product_id || !action_type) {
      return res.status(400).json({ message: 'Product ID and action type are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_behavior (user_id, product_id, action_type, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, product_id, action_type, metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Track behavior error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's viewed/wishlist/cart product categories
    const behaviorResult = await pool.query(
      `SELECT DISTINCT p.category
       FROM user_behavior ub
       JOIN products p ON ub.product_id = p.id
       WHERE ub.user_id = $1
       AND ub.action_type IN ('view', 'wishlist', 'cart')
       LIMIT 5`,
      [req.user.id]
    );

    const categories = behaviorResult.rows.map(r => r.category);

    if (categories.length === 0) {
      // If no behavior, return popular products
      const popularResult = await pool.query(
        `SELECT p.*, u.name as seller_name
         FROM products p
         JOIN users u ON p.seller_id = u.id
         WHERE p.status = 'approved'
         ORDER BY p.rating DESC, p.review_count DESC
         LIMIT $1`,
        [limit]
      );
      return res.json(popularResult.rows);
    }

    // Get products from user's preferred categories
    const placeholders = categories.map((_, i) => `$${i + 2}`).join(',');
    const query = `
      SELECT p.*, u.name as seller_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'approved'
      AND p.category IN (${placeholders})
      AND p.seller_id != $1
      ORDER BY p.rating DESC, p.review_count DESC
      LIMIT $${categories.length + 2}
    `;

    const params = [req.user.id, ...categories, limit];
    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const result = await pool.query(
      `SELECT p.*, u.name as seller_name,
       COUNT(ub.id) as view_count
       FROM products p
       JOIN users u ON p.seller_id = u.id
       LEFT JOIN user_behavior ub ON p.id = ub.product_id
       AND ub.created_at >= NOW() - INTERVAL '1 day' * $2
       WHERE p.status = 'approved'
       GROUP BY p.id, u.name
       ORDER BY view_count DESC, p.rating DESC
       LIMIT $1`,
      [limit, days]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get similar products
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    // Get product category
    const productResult = await pool.query(
      'SELECT category, seller_id FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { category, seller_id } = productResult.rows[0];

    const result = await pool.query(
      `SELECT p.*, u.name as seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.status = 'approved'
       AND p.category = $1
       AND p.id != $2
       AND p.seller_id != $3
       ORDER BY p.rating DESC
       LIMIT $4`,
      [category, productId, seller_id, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
