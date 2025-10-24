import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BalancingLoader } from "@/components/BalancingLoader";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const PLACEHOLDER_IMG = "https://placehold.co/80x80";

type BackendCategory = { 
  _id: string; 
  name: string; 
  imageUrl: string; 
  parentCategory?: { _id: string; name: string } | null;
};

type CategoryGroup = {
  parent: BackendCategory;
  children: BackendCategory[];
};

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

// Gradient color schemes for each category
const categoryGradients = [
  "from-emerald-500 to-green-600",
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-red-500 to-pink-600",
  "from-purple-500 to-violet-600",
  "from-yellow-500 to-amber-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-emerald-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
];

export const CategoryCarousel = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BackendCategory[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group categories by parent
  const categoryGroups: CategoryGroup[] = [];
  const standaloneParents: BackendCategory[] = [];
  const parentCategories = categories.filter(c => !c.parentCategory);
  
  parentCategories.forEach(parent => {
    const children = categories.filter(c => c.parentCategory?._id === parent._id);
    if (children.length > 0) {
      categoryGroups.push({ parent, children });
    } else {
      // Parent category without children - show as standalone
      standaloneParents.push(parent);
    }
  });

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleCategoryClick = (category: BackendCategory) => {
    setSelectedCategory(category._id);
    const evt = new CustomEvent("category:selected", { detail: { id: category._id, name: category.name } });
    window.dispatchEvent(evt);
    try {
      navigate(`/category/${category._id}`);
    } catch (_err) {
      // navigate might not be available in some contexts; ignore
    }
  };

  return (
    <div className="relative bg-transparent border-b border-gray-200/30">
      <div className="container mx-auto px-3 py-3">
        {loading ? (
          <div className="w-full flex justify-center py-6">
            <BalancingLoader />
          </div>
        ) : categoryGroups.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No categories available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Parent Categories with Subcategories */}
            {categoryGroups.map((group, groupIdx) => (
              <div key={group.parent._id} className="space-y-1.5">
                {/* Parent Category Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">
                    {group.parent.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryClick(group.parent)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 text-xs px-2"
                  >
                    See all <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1">
                  {group.children.map((category, index) => {
                    const isSelected = selectedCategory === category._id;
                    const gradient = categoryGradients[(groupIdx * 10 + index) % categoryGradients.length];
                    
                    return (
                      <div
                        key={category._id}
                        className={`flex flex-col items-center gap-[2px] cursor-pointer group transition-all duration-100 ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        }`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {/* Category Card */}
                        <div className="relative w-full">
                          {/* Gradient background container */}
                          <div className={`aspect-square rounded bg-gradient-to-br ${gradient} p-[0.5px] shadow-xs group-hover:shadow-sm transition-all duration-100 ${
                            isSelected ? 'ring-1 ring-blue-400' : ''
                          }`}>
                            {/* Transparent inner container for image */}
                            <div className="w-full h-full rounded-sm bg-gray-50/80 p-[1px] overflow-hidden">
                              <div className="relative w-full h-full rounded-[2px] overflow-hidden">
                                <img 
                                  src={category.imageUrl} 
                                  alt={category.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150" 
                                />
                                {/* Overlay gradient on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-100`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category name */}
                        <div className="text-center w-full">
                          <span className={`text-[8px] font-medium leading-tight block transition-colors duration-100 line-clamp-2 ${
                            isSelected 
                              ? 'text-blue-600' 
                              : 'text-gray-700 group-hover:text-blue-600'
                          }`}>
                            {category.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Standalone Parent Categories (without children) */}
            {standaloneParents.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-gray-900">Other Categories</h2>
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1">
                  {standaloneParents.map((category, index) => {
                    const isSelected = selectedCategory === category._id;
                    const gradient = categoryGradients[index % categoryGradients.length];
                    
                    return (
                      <div
                        key={category._id}
                        className={`flex flex-col items-center gap-[2px] cursor-pointer group transition-all duration-100 ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        }`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {/* Category Card */}
                        <div className="relative w-full">
                          {/* Gradient background container */}
                          <div className={`aspect-square rounded bg-gradient-to-br ${gradient} p-[0.5px] shadow-xs group-hover:shadow-sm transition-all duration-100 ${
                            isSelected ? 'ring-1 ring-blue-400' : ''
                          }`}>
                            {/* Transparent inner container for image */}
                            <div className="w-full h-full rounded-sm bg-gray-50/80 p-[1px] overflow-hidden">
                              <div className="relative w-full h-full rounded-[2px] overflow-hidden">
                                <img 
                                  src={category.imageUrl} 
                                  alt={category.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150" 
                                />
                                {/* Overlay gradient on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-100`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category name */}
                        <div className="text-center w-full">
                          <span className={`text-[8px] font-medium leading-tight block transition-colors duration-100 line-clamp-2 ${
                            isSelected 
                              ? 'text-blue-600' 
                              : 'text-gray-700 group-hover:text-blue-600'
                          }`}>
                            {category.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
