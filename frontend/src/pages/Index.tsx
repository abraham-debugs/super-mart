import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";

import RecommendedProducts from "@/components/RecommendedProducts";
import { featuredProducts, bestSellers, products } from "@/data/products";
import type { Product } from "@/types/product";
import { useLocation, useNavigate } from "react-router-dom";

interface SearchCategory {
  id: string;
  name: string;
  imageUrl: string;
  parentCategory: { id: string; name: string } | null;
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchCategories, setSearchCategories] = useState<SearchCategory[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Normalize strings to improve matching between category names/ids and product.category
    const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    const onCategory = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string; name: string };
      setSelectedCategory(detail.name);

      const targetId = normalize(detail.id || "");
      const targetName = normalize(detail.name || "");

      const filtered = products.filter((p) => {
        const prodCat = normalize(p.category || "");
        // match if product category contains the category name or id, or vice versa
        return (
          (prodCat && targetName && prodCat.includes(targetName)) ||
          (prodCat && targetId && prodCat.includes(targetId)) ||
          (targetName && targetName.includes(prodCat))
        );
      });

      setAllProducts(filtered.length > 0 ? filtered : products);
      setSearchQuery("");
    };

    window.addEventListener("category:selected", onCategory as EventListener);
    return () => window.removeEventListener("category:selected", onCategory as EventListener);
  }, []);

  // Apply URL query (?q=) based search from DB; re-run when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    if (q) {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      setSearchQuery(q);
      setSelectedCategory(null);
      // fetch from backend search
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(q)}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          
          // Handle new response format with products and categories
          if (data && typeof data === 'object') {
            const prods = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
            const cats = Array.isArray(data.categories) ? data.categories : [];
            
            setAllProducts(prods);
            setSearchCategories(cats);
          } else {
            setAllProducts([]);
            setSearchCategories([]);
          }
        } catch (e) {
          console.warn("Search error:", e);
          setAllProducts([]);
          setSearchCategories([]);
        }
      })();
    } else {
      // if no query and no category selection, show all
      if (!selectedCategory) {
        setAllProducts(products);
      }
      setSearchQuery("");
      setSearchCategories([]);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-pattern opacity-30 pointer-events-none"></div>
      
      <Header />
      
      <main className="relative z-10">
        {/* Category Carousel */}
         
        {/* Hero Section */}
        <Hero />
        <CategoryCarousel />

         {/* Features */}
         <Features />

        {/* Personalized Recommendations */}
        <RecommendedProducts limit={10} />
        
        {/* Featured Products */}
        <section className="py-12 lg:py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"></div>
          <ProductGrid 
            title="Fresh Picks for You" 
            showFilters={false} 
            productsToShow={featuredProducts}
          />
        </section>
        
       

        {/* Best Sellers */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-muted/30 to-muted/10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5"></div>
          <ProductGrid 
            title="Most Loved Items" 
            showFilters={false} 
            productsToShow={bestSellers}
          />
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
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
