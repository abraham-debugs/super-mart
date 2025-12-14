import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FollowerPointerCard } from '@/components/ui/following-pointer';
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

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/plans`);
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
      const response = await fetch(`${API_BASE}/api/subscriptions/my-subscription`, {
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
      
      const response = await fetch(`${API_BASE}/api/subscriptions/subscribe`, {
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

  // Get active plans only and limit to 5 for the tab design
  const activePlans = plans.filter(plan => plan.isActive !== false).slice(0, 5);
  const planCount = activePlans.length;
  const defaultTab = activePlans.findIndex(p => p.popular) >= 0 
    ? activePlans.findIndex(p => p.popular) + 1 
    : 1;

  const getDurationText = (duration: string) => {
    if (duration === 'forever') return '';
    if (duration === 'month') return '/mon';
    if (duration === 'year') return '/year';
    return `/${duration}`;
  };

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
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-full">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">
                Current Plan: {currentSubscription.planType.charAt(0).toUpperCase() + currentSubscription.planType.slice(1)}
              </span>
            </div>
          )}
        </div>

        {activePlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No subscription plans available at the moment.</p>
          </div>
        ) : (
          <div className={`subscription-wrapper plan-count-${planCount}`}>
            {/* Radio inputs for tabs */}
            {activePlans.map((_, index) => (
              <input
                key={index}
                id={`plan-tab-${index + 1}`}
                name="plan-slider"
                type="radio"
                defaultChecked={index + 1 === defaultTab}
              />
            ))}

            {/* Tab Headers */}
            <header>
              {activePlans.map((plan, index) => (
                <label
                  key={plan.id}
                  className={`tab-${index + 1}`}
                  htmlFor={`plan-tab-${index + 1}`}
                >
                  {plan.name}
                </label>
              ))}
              <div className="slider"></div>
            </header>

            {/* Plan Cards */}
            <div className="card-area">
              <div className="cards">
                {activePlans.map((plan, index) => (
                  <FollowerPointerCard
                    key={plan.id}
                    title={
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-black" />
                        <p className="text-sm font-semibold">{plan.name} Plan</p>
                      </div>
                    }
                    className="row"
                  >
                    <div className="price-details">
                      <span 
                        className="price"
                        data-duration={getDurationText(plan.duration)}
                      >
                        {plan.price}
                      </span>
                      <p>{plan.description || `For ${plan.name.toLowerCase()} use`}</p>
                    </div>
                    <ul className="features">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className={feature.included ? 'included' : ''}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>{feature.text}</span>
                          </li>
                        ))
                      ) : (
                        <li className="included">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>All basic features included</span>
                        </li>
                      )}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={
                        subscribing !== null ||
                        (currentSubscription && currentSubscription.planType === plan.id)
                      }
                    >
                      {subscribing === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                          Processing...
                        </>
                      ) : currentSubscription && currentSubscription.planType === plan.id ? (
                        'Current Plan'
                      ) : (
                        'Choose plan'
                      )}
                    </button>
                  </FollowerPointerCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            All plans include secure payments and can be cancelled anytime. 
            <br />
            Need help choosing? <button className="text-black dark:text-white hover:underline font-medium">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}

