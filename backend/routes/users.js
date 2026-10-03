const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'profiles');
fs.mkdirSync(uploadDirectory, { recursive: true });

const profilePhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (req, file, callback) => callback(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, village, district, state, pincode, farm_name, farm_size, avatar_url, role, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/profile/photo', auth, profilePhotoUpload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please choose a JPG, PNG, or WebP image under 5 MB.' });
  }

  try {
    const avatarUrl = `/uploads/profiles/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, phone, village, district, state, pincode, farm_name, farm_size, avatar_url, role',
      [avatarUrl, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Unable to save profile photo' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, mobile, village, district, pincode, farm_name, farmName, farm_size, avatar_url, avatarUrl } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, phone = $2, village = $3, district = $4, pincode = $5, farm_name = $6, farm_size = $7, avatar_url = $8
       WHERE id = $9
       RETURNING id, name, email, phone, village, district, pincode, farm_name, farm_size, avatar_url, role`,
      [name, phone || mobile, village, district, pincode, farm_name || farmName, farm_size, avatar_url || avatarUrl || null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
