import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Saved from "./pages/Saved";
import Category from "./pages/Category";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import { DeliveryLogin } from "./pages/DeliveryLogin";
import { DeliveryDashboard } from "./pages/DeliveryDashboard";
import SubscriptionPlans from "./pages/SubscriptionPlans";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Pages with Header and Footer */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/saved" element={<Layout><Saved /></Layout>} />
                <Route path="/category/:id" element={<Layout><Category /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/checkout" element={<Layout showFooter={false}><Checkout /></Layout>} />
                <Route path="/order-success" element={<Layout><OrderSuccess /></Layout>} />
                <Route path="/track-order" element={<Layout><TrackOrder /></Layout>} />
                <Route path="/subscription-plans" element={<Layout><SubscriptionPlans /></Layout>} />
                
                {/* Pages without Header/Footer (they have their own navigation) */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/superadmin" element={<SuperAdmin />} />
                
                {/* Auth pages (clean layout, no footer) */}
                <Route path="/login" element={<Layout showFooter={false}><Login /></Layout>} />
                <Route path="/register" element={<Layout showFooter={false}><Register /></Layout>} />
                
                {/* Delivery pages (they have their own navigation) */}
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                
                {/* 404 page */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
