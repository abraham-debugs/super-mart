import mongoose from 'mongoose';

const SubscriptionPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  duration: {
    type: String,
    required: true,
    enum: ['forever', 'month', 'year'],
    default: 'month'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  features: [{
    text: {
      type: String,
      required: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Plan features for subscription logic
  maxOrders: {
    type: Number,
    default: 10,
    // -1 means unlimited
  },
  freeDelivery: {
    type: Boolean,
    default: false
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  exclusiveDeals: {
    type: Boolean,
    default: false
  },
  cashbackPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
SubscriptionPlanSchema.index({ planId: 1 });
SubscriptionPlanSchema.index({ isActive: 1 });
SubscriptionPlanSchema.index({ order: 1 });

export const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);













