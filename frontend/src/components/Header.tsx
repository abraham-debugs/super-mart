import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "./CartSheet";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartCount } = useCart();

  const navigation = [
    { name: "Fruits & Vegetables", href: "#fresh" },
    { name: "Dairy & Breakfast", href: "#dairy" },
    { name: "Snacks & Beverages", href: "#snacks" },
    { name: "Personal Care", href: "#care" },
    { name: "Household", href: "#household" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="glassmorphism-navbar dynamic-island rounded-2xl px-6 py-3">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 gradient-primary rounded-xl shadow-primary/20 border border-primary/20 hover:scale-110 transition-transform duration-300 pulse-glow">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <span className="text-xl font-bold text-gradient hover:scale-105 transition-transform duration-300">
                  Zepto
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {navigation.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/5 px-3 py-2 rounded-lg hover:scale-105 slide-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>

              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for groceries & essentials..."
                    className="pl-10 pr-4 w-full border-primary/20 focus:border-primary/40 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
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

                {/* Profile */}
                <Button variant="ghost" size="icon" className="hover:bg-primary/5 hover:scale-110 transition-all duration-200">
                  <User className="h-4 w-4" />
                </Button>

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
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                    placeholder="Search for groceries & essentials..."
                    className="pl-10 pr-4 w-full border-primary/20 focus:border-primary/40 focus:ring-primary/20"
                  />
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