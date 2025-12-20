import { useState, useEffect, useRef } from "react";
import { Search, Package, Folder, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types/product";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

interface SearchCategory {
  id: string;
  name: string;
  imageUrl: string;
  parentCategory: { id: string; name: string } | null;
}

interface SearchResults {
  products: SearchProduct[];
  categories: SearchCategory[];
  query: string;
}

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ products: [], categories: [], query: "" });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { addToCart } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setResults({ products: [], categories: [], query: "" });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const safeResults = {
            products: Array.isArray(data.products) ? data.products : [],
            categories: Array.isArray(data.categories) ? data.categories : [],
            query: data.query || query
          };
          setResults(safeResults);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults({ products: [], categories: [], query: query });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = `/?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
      setQuery("");
      window.location.href = searchUrl;
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setIsOpen(false);
    setQuery("");
    window.location.href = `/category/${categoryId}`;
  };

  const handleProductClick = () => {
    const searchUrl = `/?q=${encodeURIComponent(query.trim())}`;
    navigate(searchUrl);
    setIsOpen(false);
    setQuery("");
    window.location.href = searchUrl;
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      const searchUrl = `/?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
      setQuery("");
      window.location.href = searchUrl;
    }
  };

  const totalResults = (results.products?.length || 0) + (results.categories?.length || 0);

  const mapSearchProductToCartProduct = (p: SearchProduct): Product => ({
    id: p.id,
    name: p.name,
    description: "",
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category || "",
    image: p.image,
    rating: 0,
    reviews: 0,
    inStock: true,
  });

  return (
    <div ref={searchRef} className="relative w-full group">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items..."
          className="pl-4 pr-32 w-full h-[50px] rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder:text-gray-400 transition-all duration-300"
        />

        {/* Helper Actions inside Search Bar */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults({ products: [], categories: [], query: "" });
                setIsOpen(false);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="h-[40px] px-6 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && totalResults > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[650px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Categories */}
          {results.categories && results.categories.length > 0 && (
            <div className="border-b border-gray-50">
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories ({results.categories.length})
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {results.categories.slice(0, 8).map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 group/item border-l-2 border-transparent hover:border-primary"
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover/item:text-primary transition-colors">
                        {category.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {results.products && results.products.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Products ({results.products.length})
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {results.products.slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 group border-b border-gray-100 last:border-0"
                  >
                    <div
                      onClick={handleProductClick}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-0.5 group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">
                            Rs.{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">
                              Rs.{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(mapSearchProductToCartProduct(product));
                      }}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All */}
          {totalResults > 10 && (
            <div className="border-t border-gray-100 p-2 bg-gray-50">
              <button
                onClick={handleViewAllResults}
                className="w-full py-2 text-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                View all {totalResults} results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};

