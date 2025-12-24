import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

type Category = {
    _id: string;
    name: string;
    imageUrl: string;
    showInNavbar?: boolean;
};

export const MainCategories = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const { data: categories = [], isLoading: loading } = useQuery({
        queryKey: ['main-categories'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/admin/categories`);
            if (res.ok) {
                const data = await res.json();
                // Filter to show only categories marked as Main/Navbar
                return data.filter((c: Category) => c.showInNavbar);
            }
            return [];
        },
        staleTime: 1000 * 60 * 30, // 30 mins
    });

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading || categories.length === 0) return null;

    return (
        <section className="py-10 bg-white relative group">
            <div className="container mx-auto my-5 px-4 relative">

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((category) => (
                        <div
                            key={category._id}
                            onClick={() => navigate(`/shop?category=${encodeURIComponent(category.name)}`)}
                            className="flex-shrink-0 w-[120px] md:w-[140px] flex flex-col items-center gap-3 cursor-pointer group/item snap-start"
                        >
                            {/* Card with image */}
                            <div className="w-full aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden p-3 transition-all duration-300 group-hover/item:shadow-md group-hover/item:-translate-y-1">
                                <div className="w-full h-full relative">
                                    <img
                                        src={category.imageUrl || "https://placehold.co/100x100?text=No+Image"}
                                        alt={category.name}
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Category Name */}
                            <h3 className="text-[13px] md:text-[15px] font-bold text-gray-800 text-center leading-tight line-clamp-2 px-1 group-hover/item:text-primary transition-colors">
                                {category.name}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows (Desktop Only) */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-12 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-gray-100 z-10 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                )}

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-12 w-10 h-10 bg-black shadow-xl rounded-full flex items-center justify-center z-10 hover:bg-gray-900 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};
