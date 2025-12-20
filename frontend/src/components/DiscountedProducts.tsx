import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface BackendProduct {
    _id: string;
    nameEn: string;
    nameTa?: string;
    price: number;
    originalPrice?: number;
    categoryId?: {
        nameEn: string;
    };
    imageUrl: string;
}

interface DiscountedProductsProps {
    className?: string;
}

const MiniProductCard = ({ product }: { product: BackendProduct }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 25; // Default to 25% if no original price as seen in reference

    const handleAddToCart = () => {
        // Map backend product to CartProduct expected by Context
        const cartProd = {
            id: product._id,
            name: product.nameEn,
            description: product.nameTa || product.nameEn,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.categoryId?.nameEn || 'Discount',
            image: product.imageUrl,
            rating: 0,
            reviews: 0,
            inStock: true
        };
        addToCart(cartProd, quantity);
        setQuantity(1);
    };

    return (
        <div className="bg-white rounded-lg p-3 flex flex-col h-full border border-gray-50 relative group">
            {/* Discount Ribbon */}
            <div className="absolute top-0 left-4 z-10">
                <div className="bg-[#eab308] text-white text-[10px] font-bold px-1.5 py-2 flex flex-col items-center justify-center min-w-[32px] leading-tight">
                    <span>{discountPercentage}%</span>
                    <span>Off</span>
                </div>
                <svg className="w-full h-1.5 text-[#eab308] absolute top-full left-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <polygon points="0,0 50,10 100,0" fill="currentColor" />
                </svg>
            </div>

            <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-50">
                    <img
                        src={product.imageUrl}
                        alt={product.nameEn}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                </div>

                {/* Product Content */}
                <div className="flex-1 flex flex-col justify-between h-full min-h-[96px]">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                            {product.nameEn}
                        </h4>
                        <p className="text-[11px] text-gray-500">500g Pack</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-red-600">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                                <span className="text-[11px] text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-200 rounded p-0.5 h-8">
                                <span className="px-2 text-xs font-semibold">{quantity}</span>
                                <div className="flex flex-col border-l border-gray-200 ml-1">
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="p-0 text-gray-400 hover:text-green-600 h-3.5 flex items-center justify-center"
                                    >
                                        <ChevronUp className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="p-0 text-gray-400 hover:text-green-600 h-3.5 flex items-center justify-center border-t border-gray-100"
                                    >
                                        <ChevronDown className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Add Button */}
                            <Button
                                onClick={handleAddToCart}
                                size="sm"
                                variant="outline"
                                className="h-8 border-[#629D23]/20 text-[#629D23] hover:bg-[#629D23] hover:text-white px-3 font-semibold text-[11px] flex gap-1.5"
                            >
                                Add <ShoppingCart className="w-2.5 h-2.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DiscountedProducts = ({ className }: DiscountedProductsProps) => {
    const [products, setProducts] = useState<BackendProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products?limit=4`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
                }
            } catch (error) {
                console.error("Failed to fetch discounted products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return null;

    const orangeProducts = products.slice(0, 2);
    const greenProducts = products.slice(2, 4);

    return (
        <div className={`border border-[#FBD9D9] rounded-2xl p-5 bg-[#FFF5F5]/30 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-4">

                {/* Row 1 */}
                <div className="flex flex-col lg:flex-row gap-4 h-full">
                    {/* Orange Banner */}
                    <div className="w-full lg:w-[320px] xl:w-[350px] relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4A51C] to-[#E59400] h-[160px] lg:h-auto flex flex-col justify-center p-6 text-white shrink-0">
                        <div className="relative z-10 space-y-2">
                            <h3 className="text-xl font-bold leading-tight drop-shadow-sm">
                                Alpro Organic Flavored<br />Fresh Juice
                            </h3>
                            <div className="space-y-0.5">
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Only</p>
                                <p className="text-2xl font-black leading-none">$15.00</p>
                            </div>
                        </div>
                        <img
                            src="https://html.themewant.com/ekomart/assets/images/banner/14.png"
                            alt="Juice Banner"
                            className="absolute right-[-10px] bottom-[-10px] w-36 object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {orangeProducts.map(product => (
                            <MiniProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col lg:flex-row gap-4 h-full">
                    {/* Green Banner */}
                    <div className="w-full lg:w-[320px] xl:w-[350px] relative overflow-hidden rounded-xl bg-gradient-to-br from-[#28A745] to-[#218838] h-[160px] lg:h-auto flex flex-col justify-center p-6 text-white shrink-0">
                        <div className="relative z-10 space-y-2">
                            <h3 className="text-xl font-bold leading-tight drop-shadow-sm">
                                Alpro Organic Flavored<br />Fresh Juice
                            </h3>
                            <div className="space-y-0.5">
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Only</p>
                                <p className="text-2xl font-black leading-none">$15.00</p>
                            </div>
                        </div>
                        <img
                            src="https://html.themewant.com/ekomart/assets/images/banner/33.png"
                            alt="Food Banner"
                            className="absolute right-[-10px] bottom-[-10px] w-36 object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {greenProducts.map(product => (
                            <MiniProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
