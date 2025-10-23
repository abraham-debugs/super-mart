import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "./CartSheet";
import { Link, useNavigate } from "react-router-dom";
import VoiceSearch from "@/components/VoiceSearch";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: "Fruits & Vegetables", href: "#fresh" },
    { name: "Dairy & Breakfast", href: "#dairy" },
    { name: "Snacks & Beverages", href: "#snacks" },
    { name: "Personal Care", href: "#care" },
    { name: "Household", href: "#household" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-3">
          <div className="glassmorphism-navbar dynamic-island rounded-3xl px-8 py-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg group-hover:scale-110 transition-all duration-300">
                      <span className="text-white font-bold text-xl">Z</span>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-blue-600 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 group-hover:scale-105 transition-transform duration-300">
                    Zepto
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-2 text-foreground/80">
                {navigation.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="relative text-sm font-medium hover:text-primary transition-all duration-300 hover:bg-primary/10 px-4 py-2 rounded-xl hover:scale-105 group"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                ))}
                <a href="/wishlist" className="relative text-sm font-medium hover:text-primary transition-all duration-300 hover:bg-primary/10 px-4 py-2 rounded-xl hover:scale-105 group">
                  <span className="relative z-10">Wishlist</span>
                  <div className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <a href="/saved" className="relative text-sm font-medium hover:text-primary transition-all duration-300 hover:bg-primary/10 px-4 py-2 rounded-xl hover:scale-105 group">
                  <span className="relative z-10">Saved</span>
                  <div className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </nav>

              {/* Search Bar + Voice - Desktop */}
              <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8 gap-4">
                <div className="relative w-full group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <Input
                    placeholder="Search for groceries & essentials..."
                    className="pl-12 pr-4 w-full h-12 rounded-2xl border-2 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        const qs = new URLSearchParams(window.location.search);
                        qs.set('q', target.value);
                        navigate('/?' + qs.toString());
                      }
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <VoiceSearch onSearch={(q) => {
                  const qs = new URLSearchParams(window.location.search);
                  qs.set('q', q);
                  navigate('/?' + qs.toString());
                }} />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {/* Mobile Search */}
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/5 hover:scale-110 transition-all duration-200">
                  <Search className="h-4 w-4" />
                </Button>

                <ThemeToggle />

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/5 transition-all duration-200 hover:scale-110"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getCartCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground shadow-primary/20 bounce-in">
                      {getCartCount()}
                    </Badge>
                  )}
                </Button>

                {/* Auth */}
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-primary/5 hover:scale-110 transition-all duration-200"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-primary/5 hover:scale-105 transition-all duration-200"
                      onClick={() => { logout(); window.location.href = '/login'; }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-primary/5 hover:scale-105 transition-all duration-200"
                      onClick={() => window.location.href = '/login'}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-primary/5 hover:scale-105 transition-all duration-200"
                      onClick={() => window.location.href = '/register'}
                    >
                      Register
                    </Button>
                  </>
                )}

                {/* Admin Link */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-primary/5 hover:scale-105 transition-all duration-200"
                  onClick={() => window.location.href = '/admin'}
                >
                  Admin
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-primary/5 hover:scale-110 transition-all duration-200"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-4 w-4 wiggle" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 glassmorphism-navbar rounded-2xl py-4">
              <div className="flex flex-col space-y-4 px-6">
                {/* Mobile Search + Voice */}
                <div className="relative flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for groceries & essentials..."
                      className="pl-10 pr-4 w-full border-primary/20 focus:border-primary/40 focus:ring-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const qs = new URLSearchParams(window.location.search);
                          qs.set('q', target.value);
                          navigate('/?' + qs.toString());
                        }
                      }}
                    />
                  </div>
                  <VoiceSearch onSearch={(q) => {
                    const qs = new URLSearchParams(window.location.search);
                    qs.set('q', q);
                    navigate('/?' + qs.toString());
                  }} />
                </div>
                
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors py-3 px-3 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <a
                    href="/wishlist"
                    className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors py-3 px-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </a>
                  <a
                    href="/saved"
                    className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors py-3 px-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Saved
                  </a>
                  <a
                    href="/profile"
                    className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors py-3 px-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </a>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};