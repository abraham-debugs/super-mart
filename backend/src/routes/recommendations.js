import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserActivity } from '../models/UserActivity.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

const router = express.Router();

// Track product view
router.post('/track/view', requireAuth, async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    let activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      activity = new UserActivity({ userId: req.user._id });
    }
    
    activity.addViewedProduct(productId);
    
    if (categoryId) {
      activity.updateCategoryPreference(categoryId);
    }
    
    await activity.save();
    
    res.json({ success: true, message: 'View tracked' });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ message: 'Error tracking view' });
  }
});

// Track search query
router.post('/track/search', requireAuth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    let activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      activity = new UserActivity({ userId: req.user._id });
    }
    
    activity.addSearchQuery(query);
    await activity.save();
    
    res.json({ success: true, message: 'Search tracked' });
  } catch (error) {
    console.error('Track search error:', error);
    res.status(500).json({ message: 'Error tracking search' });
  }
});

// Track cart addition
router.post('/track/cart', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    let activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      activity = new UserActivity({ userId: req.user._id });
    }
    
    activity.addCartProduct(productId);
    await activity.save();
    
    res.json({ success: true, message: 'Cart activity tracked' });
  } catch (error) {
    console.error('Track cart error:', error);
    res.status(500).json({ message: 'Error tracking cart' });
  }
});

// Track purchase (called after order completion)
router.post('/track/purchase', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    // Get order details
    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order || order.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    let activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      activity = new UserActivity({ userId: req.user._id });
    }
    
    // Track each purchased product
    order.items.forEach(item => {
      activity.addPurchasedProduct(item.productId, item.quantity, item.price);
    });
    
    await activity.save();
    
    res.json({ success: true, message: 'Purchase tracked' });
  } catch (error) {
    console.error('Track purchase error:', error);
    res.status(500).json({ message: 'Error tracking purchase' });
  }
});

// Track product rating
router.post('/track/rating', requireAuth, async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    
    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    let activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      activity = new UserActivity({ userId: req.user._id });
    }
    
    activity.addRating(productId, rating, review);
    await activity.save();
    
    res.json({ success: true, message: 'Rating tracked' });
  } catch (error) {
    console.error('Track rating error:', error);
    res.status(500).json({ message: 'Error tracking rating' });
  }
});

// Get personalized recommendations
router.get('/personalized', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activity = await UserActivity.findOne({ userId: req.user._id })
      .populate('viewedProducts.productId')
      .populate('purchasedProducts.productId')
      .populate('ratings.productId');
    
    let recommendedProducts = [];
    
    if (!activity) {
      // New user - return popular/trending products
      recommendedProducts = await Product.find()
        .limit(limit)
        .select('nameEn nameTa price originalPrice imageUrl categoryId')
        .populate('categoryId', 'nameEn nameTa')
        .lean();
      
      return res.json({
        recommendations: recommendedProducts,
        strategy: 'trending',
        message: 'Showing trending products for new users'
      });
    }
    
    // Get recommendation based on user activity
    const recommendations = await generateRecommendations(activity, limit);
    
    res.json({
      recommendations: recommendations.products,
      strategy: recommendations.strategy,
      message: recommendations.message
    });
    
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

// Recommendation Engine - Hybrid Approach
async function generateRecommendations(activity, limit = 10) {
  const recommendationScores = new Map();
  
  // 1. Content-Based Filtering (Based on viewed products)
  const viewedProductIds = activity.viewedProducts
    .slice(0, 20) // Last 20 viewed
    .map(v => v.productId?._id || v.productId);
  
  if (viewedProductIds.length > 0) {
    const viewedProducts = await Product.find({
      _id: { $in: viewedProductIds }
    }).populate('categoryId');
    
    const categoryIds = [...new Set(
      viewedProducts.map(p => p.categoryId?._id).filter(Boolean)
    )];
    
    if (categoryIds.length > 0) {
      const similarProducts = await Product.find({
        categoryId: { $in: categoryIds },
        _id: { $nin: viewedProductIds }
      }).limit(limit * 2).lean();
      
      similarProducts.forEach(product => {
        const score = recommendationScores.get(product._id.toString()) || 0;
        recommendationScores.set(product._id.toString(), score + 5);
      });
    }
  }
  
  // 2. Collaborative Filtering (Users who bought X also bought Y)
  const purchasedProductIds = activity.purchasedProducts
    .map(p => p.productId?._id || p.productId);
  
  if (purchasedProductIds.length > 0) {
    // Find other users who bought similar products
    const similarUsers = await UserActivity.find({
      'purchasedProducts.productId': { $in: purchasedProductIds },
      userId: { $ne: activity.userId }
    }).limit(50);
    
    const collaborativeProducts = new Map();
    
    similarUsers.forEach(user => {
      user.purchasedProducts.forEach(p => {
        const productId = p.productId?.toString();
        if (productId && !purchasedProductIds.includes(productId)) {
          const count = collaborativeProducts.get(productId) || 0;
          collaborativeProducts.set(productId, count + 1);
        }
      });
    });
    
    // Add collaborative scores
    for (const [productId, count] of collaborativeProducts) {
      const score = recommendationScores.get(productId) || 0;
      recommendationScores.set(productId, score + (count * 3));
    }
  }
  
  // 3. Boost based on ratings
  const highRatedProductIds = activity.ratings
    .filter(r => r.rating >= 4)
    .map(r => r.productId?._id || r.productId);
  
  if (highRatedProductIds.length > 0) {
    const highRatedProducts = await Product.find({
      _id: { $in: highRatedProductIds }
    }).populate('categoryId');
    
    const categoryIds = [...new Set(
      highRatedProducts.map(p => p.categoryId?._id).filter(Boolean)
    )];
    
    if (categoryIds.length > 0) {
      const ratedCategoryProducts = await Product.find({
        categoryId: { $in: categoryIds },
        _id: { $nin: [...viewedProductIds, ...purchasedProductIds] }
      }).limit(limit).lean();
      
      ratedCategoryProducts.forEach(product => {
        const score = recommendationScores.get(product._id.toString()) || 0;
        recommendationScores.set(product._id.toString(), score + 7);
      });
    }
  }
  
  // 4. Trending/Popular products (fallback)
  if (recommendationScores.size < limit) {
    const trending = await Product.find()
      .limit(limit)
      .lean();
    
    trending.forEach(product => {
      if (!recommendationScores.has(product._id.toString())) {
        recommendationScores.set(product._id.toString(), 1);
      }
    });
  }
  
  // Sort by score and get top products
  const sortedProductIds = Array.from(recommendationScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);
  
  const products = await Product.find({
    _id: { $in: sortedProductIds }
  })
    .populate('categoryId', 'nameEn nameTa')
    .select('nameEn nameTa price originalPrice imageUrl categoryId')
    .lean();
  
  // Maintain the score-based order
  const orderedProducts = sortedProductIds
    .map(id => products.find(p => p._id.toString() === id))
    .filter(Boolean);
  
  let strategy = 'hybrid';
  let message = 'Personalized recommendations based on your activity';
  
  if (purchasedProductIds.length > 0) {
    strategy = 'collaborative';
    message = 'Based on your purchases and similar users';
  } else if (viewedProductIds.length > 5) {
    strategy = 'content-based';
    message = 'Based on products you viewed';
  } else if (orderedProducts.length < 5) {
    strategy = 'trending';
    message = 'Trending products you might like';
  }
  
  return {
    products: orderedProducts,
    strategy,
    message
  };
}

// Get user activity summary
router.get('/activity/summary', requireAuth, async (req, res) => {
  try {
    const activity = await UserActivity.findOne({ userId: req.user._id });
    
    if (!activity) {
      return res.json({
        viewedCount: 0,
        purchasedCount: 0,
        ratingsCount: 0,
        cartItemsCount: 0
      });
    }
    
    res.json({
      viewedCount: activity.viewedProducts.length,
      purchasedCount: activity.purchasedProducts.length,
      ratingsCount: activity.ratings.length,
      cartItemsCount: activity.cartProducts.filter(c => !c.removed).length,
      lastUpdated: activity.lastUpdated
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({ message: 'Error fetching activity summary' });
  }
});

export default router;


