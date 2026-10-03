const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const pool = require('../db/config');
const { auth } = require('../middleware/auth');

const router = express.Router();
const uploadDirectory = path.join(__dirname, '..', 'uploads', 'launches');
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `launch-${Date.now()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
});

// Public feed: every visitor sees launches saved in the shared database.
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, p.name AS product_name, p.image_url AS product_image,
             p.price AS product_price, u.name AS seller_name, u.phone AS seller_phone
      FROM launches l
      JOIN products p ON p.id = l.product_id
      JOIN users u ON u.id = l.seller_id
      WHERE p.status = 'approved'
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get launches error:', error);
    res.status(500).json({ message: 'Unable to load product launches' });
  }
});

// Seller feed: used by the launch form to show the seller's real products.
router.get('/mine', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, name_marathi, price, image_url
       FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get launch products error:', error);
    res.status(500).json({ message: 'Unable to load your products' });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      productId,
      launchTitle,
      launchTitleMarathi,
      description,
      specialPrice,
      launchDate,
    } = req.body;

    if (!productId || !launchTitle || !description || !launchDate) {
      return res.status(400).json({ message: 'Please complete all required launch fields' });
    }

    const product = await pool.query(
      'SELECT id, image_url FROM products WHERE id = $1 AND seller_id = $2 AND status = $3',
      [productId, req.user.id, 'approved']
    );

    if (product.rows.length === 0) {
      return res.status(400).json({ message: 'You can launch only your approved products' });
    }

    const imageUrl = req.file
      ? `/uploads/launches/${req.file.filename}`
      : product.rows[0].image_url;

    const result = await pool.query(
      `INSERT INTO launches
       (product_id, seller_id, title, title_marathi, description, special_price, launch_date, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        productId,
        req.user.id,
        launchTitle,
        launchTitleMarathi || null,
        description,
        specialPrice || null,
        launchDate,
        imageUrl,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create launch error:', error);
    res.status(500).json({ message: 'Unable to create product launch' });
  }
});

module.exports = router;
