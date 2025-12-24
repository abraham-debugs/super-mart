import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Features } from "@/components/Features";
import RecommendedProducts from "@/components/RecommendedProducts";
import type { Product } from "@/types/product";
import { AdsCarousel } from "@/components/AdsCarousel";
import { DiscountedProducts } from "@/components/DiscountedProducts";
import { MainCategories } from "@/components/MainCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface SearchCategory {
  id: string;
  name: string;
  imageUrl: string;
  parentCategory: { id: string; name: string } | null;
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    if (q) {
      setSearchQuery(q);
      setSelectedCategory(null);
    } else {
      setSearchQuery("");
      // When clearing search via URL, we don't strictly reset selectedCategory here
      // to avoid jumping if the user was just navigating.
    }
  }, [location.search]);

  // Handle Custom Event for Category Selection
  useEffect(() => {
    const onCategory = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string; name: string };
      setSelectedCategory(detail.name);
      setSearchQuery(""); // Clear search query when a category is selected
    };

    window.addEventListener("category:selected", onCategory as EventListener);
    return () => window.removeEventListener("category:selected", onCategory as EventListener);
  }, []);

  // Fetch Fresh Picks with Caching
  const { data: freshPicks = [] } = useQuery({
    queryKey: ['fresh-picks'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/products/fresh-picks`);
      if (!res.ok) throw new Error("Failed to load fresh picks");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch Most Loved with Caching
  const { data: mostLoved = [] } = useQuery({
    queryKey: ['most-loved'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/products/most-loved`);
      if (!res.ok) throw new Error("Failed to load most loved");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Main Products (Search / Category / All) with Caching
  const { data: mainData = { products: [], categories: [] }, isLoading: isMainLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        let products: Product[] = [];
        let categories: SearchCategory[] = [];

        if (data && typeof data === 'object') {
          products = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
          categories = Array.isArray(data.categories) ? data.categories : [];
        }
        return { products, categories };
      } else {
        let url = `${API_BASE}/api/products`;
        if (selectedCategory) {
          url = `${API_BASE}/api/products?category=${encodeURIComponent(selectedCategory)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const products = Array.isArray(data) ? data : [];
        return { products, categories: [] };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev, // Keep previous data visible while fetching new
  });

  const { products: allProducts, categories: searchCategories } = mainData;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-pattern opacity-30 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Category Carousel - Note: Hero includes the Carousel logically in some designs, but here it's separate? 
            Original had Hero, then MainCategories, then CategoryCarousel. Keeping order. */}

        {/* Hero Section */}
        <Hero />

        {/* Main Top Categories */}
        <MainCategories />

        {/* Category Carousel */}
        <CategoryCarousel />

        {/* Personalized Recommendations */}
        <RecommendedProducts limit={10} />

        {/* Discounted Products Section */}
        <section className="py-8 lg:py-10">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Products with Discounts</h2>
            <DiscountedProducts />
          </div>
        </section>

        {/* Featured Products - Fresh Picks */}
        {freshPicks.length > 0 && (
          <section className="py-12 lg:py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"></div>
            <ProductGrid
              title="Fresh Picks for You"
              showFilters={false}
              productsToShow={freshPicks}
            />
          </section>
        )}

        <Features />

        {/* Most Loved Items */}
        {mostLoved.length > 0 && (
          <section className="py-12 lg:py-16 bg-gradient-to-br from-muted/30 to-muted/10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5"></div>
            <ProductGrid
              title="Most Loved Items"
              showFilters={false}
              productsToShow={mostLoved}
            />
          </section>
        )}

        {/* Ads Carousel */}
        <section className="py-10">
          <AdsCarousel />
        </section>

        {/* Search Results - Categories */}
        {searchQuery && searchCategories.length > 0 && (
          <section className="py-8 lg:py-12 relative">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                  Categories matching "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">Found {searchCategories.length} matching categories</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => {
                      // Navigate to category page
                      navigate(`/category/${category.id}`);
                    }}
                    className="group cursor-pointer bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {category.name}
                      </h3>
                      {category.parentCategory && (
                        <p className="text-xs text-gray-500 mt-1">
                          in {category.parentCategory.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products (filtered by selected category or search) */}
        <section className="py-12 lg:py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-accent/5"></div>
          <ProductGrid
            title={
              searchQuery
                ? `Products matching "${searchQuery}"` + (allProducts.length > 0 ? ` (${allProducts.length})` : '')
                : (selectedCategory ? `Category: ${selectedCategory}` : "All Groceries & Essentials")
            }
            productsToShow={allProducts}
          />
        </section>

        {/* How It Works Section */}
        <HowItWorks />
      </div>
    </div>
  );
};

export default Index;
