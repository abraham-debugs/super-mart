import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface Product {
  _id: string;
  nameEn: string;
  nameTa?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId?: {
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {products.map((product) => {
              const discount = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <Card
                  key={product._id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                  onClick={() => {
                    // Track view
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
                      }).catch(err => console.error('Track view error:', err));
                    }
                    // Navigate to product details (you can implement this later)
                  }}
                >
                  <CardContent className="p-2">
                    {/* Product Image */}
                    <div className="relative mb-2 aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <Badge className="absolute top-1 right-1 bg-red-500 text-white border-0 text-[10px] px-1 py-0 h-4">
                          {discount}%
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-0.5">
                      <h3 className="font-medium text-[11px] text-gray-900 line-clamp-2 leading-tight">
                        {product.nameEn}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-blue-600">
                          Rs.{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs.{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      className="w-full mt-2 h-7 text-[11px] bg-green-700 hover:from-purple-700 hover:to-pink-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic (implement with your cart context)
                        console.log('Add to cart:', product._id);
                      }}
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
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
              className="text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
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

