import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  HeartOff, 
  Sparkles,
  TrendingDown,
  Loader2,
  Eye,
  ShoppingBag
} from "lucide-react";
import { Product } from "@/types/product";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

type ListItem = {
  _id: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId?: string;
};

const Wishlist: React.FC = () => {
  const { token, user } = useAuth() as any;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        if (!cancelled) setItems(data || []);
      } catch (err: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: err.message || "Failed to load wishlist",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const handleRemove = async (productId: string) => {
    setRemovingIds(prev => new Set(prev).add(productId));
    try {
      const res = await fetch(`${API_BASE}/api/user/wishlist/remove`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId })
      });
      
      if (!res.ok) throw new Error("Failed to remove item");
      
      setItems(prev => prev.filter(item => item._id !== productId));
      toast({
        title: "Removed",
        description: "Item removed from your wishlist",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleAddToCart = (item: ListItem) => {
    const product: Product = {
      id: item._id,
      name: item.nameEn,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.imageUrl,
      category: "",
      inStock: true,
    };
    addToCart(product);
  };

  const discountPercentage = (item: ListItem) => {
    if (item.originalPrice) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-6">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 flex items-center justify-center">
                <HeartOff className="h-16 w-16 text-pink-400 dark:text-pink-500" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Start exploring and add products you love to your wishlist. They'll be saved here for you to revisit later!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const discount = discountPercentage(item);
              const isRemoving = removingIds.has(item._id);
              
              return (
                <Card 
                  key={item._id} 
                  className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {discount}% OFF
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item._id)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>

                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-t-xl">
                      <img
                        src={item.imageUrl}
                        alt={item.nameEn}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base leading-tight text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.nameEn}
                        </h3>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Rs.{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              Rs.{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {item.originalPrice && (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                            Save Rs.{(item.originalPrice - item.price).toLocaleString()}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/category/${item.categoryId || ''}`)}
                          className="hover:bg-gray-100 dark:hover:bg-slate-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Continue Shopping Button */}
        {items.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-8 py-6 text-base hover:bg-gray-50 dark:hover:bg-slate-800"
              size="lg"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
