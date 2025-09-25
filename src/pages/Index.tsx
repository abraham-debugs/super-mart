import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { featuredProducts, bestSellers } from "@/data/products";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Products */}
        <ProductGrid 
          title="Fresh Picks for You" 
          showFilters={false} 
          productsToShow={featuredProducts}
        />
        
        {/* Best Sellers */}
        <section className="py-12 lg:py-16 bg-muted/50">
          <ProductGrid 
            title="Most Loved Items" 
            showFilters={false} 
            productsToShow={bestSellers}
          />
        </section>
        
        {/* All Products */}
        <ProductGrid title="All Groceries & Essentials" />
      </main>
    </div>
  );
};

export default Index;
