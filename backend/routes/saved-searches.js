const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

// Get user's saved searches
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a saved search
router.post('/', auth, async (req, res) => {
  try {
    const { name, search_params } = req.body;

    if (!name || !search_params) {
      return res.status(400).json({ message: 'Name and search parameters are required' });
    }

    const result = await pool.query(
      `INSERT INTO saved_searches (user_id, name, search_params)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, name, JSON.stringify(search_params)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create saved search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a saved search
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, search_params } = req.body;

    const result = await pool.query(
      `UPDATE saved_searches 
       SET name = $1, search_params = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, JSON.stringify(search_params), req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a saved search
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    res.json({ message: 'Saved search deleted' });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
