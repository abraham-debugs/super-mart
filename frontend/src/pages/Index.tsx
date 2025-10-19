import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { featuredProducts, bestSellers, products } from "@/data/products";
import type { Product } from "@/types/product";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const location = useLocation();

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
          setAllProducts(Array.isArray(data) ? data : []);
        } catch (e) {
          console.warn("Search error:", e);
          setAllProducts([]);
        }
      })();
    } else {
      // if no query and no category selection, show all
      if (!selectedCategory) {
        setAllProducts(products);
      }
      setSearchQuery("");
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-pattern opacity-30 pointer-events-none"></div>
      
      <Header />
      
      <main className="relative z-10">
        {/* Category Carousel */}
        <CategoryCarousel />
         
        {/* Hero Section */}
        <Hero />
         {/* Features */}
         <Features />
        
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
        
        {/* All Products (filtered by selected category or search) */}
        <section className="py-12 lg:py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-accent/5"></div>
          <ProductGrid 
            title={searchQuery ? `Search: ${searchQuery}` : (selectedCategory ? `Category: ${selectedCategory}` : "All Groceries & Essentials")}
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
