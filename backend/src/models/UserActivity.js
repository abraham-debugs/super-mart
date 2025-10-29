import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Products the user has viewed
  viewedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    viewCount: {
      type: Number,
      default: 1
    }
  }],
  
  // Products the user has purchased
  purchasedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    quantity: {
      type: Number,
      default: 1
    },
    price: Number
  }],
  
  // Products in cart (current or past)
  cartProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    removed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Product ratings and feedback
  ratings: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Search queries (for understanding user intent)
  searchQueries: [{
    query: String,
    searchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Categories the user is interested in
  categoryPreferences: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    interactionCount: {
      type: Number,
      default: 1
    }
  }],
  
  // User preferences
  preferences: {
    priceRange: {
      min: Number,
      max: Number
    },
    favoriteCategories: [String],
    excludedCategories: [String]
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ 'viewedProducts.productId': 1 });
userActivitySchema.index({ 'purchasedProducts.productId': 1 });
userActivitySchema.index({ lastUpdated: -1 });

// Method to add viewed product
userActivitySchema.methods.addViewedProduct = function(productId) {
  const existing = this.viewedProducts.find(
    v => v.productId.toString() === productId.toString()
  );
  
  if (existing) {
    existing.viewCount += 1;
    existing.viewedAt = new Date();
  } else {
    this.viewedProducts.unshift({
      productId,
      viewedAt: new Date(),
      viewCount: 1
    });
  }
  
  // Keep only last 100 viewed products
  if (this.viewedProducts.length > 100) {
    this.viewedProducts = this.viewedProducts.slice(0, 100);
  }
  
  this.lastUpdated = new Date();
};

// Method to add purchased product
userActivitySchema.methods.addPurchasedProduct = function(productId, quantity, price) {
  this.purchasedProducts.unshift({
    productId,
    purchasedAt: new Date(),
    quantity: quantity || 1,
    price
  });
  
  this.lastUpdated = new Date();
};

// Method to add cart product
userActivitySchema.methods.addCartProduct = function(productId) {
  const existing = this.cartProducts.find(
    c => c.productId.toString() === productId.toString() && !c.removed
  );
  
  if (!existing) {
    this.cartProducts.unshift({
      productId,
      addedAt: new Date(),
      removed: false
    });
  }
  
  this.lastUpdated = new Date();
};

// Method to add rating
userActivitySchema.methods.addRating = function(productId, rating, review) {
  const existing = this.ratings.find(
    r => r.productId.toString() === productId.toString()
  );
  
  if (existing) {
    existing.rating = rating;
    existing.review = review;
    existing.ratedAt = new Date();
  } else {
    this.ratings.push({
      productId,
      rating,
      review,
      ratedAt: new Date()
    });
  }
  
  this.lastUpdated = new Date();
};

// Method to add search query
userActivitySchema.methods.addSearchQuery = function(query) {
  this.searchQueries.unshift({
    query,
    searchedAt: new Date()
  });
  
  // Keep only last 50 searches
  if (this.searchQueries.length > 50) {
    this.searchQueries = this.searchQueries.slice(0, 50);
  }
  
  this.lastUpdated = new Date();
};

// Method to update category preference
userActivitySchema.methods.updateCategoryPreference = function(categoryId) {
  const existing = this.categoryPreferences.find(
    c => c.categoryId.toString() === categoryId.toString()
  );
  
  if (existing) {
    existing.interactionCount += 1;
  } else {
    this.categoryPreferences.push({
      categoryId,
      interactionCount: 1
    });
  }
  
  this.lastUpdated = new Date();
};

export const UserActivity = mongoose.models.UserActivity || 
  mongoose.model('UserActivity', userActivitySchema);



