const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const prisma = new PrismaClient();

// Get stats
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, ordersAmount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    res.json({
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
      totalRevenue: ordersAmount._sum.totalAmount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// List all users
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        farmName: true,
        location: true,
        role: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// List all products
router.get('/products', [auth, admin], async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update product approval status
router.put('/products/:id/approve', [auth, admin], async (req, res) => {
  try {
    const { isApproved } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isApproved }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete product (admin)
router.delete('/products/:id', [auth, admin], async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// List all orders
router.get('/orders', [auth, admin], async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
