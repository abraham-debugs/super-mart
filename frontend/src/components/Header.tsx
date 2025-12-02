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
    { name: "About Us", href: "/#about" },
    { name: "Shop", href: "/#shop" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 bg-[#f7aa29]/95 backdrop-blur-md shadow-[0_8px_24px_rgba(247,170,41,0.25)] border-none`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/70 ring-2  text-white ring-white/60 transition-all duration-300 group-hover:scale-105">
                    <span className="text-[#132c5f] font-bold text-white text-xl">M</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[#132c5f] group-hover:scale-105 transition-transform duration-300">
                  MDMart
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#1c2f61] rounded-full transition-colors duration-200 hover:bg-white/40"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block w-64 xl:w-80">
                <div className="rounded-full bg-white/70 px-4 py-1 shadow-inner shadow-white/40">
                  <SearchBar />
                </div>
              </div>

              {user ? (
                <>
                  <Button
                    size="icon"
                    className="hidden sm:flex h-10 w-10 rounded-full bg-[#f7aa29] text-[#1c2a52] shadow-[0_10px_20px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                    onClick={() => navigate('/profile')}
                    title="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <Button
                      size="sm"
                      className="hidden lg:flex rounded-full bg-[#f7aa29] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#1c2a52] shadow-[0_10px_20px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                      onClick={() => navigate(user.role === "superadmin" ? '/superadmin' : '/admin')}
                    >
                      Admin
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  className="hidden sm:flex rounded-full bg-[#f7aa29] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#1c2a52] shadow-[0_10px_20px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              )}

              <Button
                size="icon"
                className="relative h-10 w-10 rounded-full bg-[#f7aa29] text-[#1c2a52] shadow-[0_10px_20px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                onClick={() => setIsCartOpen(true)}
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-0 bg-primary p-0 text-xs text-primary-foreground shadow-lg">
                    {getCartCount()}
                  </Badge>
                )}
              </Button>

              <Button
                size="icon"
                className="md:hidden h-10 w-10 rounded-full bg-[#f7aa29] text-[#1c2a52] shadow-[0_10px_20px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/50 bg-[#f7aa29]/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-full bg-white/80 px-4 py-1">
                  <SearchBar />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-2 border-t border-white/50 pt-4">
                  {navigation.map((item) => (
                  <Link
                      key={item.name}
                    to={item.href}
                    className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg hover:bg-white/40 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg hover:bg-white/40 transition-all duration-200 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); setIsMenuOpen(false); }}
                      className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg hover:bg-white/40 transition-all duration-200 text-left w-full"
                    >
                      Logout
                    </button>
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        to={user.role === "superadmin" ? '/superadmin' : '/admin'}
                        className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg hover:bg-white/40 transition-all duration-200"
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
                      className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg hover:bg-white/40 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#132c5f] rounded-lg bg-white/80 hover:bg-white transition-all duration-200 text-center"
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
