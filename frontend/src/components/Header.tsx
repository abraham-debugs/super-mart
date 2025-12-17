import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
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

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Plan", href: "/subscription-plans" },
    { name: "About Us", href: "/about-us" },
    { name: "Shop", href: "/#shop" },
  ];

  return (
    <>
      {/* Dynamic Island Navbar */}
      <header className="fixed top-0 left-0  -mb-5  right-0 z-50 w-full transition-all duration-500">
        <div 
          className={`
            relative mx-auto transition-all duration-500 ease-out
            ${isScrolled 
              ? 'bg-orange-400 shadow-lg py-3' 
              : 'bg-orange-400 py-4'
            }
          `}
        >
          
          <div className="relative flex items-center justify-between px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                <div className="relative">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-500 transition-all duration-300 group-hover:scale-110 shadow-md">
                    <span className="text-orange-100 font-bold text-base sm:text-lg lg:text-xl">M</span>
                  </div>
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  MDMart
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-2 text-sm font-semibold text-gray-900 uppercase transition-all duration-200 hover:text-gray-700"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <div className="hidden md:block w-40 lg:w-64 xl:w-80">
                <SearchBar />
              </div>

              {user ? (
                <>
                  <Button
                    size="icon"
                    className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg bg-white/90 hover:bg-white text-gray-900 transition-all duration-200 hover:scale-110"
                    onClick={() => navigate('/profile')}
                    title="Profile"
                  >
                    <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="hidden sm:flex rounded-lg bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-200 hover:bg-gray-50"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              )}

              <Button
                size="icon"
                className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg bg-white/90 hover:bg-white text-gray-900 transition-all duration-200 hover:scale-110"
                onClick={() => setIsCartOpen(true)}
                title="Cart"
              >
                <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 border-orange-400 bg-red-500 text-white p-0 text-[10px] sm:text-xs font-bold shadow-lg">
                    {getCartCount() > 9 ? '9+' : getCartCount()}
                  </Badge>
                )}
              </Button>

              <Button
                size="icon"
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white/90 hover:bg-white text-gray-900 transition-all duration-200 hover:scale-110"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Menu"
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className={`
              lg:hidden mx-auto transition-all duration-500 ease-out overflow-hidden
              bg-orange-400 shadow-lg
              ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center gap-2 px-2 sm:px-4">
                <div className="flex-1">
                  <SearchBar />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-1.5 sm:space-y-2 border-t border-orange-500 pt-3 sm:pt-4 px-2 sm:px-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-900 uppercase rounded-lg hover:bg-orange-300 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="px-4 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-orange-300 transition-all duration-200 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); setIsMenuOpen(false); }}
                      className="px-4 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-orange-300 transition-all duration-200 text-left w-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-orange-300 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 text-base font-semibold bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 text-center"
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
    </>
  );
};
