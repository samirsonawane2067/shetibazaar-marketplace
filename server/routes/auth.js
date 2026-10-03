const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'shetibazaar-secure-jwt-secret-key-2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, mobile, phone, farmName, location } = req.body;
  const userMobile = mobile || phone || '';

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          ...(userMobile ? [{ mobile: userMobile }] : [])
        ]
      }
    });

    if (user) {
      return res.status(400).json({ message: 'User already registered with this email or mobile' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        mobile: userMobile || null,
        farmName: farmName || null,
        location: location || null,
      }
    });

    const token = generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { mobile: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        exists: false,
        isNewUser: true,
        requiresRegistration: true,
        message: 'User is not registered in database. Please register first.'
      });
    }

    return res.json({
      exists: true,
      isNewUser: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error checking user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const rawIdentifier = req.body.identifier || req.body.email || req.body.phone || '';
  const identifier = String(rawIdentifier).trim();
  const { password } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or mobile number is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { mobile: identifier }
        ]
      }
    });

    // Check if new user (not in database)
    if (!user) {
      return res.status(404).json({
        message: 'User is not registered in our database. You are a new user, please register first to continue.',
        isNewUser: true,
        requiresRegistration: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid password. Please check your credentials.',
        isNewUser: false
      });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, mobile, farmName, location, avatarUrl } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        mobile,
        farmName,
        location,
        avatarUrl
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
router.post('/admin/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid credentials or unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
