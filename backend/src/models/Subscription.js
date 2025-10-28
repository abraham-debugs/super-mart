import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  features: {
    maxOrders: {
      type: Number,
      default: 10
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
      default: 0
    }
  },
  billingHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    transactionId: String,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Method to check if subscription is expiring soon (within 7 days)
subscriptionSchema.methods.isExpiringSoon = function() {
  const daysUntilExpiry = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function(planType) {
  const plans = {
    free: {
      maxOrders: 10,
      freeDelivery: false,
      prioritySupport: false,
      exclusiveDeals: false,
      cashbackPercentage: 0,
      price: 0
    },
    basic: {
      maxOrders: 50,
      freeDelivery: true,
      prioritySupport: false,
      exclusiveDeals: true,
      cashbackPercentage: 2,
      price: 199
    },
    professional: {
      maxOrders: 200,
      freeDelivery: true,
      prioritySupport: true,
      exclusiveDeals: true,
      cashbackPercentage: 5,
      price: 499
    },
    enterprise: {
      maxOrders: -1, // unlimited
      freeDelivery: true,
      prioritySupport: true,
      exclusiveDeals: true,
      cashbackPercentage: 10,
      price: 999
    }
  };
  return plans[planType] || plans.free;
};

export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

