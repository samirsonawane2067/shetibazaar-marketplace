const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const prisma = new PrismaClient();

// Get user's products - BEFORE /:id
router.get('/user/mine', auth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      location, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    let where = {
      isActive: true,
      isApproved: true
    };

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameMarathi: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sellerName: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { seller: { select: { id: true, name: true, mobile: true, location: true } } }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      totalPages: Math.ceil(total / take),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { seller: { select: { id: true, name: true, mobile: true, location: true } } }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Create product
router.post('/', [
  auth,
  body('name', 'Name is required').not().isEmpty(),
  body('category', 'Category is required').not().isEmpty(),
  body('price', 'Price is required and must be a number').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const product = await prisma.product.create({
      data: {
        ...req.body,
        sellerId: req.user.id,
        sellerName: user.name,
        sellerPhone: user.mobile
      }
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    let product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
