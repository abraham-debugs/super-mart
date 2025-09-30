import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

const categories: Category[] = [
  {
    id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    icon: "🥬",
    image: "/api/placeholder/80/80"
  },
  {
    id: "dairy-bread-eggs",
    name: "Dairy, Bread & Eggs",
    icon: "🥛",
    image: "/api/placeholder/80/80"
  },
  {
    id: "atta-rice-oil",
    name: "Atta, Rice, Oil & Dals",
    icon: "🌾",
    image: "/api/placeholder/80/80"
  },
  {
    id: "meat-fish-eggs",
    name: "Meat, Fish & Eggs",
    icon: "🐟",
    image: "/api/placeholder/80/80"
  },
  {
    id: "masala-dry-fruits",
    name: "Masala & Dry Fruits",
    icon: "🥜",
    image: "/api/placeholder/80/80"
  },
  {
    id: "breakfast-sauces",
    name: "Breakfast & Sauces",
    icon: "🍳",
    image: "/api/placeholder/80/80"
  },
  {
    id: "packaged-food",
    name: "Packaged Food",
    icon: "📦",
    image: "/api/placeholder/80/80"
  },
  {
    id: "zepto-cafe",
    name: "Zepto Cafe",
    icon: "☕",
    image: "/api/placeholder/80/80"
  },
  {
    id: "tea-coffee",
    name: "Tea, Coffee & More",
    icon: "🍵",
    image: "/api/placeholder/80/80"
  },
  {
    id: "ice-cream",
    name: "Ice Creams & More",
    icon: "🍦",
    image: "/api/placeholder/80/80"
  },
  {
    id: "frozen-food",
    name: "Frozen Food",
    icon: "🧊",
    image: "/api/placeholder/80/80"
  }
];

export const CategoryCarousel = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 rounded-full"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 rounded-full"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Categories container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
            onScroll={checkScrollButtons}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group hover:scale-105 transition-all duration-200 flex-shrink-0"
              >
                {/* Category icon/image */}
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-200 shadow-sm group-hover:shadow-md">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                
                {/* Category name */}
                <span className="text-xs text-center text-gray-700 font-medium leading-tight group-hover:text-primary transition-colors duration-200 max-w-[80px]">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
