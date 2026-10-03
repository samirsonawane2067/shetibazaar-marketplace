const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

// Get conversation with a specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.query;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, 
             u_sender.name as sender_name, u_sender.village as sender_village,
             u_receiver.name as receiver_name
      FROM messages m
      JOIN users u_sender ON m.sender_id = u_sender.id
      JOIN users u_receiver ON m.receiver_id = u_receiver.id
      WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
    `;
    const params = [req.user.id, userId];
    let paramCount = 3;

    if (productId) {
      query += ` AND m.product_id = $${paramCount}`;
      params.push(productId);
      paramCount++;
    }

    query += ` ORDER BY m.created_at ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false',
      [req.user.id, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT 
       CASE 
         WHEN m.sender_id = $1 THEN m.receiver_id 
         ELSE m.sender_id 
       END as other_user_id,
       u.name as other_user_name,
       u.village as other_user_village,
       p.id as product_id,
       p.name as product_name,
       p.image_url as product_image,
       MAX(m.created_at) as last_message_time,
       (SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND is_read = false) as unread_count
       FROM messages m
       JOIN users u ON CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END = u.id
       LEFT JOIN products p ON m.product_id = p.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       GROUP BY other_user_id, u.name, u.village, p.id, p.name, p.image_url
       ORDER BY last_message_time DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver_id, product_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, product_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, receiver_id, product_id || null, message]
    );

    // Create notification for receiver
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'message', 'New Message', $2, $3)`,
      [receiver_id, `You have a new message`, `/messages/${req.user.id}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:userId', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2',
      [req.user.id, req.params.userId]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
