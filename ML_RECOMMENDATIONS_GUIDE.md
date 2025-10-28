# 🤖 ML-Based Personalized Recommendations System

## Overview

Your super-mart shop now features a comprehensive **ML-powered recommendation engine** that provides personalized product suggestions based on user behavior and activity.

## 🎯 Features Implemented

### 1. **User Activity Tracking**
- ✅ Product views
- ✅ Search queries
- ✅ Cart additions
- ✅ Product purchases
- ✅ Product ratings & reviews
- ✅ Category preferences

### 2. **Recommendation Algorithms**

#### **Hybrid Approach** (Combines multiple strategies)

| Algorithm | Description | Weight |
|-----------|-------------|--------|
| **Content-Based Filtering** | Based on products viewed/liked | 5 points |
| **Collaborative Filtering** | "Users who bought X also bought Y" | 3 points |
| **Rating-Based** | From highly-rated products' categories | 7 points |
| **Trending** | Popular products (fallback) | 1 point |

### 3. **Recommendation Strategies**

The system automatically selects the best strategy based on user data:

```
📊 Strategy Selection Logic:
├─ Has purchases? → Collaborative Filtering
├─ Has 5+ views? → Content-Based Filtering  
├─ New user? → Trending Products
└─ Default → Hybrid (combines all)
```

## 📁 File Structure

### Backend

```
backend/src/
├── models/
│   └── UserActivity.js          # User behavior tracking model
└── routes/
    └── recommendations.js       # Recommendation API endpoints
```

### Frontend

```
frontend/src/components/
└── RecommendedProducts.tsx      # Recommendations display component
```

## 🔌 API Endpoints

### 1. **Track User Activity**

#### Track Product View
```http
POST /api/recommendations/track/view
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "674abc123...",
  "categoryId": "674def456..."  // optional
}
```

#### Track Search Query
```http
POST /api/recommendations/track/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "rice oil"
}
```

#### Track Cart Addition
```http
POST /api/recommendations/track/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "674abc123..."
}
```

#### Track Purchase
```http
POST /api/recommendations/track/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "674ghi789..."
}
```

#### Track Product Rating
```http
POST /api/recommendations/track/rating
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "674abc123...",
  "rating": 4,
  "review": "Great product!"  // optional
}
```

### 2. **Get Recommendations**

```http
GET /api/recommendations/personalized?limit=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "recommendations": [
    {
      "_id": "674abc123...",
      "nameEn": "Basmati Rice",
      "price": 120,
      "originalPrice": 150,
      "imageUrl": "https://...",
      "categoryId": {
        "nameEn": "Grains & Cereals"
      }
    }
  ],
  "strategy": "collaborative",
  "message": "Based on your purchases and similar users"
}
```

### 3. **Get Activity Summary**

```http
GET /api/recommendations/activity/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "viewedCount": 25,
  "purchasedCount": 8,
  "ratingsCount": 3,
  "cartItemsCount": 2,
  "lastUpdated": "2025-10-27T10:30:00Z"
}
```

## 💾 Data Model: UserActivity

```javascript
{
  userId: ObjectId,
  
  viewedProducts: [
    {
      productId: ObjectId,
      viewedAt: Date,
      viewCount: Number
    }
  ],
  
  purchasedProducts: [
    {
      productId: ObjectId,
      purchasedAt: Date,
      quantity: Number,
      price: Number
    }
  ],
  
  cartProducts: [
    {
      productId: ObjectId,
      addedAt: Date,
      removed: Boolean
    }
  ],
  
  ratings: [
    {
      productId: ObjectId,
      rating: Number (1-5),
      review: String,
      ratedAt: Date
    }
  ],
  
  searchQueries: [
    {
      query: String,
      searchedAt: Date
    }
  ],
  
  categoryPreferences: [
    {
      categoryId: ObjectId,
      interactionCount: Number
    }
  ]
}
```

## 🎨 Frontend Integration

### Using the Component

```tsx
import RecommendedProducts from '@/components/RecommendedProducts';

// In your page
<RecommendedProducts 
  limit={10} 
  title="Recommended For You" 
/>
```

### Manual Tracking (Optional)

```typescript
// Track a product view
const trackView = async (productId: string, categoryId?: string) => {
  const token = localStorage.getItem('token');
  await fetch(`${API_BASE}/api/recommendations/track/view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId, categoryId })
  });
};

// Track a search
const trackSearch = async (query: string) => {
  const token = localStorage.getItem('token');
  await fetch(`${API_BASE}/api/recommendations/track/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });
};
```

## 🧪 Testing the Recommendations

### 1. **As a New User**
```bash
# Expected: Trending/Popular products
GET /api/recommendations/personalized
→ Strategy: "trending"
→ Message: "Trending products you might like"
```

### 2. **After Viewing Products**
```bash
# View some products
POST /api/recommendations/track/view
{ "productId": "rice_id", "categoryId": "grains_id" }

POST /api/recommendations/track/view
{ "productId": "oil_id", "categoryId": "cooking_id" }

# Get recommendations
GET /api/recommendations/personalized
→ Strategy: "content-based"
→ Message: "Based on products you viewed"
→ Returns: Similar category products
```

### 3. **After Purchases**
```bash
# Complete an order
POST /api/recommendations/track/purchase
{ "orderId": "order_123" }

# Get recommendations
GET /api/recommendations/personalized
→ Strategy: "collaborative"
→ Message: "Based on your purchases and similar users"
→ Returns: Products other users purchased
```

## 📊 Recommendation Score Calculation

```javascript
Score Weights:
├─ Content-Based Match (same category): +5
├─ Collaborative Match (co-purchased): +3 per user
├─ Rating-Based Match (high-rated category): +7
└─ Trending Product (fallback): +1

Final Recommendations = Top 10 products by total score
```

## 🎯 Real-World Example

### Scenario: User browsing grocery items

```
User Activity:
1. Views: Rice (3x), Cooking Oil (2x), Flour (1x)
2. Searches: "basmati rice", "olive oil"
3. Purchases: Premium Rice, Sunflower Oil
4. Ratings: Rice (5★), Oil (4★)

Recommendation Process:
├─ Content-Based: Find products in "Grains" & "Cooking" categories
├─ Collaborative: Find what users who bought Rice+Oil also bought
├─ Rating-Based: More products from highly-rated categories
└─ Combine & Score

Result:
1. Basmati Rice Premium (Score: 15)
2. Extra Virgin Olive Oil (Score: 12)
3. Whole Wheat Flour (Score: 10)
4. Cooking Spices Set (Score: 8)
   ...
```

## 🚀 Advanced Features (Future Enhancements)

### 1. **Time-Based Decay**
```javascript
// Reduce weight of older activities
const ageInDays = (now - viewedAt) / (1000 * 60 * 60 * 24);
const decayedScore = baseScore * Math.exp(-ageInDays / 30);
```

### 2. **Seasonal Recommendations**
```javascript
// Boost certain categories by season
if (currentMonth === 'December') {
  score *= 1.5; // Boost festive items
}
```

### 3. **Price Range Preferences**
```javascript
// Learn user's typical price range
const avgPurchasePrice = userActivity.purchasedProducts
  .reduce((sum, p) => sum + p.price, 0) / count;
  
// Boost products in similar range
```

### 4. **Real ML Integration**
```javascript
// Use TensorFlow.js for deep learning
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('user-product-model.json');
const predictions = model.predict(userFeatures);
```

## 🔍 Monitoring & Analytics

### Track Recommendation Performance

```javascript
// Add click tracking
POST /api/recommendations/track/click
{
  "recommendationId": "rec_123",
  "productId": "prod_456",
  "strategy": "collaborative"
}

// Analyze conversion rates
Metric: Recommended → Viewed → Added to Cart → Purchased
```

## 📈 Performance Optimization

### 1. **Caching**
```javascript
// Cache recommendations for 5 minutes
const cacheKey = `recommendations:${userId}`;
await redis.set(cacheKey, JSON.stringify(recommendations), 'EX', 300);
```

### 2. **Batch Processing**
```javascript
// Update recommendations daily via cron job
cron.schedule('0 0 * * *', async () => {
  await generateRecommendationsForAllUsers();
});
```

### 3. **Database Indexing**
```javascript
// Already implemented in UserActivity model
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ 'viewedProducts.productId': 1 });
userActivitySchema.index({ 'purchasedProducts.productId': 1 });
```

## 🎓 Key Benefits

1. **Increased Sales** - Users discover products they actually want
2. **Better UX** - Personalized shopping experience
3. **Customer Retention** - Relevant recommendations keep users engaged
4. **Data-Driven** - Learn from user behavior automatically
5. **Scalable** - Works for any number of users/products

## 🛠️ Troubleshooting

### Issue: No recommendations showing

```bash
# Check if user is logged in
→ Recommendations require authentication

# Check user activity
GET /api/recommendations/activity/summary
→ If all counts are 0, user needs to interact more

# Check products in database
→ Ensure products exist and have proper categories
```

### Issue: Same recommendations every time

```bash
# Solution: Track more user activity
→ View products, search, add to cart
→ System will learn preferences over time
```

### Issue: Slow response

```bash
# Solutions:
1. Add Redis caching
2. Limit recommendation depth (already limited to 50 similar users)
3. Index database properly (already done)
4. Use pagination for large datasets
```

## 📝 Next Steps

1. **Track cart additions** automatically when user adds items
2. **Track purchases** automatically on order completion
3. **Add rating system** on product pages
4. **Monitor performance** with analytics
5. **A/B test** different recommendation strategies
6. **Fine-tune** weights based on conversion data

---

**Your personalized recommendation system is ready to use!** 🎉

Users will now see tailored product suggestions based on their browsing and shopping behavior, just like Amazon, Netflix, and other major e-commerce platforms!


