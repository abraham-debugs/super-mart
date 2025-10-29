import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { token } = useAuth() as any;
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  async function authedPost(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ productId: (product as any)._id || product.id })
    });
    return res;
  }

  const handleAddToWishlist = async () => {
    if (!token) {
      toast({ 
        title: "Login Required", 
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      window.location.href = '/login';
      return;
    }

    try {
      const res = await authedPost(`/api/user/wishlist/add`);
      
      if (res.status === 401) {
        toast({ 
          title: "Authentication Required", 
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        window.location.href = '/login';
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to add to wishlist" }));
        throw new Error(errorData.message || "Failed to add to wishlist");
      }
      
      toast({ title: "Added to Wishlist", description: `${product.name} was added to your wishlist` });
      setIsLiked(true);
    } catch (err: any) {
      toast({ 
        title: "Action failed", 
        description: err.message || "Could not add to wishlist",
        variant: "destructive"
      });
    }
  };

  const handleSaveForLater = async () => {
    if (!token) {
      toast({ 
        title: "Login Required", 
        description: "Please login to save items for later",
        variant: "destructive"
      });
      window.location.href = '/login';
      return;
    }

    try {
      const res = await authedPost(`/api/user/save-later/add`);
      
      if (res.status === 401) {
        toast({ 
          title: "Authentication Required", 
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        window.location.href = '/login';
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to save for later" }));
        throw new Error(errorData.message || "Failed to save for later");
      }
      
      toast({ title: "Saved for later", description: `${product.name} was saved for later` });
    } catch (err: any) {
      toast({ 
        title: "Action failed", 
        description: err.message || "Could not save for later",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card 
      className="group relative overflow-hidden bg-card border border-border/50 rounded-xl shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
            -{discountPercentage}%
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-110 transition-all duration-200"
          onClick={handleAddToWishlist}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-110 transition-all duration-200"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Button>
      </div>

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 rounded-t-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground font-medium text-sm">Out of Stock</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {product.category}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                Rs.{Number(product.price).toFixed(0)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  Rs.{Number(product.originalPrice).toFixed(0)}
                </span>
              )}
            </div>
            
            {product.originalPrice && (
              <div className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">
                Save Rs.{Number(product.originalPrice - product.price).toFixed(0)}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            size="sm"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};