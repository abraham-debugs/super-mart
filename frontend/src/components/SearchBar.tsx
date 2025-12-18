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
          // Ensure the data has the expected structure
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
    // Navigate to search results page and force refresh
    const searchUrl = `/?q=${encodeURIComponent(query.trim())}`;
    navigate(searchUrl);
    setIsOpen(false);
    setQuery("");
    // Force page refresh to show results
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
      <form onSubmit={handleSearch}>
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 transition-colors duration-200 ${
          query ? 'text-orange-600' : 'text-white/60 group-hover:text-white'
        }`} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for groceries & essentials..."
          className={`pl-12 pr-10 w-full h-12 rounded-2xl border-2 transition-all duration-300 ${
            query 
              ? 'border-orange-400/60 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 bg-white/95 backdrop-blur-md text-gray-900 placeholder:text-gray-400 shadow-lg shadow-orange-500/10' 
              : 'border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 hover:border-white/30'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults({ products: [], categories: [], query: "" });
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 z-10 transition-colors duration-200 hover:bg-orange-50 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          query 
            ? 'bg-gradient-to-r from-orange-500/5 via-red-500/5 to-blue-500/5 opacity-100' 
            : 'bg-white/5 opacity-0 group-hover:opacity-100'
        }`}></div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && totalResults > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[650px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Categories */}
          {results.categories && results.categories.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-50 via-red-50 to-blue-50 flex items-center gap-2">
                <Folder className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase">
                  Categories ({results.categories.length})
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {results.categories.slice(0, 8).map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:via-red-50 hover:to-blue-50 cursor-pointer transition-all duration-200 flex items-center gap-3 group/item"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-orange-600 transition-colors">
                        {category.name}
                      </p>
                      {category.parentCategory && (
                        <p className="text-xs text-gray-500 truncate">
                          in {category.parentCategory.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {results.products && results.products.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gradient-to-r from-orange-50 via-red-50 to-blue-50 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase">
                  Products ({results.products.length})
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {results.products.slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:via-red-50 hover:to-blue-50 cursor-pointer transition-all duration-200 flex items-center gap-3 group"
                  >
                    <div
                      onClick={handleProductClick}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 group-hover:border-orange-400 group-hover:shadow-md transition-all duration-200">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                            Rs.{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                Rs.{product.originalPrice}
                              </span>
                              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded font-semibold">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        {product.category && (
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            in {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(mapSearchProductToCartProduct(product));
                      }}
                      className="flex items-center justify-center h-9 w-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Results */}
          {totalResults > 10 && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-orange-50 via-red-50 to-blue-50">
              <button
                onClick={handleViewAllResults}
                className="w-full px-4 py-4 text-center font-medium text-gray-900 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 group"
              >
                <span>View all {totalResults} results for "{query}"</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Footer showing result count */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gradient-to-r from-orange-50/50 via-red-50/50 to-blue-50/50">
            <p className="text-xs text-gray-600 text-center">
              {totalResults === 1 ? '1 result' : `${totalResults} results`} found
              {totalResults > 10 && ' • Showing top 10'}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && totalResults === 0 && !isLoading && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 px-4 py-6 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-gray-600 text-sm">
            No results found for "<span className="font-semibold text-orange-600">"{query}"</span>"
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Try different keywords
          </p>
        </div>
      )}
    </div>
  );
};

