import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from './ProductCard';
import type { Product as CartProduct } from '@/types/product';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface Product {
  _id: string;
  nameEn: string;
  nameTa?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId?: {
    _id?: string;
    nameEn: string;
    nameTa?: string;
  };
}

interface RecommendedProductsProps {
  limit?: number;
  title?: string;
}

export default function RecommendedProducts({ limit = 10, title }: RecommendedProductsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchRecommendations();
  }, [user, limit]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/recommendations/personalized?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.recommendations || []);
        setStrategy(data.strategy || '');
        setMessage(data.message || '');
      } else if (response.status === 401) {
        // Token expired or invalid - clear it and don't show recommendations
        console.warn('Authentication failed for recommendations');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || products.length === 0) {
    return null;
  }

  const getStrategyIcon = () => {
    switch (strategy) {
      case 'collaborative':
        return <Star className="h-5 w-5" />;
      case 'content-based':
        return <Sparkles className="h-5 w-5" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getStrategyBadgeColor = () => {
    switch (strategy) {
      case 'collaborative':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'content-based':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'trending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                {getStrategyIcon()}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {title || 'Recommended For You'}
              </h2>
            </div>
            <div className="flex items-center gap-2 ml-13">
              <Badge className={`${getStrategyBadgeColor()} border`}>
                {message}
              </Badge>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 mb-1"></div>
                <div className="bg-gray-200 rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const cartProduct: CartProduct = {
                id: product._id,
                name: product.nameEn,
                description: product.nameTa || product.nameEn,
                price: product.price,
                originalPrice: product.originalPrice,
                category: product.categoryId?.nameEn || 'Recommended',
                image: product.imageUrl,
                rating: 0,
                reviews: 0,
                inStock: true,
              };

              return (
                <div key={product._id} onClick={() => {
                  // Track view logic if needed here, or handle inside ProductCard if unified
                  if (user) {
                    const token = localStorage.getItem('token');
                    fetch(`${API_BASE}/api/recommendations/track/view`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        productId: product._id,
                        categoryId: product.categoryId?._id
                      })
                    }).catch(console.error);
                  }
                }}>
                  <ProductCard product={cartProduct} />
                </div>
              );
            })}
          </div>
        )}

        {/* View More Button */}
        {products.length >= 10 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              onClick={() => navigate('/recommended')}
            >
              View All Recommendations
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

