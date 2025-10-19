import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
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
        const res = await fetch(`${API_BASE}/api/admin/products?categoryId=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        const mapped: Product[] = Array.isArray(data) ? data.map(mapBackendToProduct) : [];
        setCategoryProducts(mapped);

        // derive category name if possible
        if (mapped.length > 0) setCategoryName(mapped[0].category);
        else setCategoryName(id.replace(/[-_]/g, " "));
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
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link to="/" className="text-sm text-primary hover:underline">&larr; Back to Home</Link>
            </div>

            {loading && (
              <div className="py-16 text-center">Loading products...</div>
            )}

            {error && (
              <div className="py-16 text-center text-destructive">Error: {error}</div>
            )}

            {!loading && !error && (
              <ProductGrid
                title={categoryName ? `Category: ${categoryName}` : `Category: ${id}`}
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
