import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { token } = useAuth() as any;

  async function authedPost(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ productId: (product as any)._id || product.id })
    });
    return res;
  }

  const handleAddToWishlist = async () => {
    try {
      const res = await authedPost(`/api/user/wishlist/add`);
      if (!res.ok) throw new Error("Failed to add to wishlist");
      toast({ title: "Added to Wishlist", description: `${product.name} was added to your wishlist` });
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message || "Could not add to wishlist" });
    }
  };

  const handleSaveForLater = async () => {
    try {
      const res = await authedPost(`/api/user/save-later/add`);
      if (!res.ok) throw new Error("Failed to save for later");
      toast({ title: "Saved for later", description: `${product.name} was saved for later` });
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message || "Could not save for later" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden bg-card border border-border rounded-xl shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {/* Badges */}
      {/* Optional status badges could go here if needed */}

      {/* Wishlist Button */}
      {/* Actions like wishlist/save are hidden to match the classic card */}

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
              <span className="text-gray-500 font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-[17px] leading-tight text-foreground line-clamp-2">{product.name}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1 leading-tight">
              {product.category}{product.description ? " • " + product.description.split(" ").slice(0,2).join(" ") : ""}
            </p>
          </div>

          {/* Rating */}
         

          {/* Price */}
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-secondary-dark">Rs. {Number(product.price).toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">Rs. {Number(product.originalPrice).toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="w-full rounded-md bg-secondary-light text-foreground hover:bg-secondary/20 border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};