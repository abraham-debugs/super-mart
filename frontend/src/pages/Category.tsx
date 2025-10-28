import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { BalancingLoader } from "@/components/BalancingLoader";
import type { Product } from "@/types/product";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

const mapBackendToProduct = (p: any): Product => ({
  id: p._id,
  name: p.nameEn || p.name || "",
  description: p.description || "",
  price: Number(p.price || 0),
  originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  category: p.categoryName || p.category || "",
  image: p.imageUrl || p.image || "",
  rating: Number(p.rating || 0),
  reviews: Number(p.reviews || 0),
  inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
  discount: p.discount ? Number(p.discount) : undefined,
  isNew: Boolean(p.isNew),
  isBestSeller: Boolean(p.isBestSeller),
});

const Category = () => {
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch category details first
        const categoryRes = await fetch(`${API_BASE}/api/admin/categories`);
        if (categoryRes.ok) {
          const categories = await categoryRes.json();
          const currentCategory = Array.isArray(categories) 
            ? categories.find((cat: any) => cat._id === id)
            : null;
          
          if (currentCategory) {
            setCategoryName(currentCategory.nameEn || currentCategory.name || id);
          }
        }

        // Then fetch products for this category
        const res = await fetch(`${API_BASE}/api/admin/products?categoryId=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        const mapped: Product[] = Array.isArray(data) ? data.map(mapBackendToProduct) : [];
        setCategoryProducts(mapped);

        // Fallback: derive category name from products if not already set
        if (!categoryName && mapped.length > 0) {
          setCategoryName(mapped[0].category);
        }
      } catch (err: any) {
        setError(err.message || String(err));
        setCategoryProducts([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-pattern opacity-30 pointer-events-none"></div>
      <Header />

      <main className="relative z-10">
        {/* Enhanced Category Header */}
        <section className="bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/30 border-b border-gray-200/50">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:gap-3 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {loading ? "Loading..." : (categoryName || "Category")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading ? "Please wait..." : `${categoryProducts.length} ${categoryProducts.length === 1 ? 'product' : 'products'} available`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            {loading && (
              <div className="py-16">
                <BalancingLoader />
                <p className="text-center text-gray-600 font-medium mt-4">Loading products...</p>
              </div>
            )}

            {error && (
              <div className="py-16">
                <div className="max-w-md mx-auto text-center">
                  <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go back home
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && categoryProducts.length === 0 && (
              <div className="py-16">
                <div className="max-w-md mx-auto text-center">
                  <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">We couldn't find any products in this category. Check back soon!</p>
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Browse all categories
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && categoryProducts.length > 0 && (
              <ProductGrid
                title={categoryName || "Products"}
                productsToShow={categoryProducts}
                showFilters={false}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
