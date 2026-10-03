const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/config');
const { body, validationResult } = require('express-validator');

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      phone,
      mobile,
      village,
      district,
      taluka,
      state,
      pincode,
      farm_name,
      farmName,
      farm_size,
    } = req.body;

    const userPhone = (phone || mobile || '').trim();
    if (!userPhone) {
      return res.status(400).json({ message: 'Mobile/phone number is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const finalFarmName = farm_name || farmName || null;

    // Check if user already exists by email or phone in database
    const userExists = await pool.query(
      'SELECT id, email, phone FROM users WHERE LOWER(email) = $1 OR phone = $2',
      [cleanEmail, userPhone]
    );

    if (userExists.rows.length > 0) {
      const match = userExists.rows[0];
      if (match.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ message: 'User already exists with this email. Please login instead.' });
      }
      return res.status(400).json({ message: 'User already exists with this mobile number. Please login instead.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, village, district, pincode, state, farm_name, farm_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, phone, village, district, pincode, state, farm_name, farm_size, role, is_verified, created_at`,
      [
        name.trim(),
        cleanEmail,
        hashedPassword,
        userPhone,
        village || null,
        district || taluka || null,
        pincode || null,
        state || 'Maharashtra',
        finalFarmName,
        farm_size || null,
      ]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'shetibazaar-secure-jwt-secret-key-2026',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Farmer registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Check if user is registered in PostgreSQL database
router.post('/check-user', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email || req.body.phone || '';
    const identifier = String(rawIdentifier).trim();

    if (!identifier) {
      return res.status(400).json({ message: 'Email or mobile number is required' });
    }

    // Search user in database by email or phone
    const result = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      // User is not in the database -> New user must register
      return res.status(404).json({
        exists: false,
        isNewUser: true,
        requiresRegistration: true,
        message: 'User is not registered in database. Please register first.',
      });
    }

    const foundUser = result.rows[0];
    return res.json({
      exists: true,
      isNewUser: false,
      message: 'User registered in database',
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ message: 'Server error checking user information', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email || req.body.phone || '';
    const identifier = String(rawIdentifier).trim();
    const { password } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Email or mobile number is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Search user information in database
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1',
      [identifier]
    );

    // If new user (not registered in database), tell them to register
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not registered in database. You are a new user, please register first to continue.',
        isNewUser: true,
        requiresRegistration: true,
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid password. Please check your password and try again.',
        isNewUser: false,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'shetibazaar-secure-jwt-secret-key-2026',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Admin login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check admin user in PostgreSQL
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND role = $2',
      [email.trim(), 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET || 'shetibazaar-secure-jwt-secret-key-2026',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
});

module.exports = router;
