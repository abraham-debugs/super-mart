import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Grid, List, ChevronUp, RotateCcw, Loader2 } from "lucide-react";
import { Product, Category } from "@/types/product";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Shop = () => {
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("latest");

    // Handle initial filters from URL
    useEffect(() => {
        const cat = searchParams.get("category");
        const q = searchParams.get("q");

        setSelectedCategories(cat ? [cat] : []);
        setSearchQuery(q || "");
    }, [searchParams]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch products
                const productsRes = await fetch(`${API_BASE}/api/products`);
                const productsData = await productsRes.json();

                // Fetch categories from admin endpoint since it returns all details
                const categoriesRes = await fetch(`${API_BASE}/api/admin/categories`);
                const categoriesData = await categoriesRes.json();

                setProducts(Array.isArray(productsData) ? productsData : []);
                setCategories(Array.isArray(categoriesData) ? categoriesData.map((c: any) => ({
                    id: c._id,
                    name: c.nameEn || c.name,
                    icon: c.imageUrl || ""
                })) : []);

                // Set initial price range based on products
                if (productsData.length > 0) {
                    const prices = productsData.map((p: any) => p.price);
                    setPriceRange([0, Math.ceil(Math.max(...prices))]);
                }
            } catch (error) {
                console.error("Failed to fetch shop data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryChange = (categoryName: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const filteredProducts = useMemo(() => {
        let result = products.filter(p =>
            p.price >= priceRange[0] &&
            p.price <= priceRange[1] &&
            (selectedCategories.length === 0 || selectedCategories.some(cat =>
                p.category.toLowerCase().includes(cat.toLowerCase())
            )) &&
            (searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Sorting
        if (sortBy === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.price - a.price);
        }
        // "latest" is default from backend sort

        return result;
    }, [products, priceRange, selectedCategories, sortBy, searchQuery]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading items...</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="w-full lg:w-1/4 space-y-8">
                            {/* Price Filter Widget */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Widget Price Filter</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Min price</label>
                                            <Input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Max price</label>
                                            <Input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                    <Slider
                                        defaultValue={[0, 1000]}
                                        max={2000}
                                        step={1}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="py-4"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Price: <span className="font-bold text-gray-900">Rs.{priceRange[0]} — Rs.{priceRange[1]}</span>
                                        </span>
                                        <Button
                                            className="bg-[#6b9e23] hover:bg-[#5a861d] text-white px-6 h-10"
                                            onClick={() => { }} // Price filtering is reactive via useMemo
                                        >
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Categories Widget */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Product Categories</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-3 group cursor-pointer">
                                            <Checkbox
                                                id={category.id}
                                                checked={selectedCategories.includes(category.name)}
                                                onCheckedChange={() => handleCategoryChange(category.name)}
                                                className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <label
                                                htmlFor={category.id}
                                                className="text-sm text-gray-600 group-hover:text-primary transition-colors cursor-pointer flex-1"
                                            >
                                                {category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="w-full lg:w-3/4 space-y-6">
                            {/* Top Toolbar */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-medium text-gray-900">1–{filteredProducts.length}</span> of <span className="font-medium text-gray-900">{filteredProducts.length}</span> results
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Sort:</span>
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="w-[180px] h-10 border-none bg-gray-50/50">
                                                    <SelectValue placeholder="Short By Latest" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="latest">Short By Latest</SelectItem>
                                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-10 w-10 rounded-none ${viewMode === "grid" ? "bg-primary text-white hover:bg-primary/90" : "bg-gray-50"}`}
                                                onClick={() => setViewMode("grid")}
                                            >
                                                <Grid className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-10 w-10 rounded-none ${viewMode === "list" ? "bg-primary text-white hover:bg-primary/90" : "bg-gray-50"}`}
                                                onClick={() => setViewMode("list")}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Dropdowns Row */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <Select onValueChange={(val) => val === "all" ? setSelectedCategories([]) : setSelectedCategories([val])}>
                                        <SelectTrigger className="w-[160px] h-10 border-gray-100 bg-gray-50/50">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <Button
                                            variant="ghost"
                                            className="h-10 px-4 text-gray-600 hover:text-gray-900 gap-2"
                                            onClick={() => {
                                                setPriceRange([0, 1000]);
                                                setSelectedCategories([]);
                                                setSortBy("latest");
                                            }}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Reset Filter
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {filteredProducts.length > 0 ? (
                                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
                                    {filteredProducts.map((product) => (
                                        <div key={product.id}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white py-20 text-center rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">No products found matching your criteria.</p>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {/* Back to Top */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 p-3 bg-white text-gray-400 border border-gray-100 rounded-full shadow-lg hover:text-primary transition-all z-50 group"
            >
                <ChevronUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    );
};

export default Shop;
