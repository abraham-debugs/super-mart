import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AdminLogin } from "./pages/AdminLogin";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import VerifyEmail from "./pages/VerifyEmail";
import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";


const queryClient = new QueryClient();

// Strict admin guard - always requires fresh authentication
// Clears cache and redirects to login if not authenticated
const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Always check authentication - don't rely on cached data
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  const storedUserRaw = localStorage.getItem("user") || localStorage.getItem("auth_user");

  let hasAdmin = false;

  // Validate token and user data exist
  if (token && storedUserRaw && token.trim() !== "" && storedUserRaw.trim() !== "") {
    try {
      const u = JSON.parse(storedUserRaw);
      // Check if user has admin or superadmin role
      hasAdmin = u?.role === "admin" || u?.role === "superadmin";

      // If invalid role, clear cache
      if (!hasAdmin) {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch {
      // Invalid user data - clear cache
      localStorage.clear();
      sessionStorage.clear();
      hasAdmin = false;
    }
  } else {
    // No token or user data - clear any stale data
    localStorage.clear();
    sessionStorage.clear();
  }

  // Always redirect to login if not authenticated
  if (!hasAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

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
                <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
                <Route path="/shop" element={<Layout><Shop /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />


                {/* Auth pages (no navbar/footer) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Admin pages - login route must come BEFORE /admin route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Pages without Header/Footer (they have their own navigation) */}
                <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
                <Route path="/superadmin" element={<RequireAdmin><SuperAdmin /></RequireAdmin>} />

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
