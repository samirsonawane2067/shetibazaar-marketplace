const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get wishlist items
router.get('/', auth, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    res.json(wishlistItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Toggle wishlist item
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id }
      });
      return res.json({ removed: true });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      });
      return res.json({ added: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete specific product from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(req.params.productId)
        }
      }
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id }
      });
    }
    
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
