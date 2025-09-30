import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Footer } from "@/components/Footer";
import { featuredProducts, bestSellers } from "@/data/products";

const Index = () => {
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
        
        {/* All Products */}
        <section className="py-12 lg:py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-accent/5"></div>
          <ProductGrid title="All Groceries & Essentials" />
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
