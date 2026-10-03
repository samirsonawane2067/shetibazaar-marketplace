const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { adminAuth } = require('../middleware/auth');

// Get admin stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']);
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    const ordersResult = await pool.query('SELECT COUNT(*) FROM orders');
    const salesResult = await pool.query('SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = $1', ['completed']);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalSales: parseFloat(salesResult.rows[0].coalesce)
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, village, district, role, is_verified, created_at FROM users WHERE role != $1 ORDER BY created_at DESC',
      ['admin']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (including pending)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as seller_name 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject product
router.put('/products/:id/approve', adminAuth, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const status = isApproved ? 'approved' : 'rejected';

    const result = await pool.query(
      'UPDATE products SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin)
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
