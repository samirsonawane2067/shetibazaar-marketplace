const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((acc, item) => {
      return acc + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const { shippingName, shippingAddress, shippingPhone, shippingPincode, paymentMethod } = req.body;

    // Use transaction to create order and delete cart items
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          buyerId: req.user.id,
          totalAmount,
          shippingName,
          shippingAddress,
          shippingPhone,
          shippingPincode,
          paymentMethod,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: true }
      }),
      prisma.cartItem.deleteMany({
        where: { userId: req.user.id }
      })
    ]);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
