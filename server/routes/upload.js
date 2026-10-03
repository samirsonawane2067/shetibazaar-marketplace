const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;
