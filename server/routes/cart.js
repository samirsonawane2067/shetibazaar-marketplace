const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get cart items
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Upsert cart item
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: parseInt(productId),
          quantity
        },
        include: { product: true }
      });
    }

    res.json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update cart item quantity
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = parseInt(req.params.id);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return res.json({ message: 'Item removed from cart' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete cart item
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
