import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const PLACEHOLDER_IMG = "https://placehold.co/80x80";

type BackendCategory = { _id: string; name: string; imageUrl: string };

const fallbackCategories: BackendCategory[] = [
  { _id: "fruits-vegetables", name: "Fruits & Vegetables", imageUrl: PLACEHOLDER_IMG },
  { _id: "dairy-bread-eggs", name: "Dairy, Bread & Eggs", imageUrl: PLACEHOLDER_IMG },
  { _id: "atta-rice-oil", name: "Atta, Rice, Oil & Dals", imageUrl: PLACEHOLDER_IMG },
  { _id: "meat-fish-eggs", name: "Meat, Fish & Eggs", imageUrl: PLACEHOLDER_IMG },
  { _id: "masala-dry-fruits", name: "Masala & Dry Fruits", imageUrl: PLACEHOLDER_IMG },
  { _id: "breakfast-sauces", name: "Breakfast & Sauces", imageUrl: PLACEHOLDER_IMG },
  { _id: "packaged-food", name: "Packaged Food", imageUrl: PLACEHOLDER_IMG },
  { _id: "tea-coffee", name: "Tea, Coffee & More", imageUrl: PLACEHOLDER_IMG },
  { _id: "ice-cream", name: "Ice Creams & More", imageUrl: PLACEHOLDER_IMG },
  { _id: "frozen-food", name: "Frozen Food", imageUrl: PLACEHOLDER_IMG }
];

export const CategoryCarousel = () => {
  const navigate = useNavigate();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<BackendCategory[]>(fallbackCategories);

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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/categories`);
        if (!res.ok) return;
        const data: BackendCategory[] = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch (_err) {
        // keep fallbacks
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative bg-background border-b border-border">
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
                key={category._id}
                className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group hover:scale-105 transition-all duration-200 flex-shrink-0"
                  onClick={() => {
                    const evt = new CustomEvent("category:selected", { detail: { id: category._id, name: category.name } });
                    window.dispatchEvent(evt);
                    // also navigate to category page
                    try {
                      navigate(`/category/${category._id}`);
                    } catch (_err) {
                      // navigate might not be available in some contexts; ignore
                    }
                  }}
              >
                {/* Category icon/image */}
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center overflow-hidden group-hover:bg-primary/10 transition-all duration-200 shadow-sm group-hover:shadow-md border border-border">
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                </div>
                
                {/* Category name */}
                <span className="text-xs text-center text-foreground/80 font-medium leading-tight group-hover:text-primary transition-colors duration-200 max-w-[80px]">
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
