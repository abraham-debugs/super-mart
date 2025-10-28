import { useEffect, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./ProductCard";
import { products } from "@/data/products";
import { Product } from "@/types/product";

interface ProductGridProps {
  title?: string;
  showFilters?: boolean;
  productsToShow?: Product[];
}

export const ProductGrid = ({ 
  title = "All Products", 
  showFilters = true, 
  productsToShow = products 
}: ProductGridProps) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsToShow);
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");

  // Apply filters and sorting
  const handleFilter = () => {
    let result = [...productsToShow];

    // Search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under100":
          result = result.filter(product => product.price < 100);
          break;
        case "100to500":
          result = result.filter(product => product.price >= 100 && product.price <= 500);
          break;
        case "over500":
          result = result.filter(product => product.price > 500);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(result);
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    handleFilter();
  }, [searchTerm, priceRange, sortBy, productsToShow]);

  // Keep local list in sync when incoming products change
  useEffect(() => {
    setFilteredProducts(productsToShow);
  }, [productsToShow]);

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">{title}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Discover our curated collection of premium products with unbeatable quality and prices.
          </p>
        </div>

        {/* Filters and Sort */}
        {showFilters && (
          <div className="mb-8 p-4 bg-card rounded-lg border shadow-card">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:max-w-md">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilter();
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Price Filter */}
                <Select value={priceRange} onValueChange={(value) => {
                  setPriceRange(value);
                  handleFilter();
                }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under100">Under $100</SelectItem>
                    <SelectItem value="100to500">$100 - $500</SelectItem>
                    <SelectItem value="over500">Over $500</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value);
                  handleFilter();
                }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setPriceRange("all");
                  setSortBy("default");
                  setFilteredProducts(productsToShow);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredProducts.length > 0 && filteredProducts.length >= 8 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
