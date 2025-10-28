import express from 'express';
import multer from 'multer';
import { analyzeImage, getVisionClient } from '../config/vision.js';
import { Product } from '../models/Product.js';

const router = express.Router();

// Configure multer for image upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// Image search endpoint
router.post('/search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Check if Vision API is configured
    const visionClient = getVisionClient();
    if (!visionClient) {
      return res.status(503).json({ 
        message: 'Image search is not available. Cloud Vision API is not configured.' 
      });
    }

    // Analyze image using Cloud Vision API
    const analysis = await analyzeImage(req.file.buffer);

    // Search products based on detected labels and objects
    const searchTerms = analysis.searchTerms;
    
    if (searchTerms.length === 0) {
      return res.json({
        analysis,
        products: [],
        message: 'No recognizable objects found in the image'
      });
    }

    // Build search query
    const searchRegex = searchTerms.map(term => 
      new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );

    // Search for products matching any of the detected terms
    const products = await Product.find({
      $or: [
        { nameEn: { $in: searchRegex } },
        { nameTa: { $in: searchRegex } }
      ]
    })
    .populate('categoryId', 'nameEn nameTa')
    .limit(20)
    .select('nameEn nameTa price originalPrice imageUrl categoryId')
    .lean();

    // If no exact matches, try broader search
    if (products.length === 0) {
      const broadSearchTerms = searchTerms.slice(0, 3);
      const broadProducts = await Product.find({
        $or: broadSearchTerms.map(term => ({
          $or: [
            { nameEn: new RegExp(term.split(' ')[0], 'i') },
            { nameTa: new RegExp(term.split(' ')[0], 'i') }
          ]
        }))
      })
      .populate('categoryId', 'nameEn nameTa')
      .limit(10)
      .select('nameEn nameTa price originalPrice imageUrl categoryId')
      .lean();

      return res.json({
        analysis,
        products: broadProducts,
        searchTerms,
        message: broadProducts.length > 0 
          ? 'Showing related products' 
          : 'No matching products found'
      });
    }

    res.json({
      analysis,
      products,
      searchTerms,
      message: `Found ${products.length} matching products`
    });

  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ 
      message: 'Error processing image search',
      error: error.message 
    });
  }
});

// Health check endpoint
router.get('/status', (req, res) => {
  const visionClient = getVisionClient();
  res.json({
    available: !!visionClient,
    message: visionClient 
      ? 'Image search is available' 
      : 'Image search is not configured'
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

export default router;

