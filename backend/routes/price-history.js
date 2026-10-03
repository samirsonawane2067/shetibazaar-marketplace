const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

// Get price history for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const result = await pool.query(
      `SELECT * FROM price_history
       WHERE product_id = $1
       AND recorded_at >= NOW() - INTERVAL '1 day' * $2
       ORDER BY recorded_at ASC`,
      [productId, days]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record price change (called when product price is updated)
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, price } = req.body;

    if (!product_id || !price) {
      return res.status(400).json({ message: 'Product ID and price are required' });
    }

    // Verify user owns the product
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND seller_id = $2',
      [product_id, req.user.id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO price_history (product_id, price)
       VALUES ($1, $2)
       RETURNING *`,
      [product_id, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Record price history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get price statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const result = await pool.query(
      `SELECT 
       AVG(price) as avg_price,
       MIN(price) as min_price,
       MAX(price) as max_price,
       COUNT(*) as data_points
       FROM price_history
       WHERE product_id = $1
       AND recorded_at >= NOW() - INTERVAL '1 day' * $2`,
      [productId, days]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get price stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
