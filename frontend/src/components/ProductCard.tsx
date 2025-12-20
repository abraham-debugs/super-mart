import { Heart, ShoppingCart, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset after adding
  };

  return (
    <Card
      className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Flag Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-0 left-4 z-20">
          <div className="bg-[#eab308] text-white text-[10px] font-bold px-2 py-3 flex flex-col items-center justify-center min-w-[40px] leading-tight relative shadow-sm">
            <span>{discountPercentage}%</span>
            <span>Off</span>
            {/* Triangle cutout at the bottom to make it look like a flag/ribbon */}
            <div className="absolute top-full left-0 w-full h-0 border-l-[20px] border-l-[#eab308] border-r-[20px] border-r-[#eab308] border-b-[10px] border-b-transparent transform scale-x-[1] origin-top"></div>
            {/* The above css triangle trick might be tricky with width. 
                Let's use a simpler clip-path approach or SVG if that fails. 
                Actually, simpler: Just a rectangle with a :after triangle? 
                Let's stick to a simple rectangle for reliability, or a standard "Badge" for now if CSS is complex. 
                Re-trying with a simple shape. */}
          </div>
          {/* SVG for the bottom triangle part of the ribbon */}
          <svg className="w-full h-2 text-[#eab308] absolute top-full left-0" viewBox="0 0 100 10" preserveAspectRatio="none">
            <polygon points="0,0 50,10 100,0" fill="currentColor" />
          </svg>
        </div>
      )}

      <CardContent className="p-4 pt-8">
        {/* Product Image */}
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50/50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {product.description && product.description.length < 20 ? product.description : "500g Pack"}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-600">
              Rs.{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through decoration-gray-400">
                Rs.{Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-3 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 rounded-lg bg-white h-10 w-24">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 disabled:opacity-50 transition-colors"
              >
                <span className="text-lg">-</span>
              </button>
              <div className="flex-1 h-full flex items-center justify-center font-semibold text-gray-900 text-sm">
                {quantity}
              </div>
              <button
                onClick={handleIncrement}
                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
              >
                <span className="text-lg">+</span>
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              variant="outline"
              className="flex-1 h-10 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold text-sm transition-all duration-200 gap-2"
            >
              <span>Add</span>
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};