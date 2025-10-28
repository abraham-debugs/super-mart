import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';

const router = express.Router();

// Get all available plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'forever',
      description: 'Perfect for trying out our service with basic features.',
      features: [
        { text: '10 orders per month', included: true },
        { text: 'Standard delivery', included: true },
        { text: 'Basic support', included: true },
        { text: 'Free delivery', included: false },
        { text: 'Priority support', included: false },
        { text: 'Exclusive deals', included: false },
        { text: 'Cashback', included: false }
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 199,
      duration: 'month',
      description: 'Great for individuals who shop regularly and want more benefits.',
      features: [
        { text: '50 orders per month', included: true },
        { text: 'Free delivery on all orders', included: true },
        { text: 'Exclusive deals access', included: true },
        { text: '2% cashback on all orders', included: true },
        { text: 'Email support', included: true },
        { text: 'Priority support', included: false },
        { text: 'Unlimited orders', included: false }
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 499,
      duration: 'month',
      description: 'Best for families and power users who shop frequently.',
      features: [
        { text: '200 orders per month', included: true },
        { text: 'Free delivery on all orders', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Exclusive deals access', included: true },
        { text: '5% cashback on all orders', included: true },
        { text: 'Early access to sales', included: true },
        { text: 'Birthday month special offers', included: true }
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      duration: 'month',
      description: 'Ultimate plan for businesses and bulk buyers with unlimited benefits.',
      features: [
        { text: 'Unlimited orders', included: true },
        { text: 'Free delivery on all orders', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Exclusive deals access', included: true },
        { text: '10% cashback on all orders', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Bulk order discounts', included: true },
        { text: 'Custom pricing for large orders', included: true }
      ],
      popular: false
    }
  ];

  res.json(plans);
});

// Get current user subscription
router.get('/my-subscription', requireAuth, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ userId: req.user._id });
    
    // If no subscription exists, create a free one
    if (!subscription) {
      const features = Subscription.getPlanFeatures('free');
      subscription = await Subscription.create({
        userId: req.user._id,
        planType: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date('2099-12-31'), // Free plan never expires
        features
      });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Subscribe to a plan
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { planType, paymentMethod, transactionId } = req.body;

    // Validate plan type
    const validPlans = ['free', 'basic', 'professional', 'enterprise'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Get plan features and price
    const planDetails = Subscription.getPlanFeatures(planType);

    // Calculate end date (30 days from now for paid plans)
    const endDate = planType === 'free' 
      ? new Date('2099-12-31') 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Check if user already has a subscription
    let subscription = await Subscription.findOne({ userId: req.user._id });

    if (subscription) {
      // Update existing subscription
      subscription.planType = planType;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.endDate = endDate;
      subscription.paymentMethod = paymentMethod || subscription.paymentMethod;
      subscription.transactionId = transactionId || null;
      subscription.amount = planDetails.price;
      subscription.features = {
        maxOrders: planDetails.maxOrders,
        freeDelivery: planDetails.freeDelivery,
        prioritySupport: planDetails.prioritySupport,
        exclusiveDeals: planDetails.exclusiveDeals,
        cashbackPercentage: planDetails.cashbackPercentage
      };

      // Add to billing history
      if (planType !== 'free') {
        subscription.billingHistory.push({
          date: new Date(),
          amount: planDetails.price,
          transactionId: transactionId || 'N/A',
          status: 'success'
        });
      }

      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        userId: req.user._id,
        planType,
        status: 'active',
        startDate: new Date(),
        endDate,
        paymentMethod,
        transactionId,
        amount: planDetails.price,
        features: {
          maxOrders: planDetails.maxOrders,
          freeDelivery: planDetails.freeDelivery,
          prioritySupport: planDetails.prioritySupport,
          exclusiveDeals: planDetails.exclusiveDeals,
          cashbackPercentage: planDetails.cashbackPercentage
        },
        billingHistory: planType !== 'free' ? [{
          date: new Date(),
          amount: planDetails.price,
          transactionId: transactionId || 'N/A',
          status: 'success'
        }] : []
      });
    }

    // Update user's subscription reference
    await User.findByIdAndUpdate(req.user._id, { 
      subscriptionId: subscription._id,
      subscriptionPlan: planType
    });

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Don't allow canceling free plan
    if (subscription.planType === 'free') {
      return res.status(400).json({ message: 'Cannot cancel free plan' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

// Toggle auto-renew
router.post('/auto-renew', requireAuth, async (req, res) => {
  try {
    const { autoRenew } = req.body;
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    subscription.autoRenew = autoRenew;
    await subscription.save();

    res.json({
      message: 'Auto-renew setting updated',
      subscription
    });
  } catch (error) {
    console.error('Auto-renew error:', error);
    res.status(500).json({ message: 'Error updating auto-renew' });
  }
});

// Get billing history
router.get('/billing-history', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(subscription.billingHistory);
  } catch (error) {
    console.error('Billing history error:', error);
    res.status(500).json({ message: 'Error fetching billing history' });
  }
});

export default router;

