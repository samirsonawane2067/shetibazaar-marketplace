const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

// Get user wishlist
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, p.name, p.name_marathi, p.price, p.unit, p.image_url, p.category, p.location
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle wishlist (add/remove)
router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;

    // Check if product exists
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existingResult = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingResult.rows.length > 0) {
      // Remove from wishlist
      await pool.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
        [req.user.id, product_id]
      );
      return res.json({ message: 'Removed from wishlist', inWishlist: false });
    }

    // Add to wishlist
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from wishlist
router.delete('/:product_id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.product_id]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
