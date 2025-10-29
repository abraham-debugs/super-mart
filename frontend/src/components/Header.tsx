import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, Camera, Heart, Bookmark, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "./CartSheet";
import { Link, useNavigate } from "react-router-dom";
import VoiceSearch from "@/components/VoiceSearch";
import ImageSearch from "@/components/ImageSearch";
import { SearchBar } from "@/components/SearchBar";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [navbarCategories, setNavbarCategories] = useState<Array<{ id: string; name: string }>>([]);
  
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    async function loadNavbarCategories() {
      try {
        const res = await fetch(`${API_BASE}/api/products/navbar-categories`);
        if (res.ok) {
          const data = await res.json();
          setNavbarCategories(data || []);
        }
      } catch (err) {
        console.warn("Failed to load navbar categories:", err);
      }
    }
    loadNavbarCategories();
  }, []);
  
  const navigation = navbarCategories.length > 0 
    ? navbarCategories.map(cat => ({ 
        name: cat.name, 
        href: `/category/${cat.id}` 
      }))
    : [];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-slate-800/50" 
          : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  MDMart
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Heart className="h-4 w-4" />
                 
                </Link>
                <Link
                  to="/saved"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Bookmark className="h-4 w-4" />
                  
                </Link>
                <Link
                  to="/subscription-plans"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Crown className="h-4 w-4" />
                  Plans
                </Link>
              </nav>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-6">
              <SearchBar />
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2">
              {/* Search Icon - Mobile/Tablet */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-blue-50 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Voice & Image Search - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <VoiceSearch onSearch={(q) => {
                  if (q.trim()) {
                    window.location.href = `/?q=${encodeURIComponent(q.trim())}`;
                  }
                }} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsImageSearchOpen(true)}
                  className="hover:bg-blue-50 dark:hover:bg-slate-800"
                  title="Search by image"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>

              <ThemeToggle />

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-blue-50 dark:hover:bg-slate-800"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                    {getCartCount()}
                  </Badge>
                )}
              </Button>

              {/* Auth Buttons */}
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden sm:flex hover:bg-blue-50 dark:hover:bg-slate-800"
                    onClick={() => navigate('/profile')}
                    title="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden sm:flex hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    onClick={() => { logout(); navigate('/login'); }}
                  >
                    Logout
                  </Button>
                  <div className="sm:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden sm:flex hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden hover:bg-blue-50 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </>
              )}

              {/* Admin Link - Desktop */}
              {(user?.role === "admin" || user?.role === "superadmin") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden lg:flex hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                  onClick={() => navigate(user.role === "superadmin" ? '/superadmin' : '/admin')}
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar />
                </div>
                <VoiceSearch onSearch={(q) => {
                  if (q.trim()) {
                    window.location.href = `/?q=${encodeURIComponent(q.trim())}`;
                    setIsMenuOpen(false);
                  }
                }} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsImageSearchOpen(true)}
                  className="hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-2 border-t border-gray-200 dark:border-slate-800 pt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                </Link>
                <Link
                  to="/saved"
                  className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bookmark className="h-5 w-5" />
                  Saved
                </Link>
                <Link
                  to="/subscription-plans"
                  className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Crown className="h-5 w-5" />
                  Subscription Plans
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); setIsMenuOpen(false); }}
                      className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-left w-full"
                    >
                      Logout
                    </button>
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        to={user.role === "superadmin" ? '/superadmin' : '/admin'}
                        className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 text-base font-medium text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ImageSearch open={isImageSearchOpen} onOpenChange={setIsImageSearchOpen} />
    </>
  );
};
