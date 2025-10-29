import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import '@/styles/subscription.css';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscriptions/my-subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    setSubscribing(planId);

    try {
      const token = localStorage.getItem('token');
      
      // For demo purposes, generate a mock transaction ID
      const transactionId = planId === 'free' ? null : `TXN${Date.now()}`;
      
      const response = await fetch('http://localhost:5000/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: planId,
          paymentMethod: planId === 'free' ? null : 'credit_card',
          transactionId
        })
      });

      if (response.ok) {
        toast.success(`Successfully subscribed to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
        fetchCurrentSubscription();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe to plan');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select the perfect subscription plan for your shopping needs. Upgrade anytime to unlock more benefits.
          </p>
          {currentSubscription && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">
                Current Plan: {currentSubscription.planType.charAt(0).toUpperCase() + currentSubscription.planType.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card relative ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    POPULAR
                  </span>
                </div>
              )}

              <div className="plan-inner">
                {/* Pricing Badge */}
                <span className="plan-pricing">
                  <span>
                    Rs.{plan.price} <small>/ {plan.duration}</small>
                  </span>
                </span>

                {/* Plan Title */}
                <p className="plan-title">{plan.name}</p>

                {/* Description */}
                <p className="plan-info">{plan.description}</p>

                {/* Features List */}
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className={`plan-icon ${feature.included ? '' : 'opacity-30'}`}>
                        <Check className="h-4 w-4" />
                      </span>
                      <span className={feature.included ? '' : 'opacity-50 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="plan-action">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      subscribing !== null ||
                      (currentSubscription && currentSubscription.planType === plan.id)
                    }
                    className="plan-button w-full"
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentSubscription && currentSubscription.planType === plan.id ? (
                      'Current Plan'
                    ) : (
                      'Choose Plan'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            All plans include secure payments and can be cancelled anytime. 
            <br />
            Need help choosing? <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}

