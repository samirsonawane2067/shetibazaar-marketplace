const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name, u.village as reviewer_village
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE product_id = $1',
      [productId]
    );

    res.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       WHERE r.seller_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE seller_id = $1',
      [sellerId]
    );

    res.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/', [
  auth,
  body('product_id').isInt().withMessage('Valid product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ max: 255 }),
  body('comment').optional().trim()
], async (req, res) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, rating, title, comment } = req.body;

    await client.query('BEGIN');

    // Check if user already reviewed this product
    const existingReview = await client.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingReview.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Get product seller_id
    const productResult = await client.query(
      'SELECT seller_id FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found' });
    }

    const seller_id = productResult.rows[0].seller_id;

    // Check if user has purchased this product
    const purchaseCheck = await client.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2`,
      [req.user.id, product_id]
    );

    const is_verified_purchase = purchaseCheck.rows.length > 0;

    // Insert review
    const reviewResult = await client.query(
      `INSERT INTO reviews (user_id, product_id, seller_id, rating, title, comment, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, product_id, seller_id, rating, title, comment, is_verified_purchase]
    );

    // Update product rating
    const ratingStats = await client.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count
       FROM reviews
       WHERE product_id = $1`,
      [product_id]
    );

    const avgRating = parseFloat(ratingStats.rows[0].avg_rating).toFixed(2);
    const reviewCount = parseInt(ratingStats.rows[0].count);

    await client.query(
      'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3',
      [avgRating, reviewCount, product_id]
    );

    await client.query('COMMIT');

    res.status(201).json(reviewResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Update a review
router.put('/:id', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ max: 255 }),
  body('comment').optional().trim()
], async (req, res) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, title, comment } = req.body;

    await client.query('BEGIN');

    // Get the review to check ownership and product_id
    const reviewResult = await client.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (reviewResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    const product_id = reviewResult.rows[0].product_id;

    // Update review
    await client.query(
      'UPDATE reviews SET rating = $1, title = $2, comment = $3 WHERE id = $4',
      [rating, title, comment, req.params.id]
    );

    // Update product rating
    const ratingStats = await client.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count
       FROM reviews
       WHERE product_id = $1`,
      [product_id]
    );

    const avgRating = parseFloat(ratingStats.rows[0].avg_rating).toFixed(2);
    const reviewCount = parseInt(ratingStats.rows[0].count);

    await client.query(
      'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3',
      [avgRating, reviewCount, product_id]
    );

    await client.query('COMMIT');

    const updatedReview = await client.query(
      'SELECT * FROM reviews WHERE id = $1',
      [req.params.id]
    );

    res.json(updatedReview.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the review to check ownership and product_id
    const reviewResult = await client.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (reviewResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    const product_id = reviewResult.rows[0].product_id;

    // Delete review
    await client.query(
      'DELETE FROM reviews WHERE id = $1',
      [req.params.id]
    );

    // Update product rating
    const ratingStats = await client.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count
       FROM reviews
       WHERE product_id = $1`,
      [product_id]
    );

    const avgRating = ratingStats.rows[0].avg_rating ? parseFloat(ratingStats.rows[0].avg_rating).toFixed(2) : 0;
    const reviewCount = parseInt(ratingStats.rows[0].count);

    await client.query(
      'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3',
      [avgRating, reviewCount, product_id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
