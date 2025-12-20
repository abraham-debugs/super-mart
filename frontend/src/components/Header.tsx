import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, Search, Heart, ChevronDown, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "./CartSheet";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { getCartCount, getCartTotal } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about-us" },
    { name: "Shop", href: "/#shop" },

    { name: "Mega Menu", href: "/mega-menu" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="w-full bg-white z-50">

        {/* 1. TOP UTILITY BAR */}
        <div className="hidden md:flex justify-between items-center py-2 px-4 lg:px-8 border-b text-xs text-gray-500 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <span>About Us</span>
            <span>My Account</span>
            <span>Wishlist</span>
            <span className="border-l pl-4 border-gray-300">We deliver into you...</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-primary transition-colors">English <ChevronDown className="inline h-3 w-3" /></span>
            <span className="cursor-pointer hover:text-primary transition-colors">USD <ChevronDown className="inline h-3 w-3" /></span>
            <span className="border-l pl-4 border-gray-300">Order Tracking</span>
          </div>
        </div>

        {/* 2. MAIN HEADER (Logo, Search, Actions) */}
        <div className="py-4 lg:py-6 px-4 lg:px-8 border-b border-gray-100">
          <div className="container mx-auto flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary transition-colors duration-300">
                <span className="text-primary group-hover:text-white font-bold text-xl">MD</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                MDmart
              </span>
            </Link>

            {/* Desktop Search Bar - CENTER */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto items-center gap-2">
              <div className="w-full">
                <SearchBar />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* User Links */}
              <div className="hidden sm:flex flex-col items-end text-xs mr-2">
                <span className="text-gray-500">Welcome</span>
                {user ? (
                  <Link to="/profile" className="font-bold text-gray-900 hover:text-primary">My Account</Link>
                ) : (
                  <div className="flex gap-1">
                    <Link to="/login" className="font-bold text-gray-900 hover:text-primary">Login</Link>
                    <span>/</span>
                    <Link to="/register" className="font-bold text-gray-900 hover:text-primary">Register</Link>
                  </div>
                )}
              </div>

              <Button size="icon" variant="ghost" className="relative hover:text-primary" onClick={() => navigate('/wishlist')}>
                <Heart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">0</span>
              </Button>

              <Button size="icon" variant="ghost" className="relative hover:text-primary" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-white text-[10px] font-bold">
                  {getCartCount()}
                </span>
                <div className="hidden xl:flex flex-col items-start ml-2 pl-2 text-xs">
                  <span className="text-gray-400 font-normal">Rs. {getCartTotal().toLocaleString()}</span>
                </div>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-4 lg:hidden">
            <SearchBar />
          </div>
        </div>

        {/* 3. NAVIGATION BAR (Sticky) */}
        <div className={`hidden lg:block border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 bg-white shadow-md z-50 animate-in slide-in-from-top-2' : 'bg-white'}`}>
          <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-14">
            {/* Categories Dropdown Button */}
            <div className="relative group h-full">
              <div className="w-64 bg-primary text-white h-full flex items-center px-4 gap-2 cursor-pointer font-semibold uppercase text-sm tracking-wide transition-colors hover:bg-primary-dark">
                <Menu className="h-5 w-5" />
                <span>All Categories</span>
                <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 group-hover:rotate-180" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-xl overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200 z-50">
                <ul className="py-2">
                  {[
                    "Fruits & Vegetables",
                    "Dairy & Breakfast",
                    "Meat & Seafood",
                    "Bakery & Biscuits",
                    "Beverages",
                    "Snacks & Munchies",
                    "Personal Care",
                    "Cleaning Essentials",
                    "Baby Care",
                    "Pet Care"
                  ].map((category, idx) => (
                    <li key={idx}>
                      <Link
                        to={`/category/${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                        className="block px-6 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors flex items-center justify-between group/item"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Nav Links */}
            <nav className="flex items-center gap-8 text-sm font-medium uppercase tracking-wide">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="hover:text-primary transition-colors flex items-center gap-1 py-4 border-b-2 border-transparent hover:border-primary"
                >
                  {item.name}
                  {(item.name === "Home" || item.name === "Shop" || item.name === "Mega Menu" || item.name === "Blog") && <ChevronDown className="h-3 w-3 opacity-50" />}
                </Link>
              ))}
            </nav>

            {/* Right CTA & Actions (Visible in sticky) */}
            <div className="flex items-center gap-4">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 text-xs font-bold uppercase tracking-wider">
                Get 30% Discount Now
              </Button>

              {isScrolled && (
                <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                  <Button size="icon" variant="ghost" className="relative h-9 w-9 hover:text-primary" onClick={() => navigate('/wishlist')}>
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="relative h-9 w-9 hover:text-primary" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-white text-[10px] font-bold">
                      {getCartCount()}
                    </span>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-primary" onClick={() => navigate(user ? '/profile' : '/login')}>
                    <User className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white pt-20 px-4 overflow-y-auto">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-lg font-semibold py-2 border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
