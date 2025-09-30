import { Star, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToWishlist = () => {
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded">New</Badge>
        )}
        {product.isBestSeller && (
          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Best</Badge>
        )}
        {product.discount && (
          <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{product.discount}%
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white border border-gray-200 hover:scale-110 h-8 w-8"
        onClick={handleAddToWishlist}
      >
        <Heart className="h-4 w-4" />
      </Button>

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="text-gray-500 font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-sm line-clamp-2 leading-tight text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-1 leading-tight">{product.description}</p>
          </div>

          {/* Rating */}
         

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm">Add to Cart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};