import { useEffect, useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  ChevronDown,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Menu,
  X,
  Home,
  Star,
  Zap,
  Shield,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BalancingLoader } from "@/components/BalancingLoader";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Admin = () => {
  const { user, token } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Categories (backend-driven)
  const [categoryRows, setCategoryRows] = useState<Array<{ _id: string; name: string; imageUrl: string; parentCategory?: { _id: string; name: string } | null; showInNavbar?: boolean }>>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
  const [newParentCategory, setNewParentCategory] = useState<string>("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [editOpenForId, setEditOpenForId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editParentCategory, setEditParentCategory] = useState<string>("");
  const [newCategoryShowInNavbar, setNewCategoryShowInNavbar] = useState(false);
  const [editShowInNavbar, setEditShowInNavbar] = useState(false);

  // Promo Codes state
  const [promoCodes, setPromoCodes] = useState<Array<{
    id: string;
    code: string;
    discountPercent: number;
    expiryDate: string;
    isActive: boolean;
    usedCount: number;
    usageLimit: number | null;
    minOrderAmount: number;
    isValid: boolean;
  }>>([]);
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoExpiry, setPromoExpiry] = useState("");
  const [promoUsageLimit, setPromoUsageLimit] = useState("");
  const [promoMinAmount, setPromoMinAmount] = useState("");
  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategoryRows(data);
    } catch (err: any) {
      console.error("Load categories error:", err);
    }
  }

  async function loadPromoCodes() {
    try {
      const res = await fetch(`${API_BASE}/api/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load promo codes");
      const data = await res.json();
      setPromoCodes(data);
    } catch (err: any) {
      console.error("Load promo codes error:", err);
    }
  }

  async function handleCreatePromoCode() {
    setPromoError(null);
    setPromoSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/promo-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          discountPercent: Number(promoDiscount),
          expiryDate: promoExpiry,
          usageLimit: promoUsageLimit ? Number(promoUsageLimit) : null,
          minOrderAmount: promoMinAmount ? Number(promoMinAmount) : 0
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create promo code");
      }
      await loadPromoCodes();
      setIsAddPromoOpen(false);
      setPromoCode("");
      setPromoDiscount("");
      setPromoExpiry("");
      setPromoUsageLimit("");
      setPromoMinAmount("");
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setPromoSubmitting(false);
    }
  }

  async function handleDeletePromoCode(id: string) {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete promo code");
      await loadPromoCodes();
    } catch (err: any) {
      console.error("Delete promo code error:", err);
      alert("Failed to delete promo code");
    }
  }

  async function handleTogglePromoCode(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/promo-codes/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to toggle promo code");
      await loadPromoCodes();
    } catch (err: any) {
      console.error("Toggle promo code error:", err);
      alert("Failed to toggle promo code");
    }
  }
  const availableStatuses = ["placed", "shipped", "delivered", "cancelled"] as const;

  async function handleOrderStatusUpdate(order: { id: string; status: string } & any, nextStatus: string) {
    try {
      if (!availableStatuses.includes(nextStatus as any)) return;
      const orderKey = (order as any).orderId || order.id;
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderKey}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json().catch(() => null);
      // optimistic + server truth; update by id or orderId
      setAdminOrders(prev => prev.map(o => {
        const ok = (o as any).orderId ? ((o as any).orderId === ((order as any).orderId || data?.orderId)) : (o.id === order.id);
        return ok ? { ...o, status: data?.status || nextStatus } : o;
      }));
      // refresh from server to ensure persisted value shows after reload
      loadAdminOrders();
    } catch (e) {
      console.error("Order status update error:", e);
    }
  }

  async function handleAssignPartner(order: { id: string } & any, partnerId: string) {
    try {
      const orderKey = (order as any).orderId || order.id;
      const actualPartnerId = partnerId === "not-assigned" ? null : partnerId;
      
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderKey}/assign-partner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: actualPartnerId })
      });
      
      if (!res.ok) throw new Error("Failed to assign partner");
      
      // Refresh orders to show updated assignment
      loadAdminOrders();
    } catch (e) {
      console.error("Assign partner error:", e);
      alert("Failed to assign delivery partner");
    }
  }

  async function loadOrderDetail(id: string) {
    try {
      setOrderDetailLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Failed to load order detail");
      const data = await res.json();
      setOrderDetail({
        id: String(data.id),
        customerDetails: data.customerDetails || {},
        status: String(data.status),
        paymentMode: data.paymentMode || "COD",
        paymentStatus: data.paymentStatus || "Pending",
        transactionId: data.transactionId || null,
        total: Number(data.total || 0),
        createdAt: new Date(data.createdAt).toLocaleString(),
        items: Array.isArray(data.items) ? data.items : []
      });
    } catch (err) {
      console.error("Load order detail error:", err);
      setOrderDetail(null);
    } finally {
      setOrderDetailLoading(false);
    }
  }

  function openEdit(category: { _id: string; name: string; parentCategory?: { _id: string; name: string } | null; showInNavbar?: boolean }) {
    setEditOpenForId(category._id);
    setEditName(category.name);
    setEditFile(null);
    setEditParentCategory(category.parentCategory?._id || "");
    setEditShowInNavbar(category.showInNavbar || false);
  }

  async function handleEditCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editOpenForId) return;
    const form = new FormData();
    if (editName) form.append("name", editName);
    if (editFile) form.append("image", editFile);
    form.append("parentCategory", editParentCategory || "");
    form.append("showInNavbar", editShowInNavbar.toString());
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${editOpenForId}`, { method: "PUT", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to update category");
      setEditOpenForId(null);
      await loadCategories();
    } catch (err) {
      console.error("Update category error:", err);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError(null);
    if (!newCategoryName) {
      setCatError("Category name is required");
      return;
    }
    // Image is required for subcategories, optional for parent categories
    if (newParentCategory && !newCategoryFile) {
      setCatError("Image is required for subcategories");
      return;
    }
    setCatSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", newCategoryName);
      if (newCategoryFile) {
      form.append("image", newCategoryFile);
      }
      if (newParentCategory) {
        form.append("parentCategory", newParentCategory);
      }
      form.append("showInNavbar", newCategoryShowInNavbar.toString());
      const res = await fetch(`${API_BASE}/api/admin/categories`, { method: "POST", body: form });
      const data = await res.json().then(v => v).catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to add category");
      setNewCategoryName("");
      setNewCategoryFile(null);
      setNewParentCategory("");
      setNewCategoryShowInNavbar(false);
      setIsAddCategoryOpen(false);
      await loadCategories();
    } catch (err: any) {
      setCatError(err.message || "Failed to add category");
    } finally {
      setCatSubmitting(false);
    }
  }

  const [products, setProducts] = useState<Array<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string; isFreshPick?: boolean; isMostLoved?: boolean }>>([]);
  const [adminOrders, setAdminOrders] = useState<Array<{ id: string; customer: string; total: number; status: string; date: string | Date; items: number; delivery: string; itemsBrief?: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl?: string }> }>>([]);
  
  // Home Page Sections state
  const [freshPicksProducts, setFreshPicksProducts] = useState<Array<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string }>>([]);
  const [mostLovedProducts, setMostLovedProducts] = useState<Array<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string }>>([]);
  const [availableProducts, setAvailableProducts] = useState<Array<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string; isFreshPick?: boolean; isMostLoved?: boolean }>>([]);
  const [showAddToFreshPicks, setShowAddToFreshPicks] = useState(false);
  const [showAddToMostLoved, setShowAddToMostLoved] = useState(false);
  const [showNewProductFreshPicks, setShowNewProductFreshPicks] = useState(false);
  const [showNewProductMostLoved, setShowNewProductMostLoved] = useState(false);
  
  // Product management states
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string; isFreshPick?: boolean; isMostLoved?: boolean } | null>(null);
  const [editProductData, setEditProductData] = useState({
    nameEn: "",
    nameTa: "",
    price: "",
    originalPrice: "",
    youtubeLink: "",
    categoryId: "",
    image: null as File | null,
    isFreshPick: false,
    isMostLoved: false
  });
  const [editProductLoading, setEditProductLoading] = useState(false);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  const [editProductError, setEditProductError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string; phone: string; orders: number; status: string; joinDate: string }>>([]);
  const [loadingAdminOrders, setLoadingAdminOrders] = useState(false);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<null | { id: string; customerDetails?: any; status: string; paymentMode?: string; paymentStatus?: string; transactionId?: string; total: number; createdAt: string; items: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl?: string }> }>(null);
  const [searchDate, setSearchDate] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "placed" | "confirmed" | "payment_verified" | "booked" | "shipped" | "delivered" | "cancelled">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Delivery partners state
  const [partners, setPartners] = useState<Array<{ id: string; name: string; phone: string; status: "active" | "inactive" }>>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<null | { id: string; name: string; phone: string; status: "active" | "inactive" }>(null);
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pStatus, setPStatus] = useState<"active" | "inactive">("active");

  // Product filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  async function loadPartners() {
    try {
      setPartnersLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/delivery-partners`);
      if (!res.ok) throw new Error("Failed to load partners");
      const data = await res.json();
      setPartners(data);
    } catch (e) {
      console.error("Load partners error:", e);
    } finally {
      setPartnersLoading(false);
    }
  }

  function openCreatePartner() {
    setEditPartner(null);
    setPName("");
    setPPhone("");
    setPStatus("active");
    setPartnerDialogOpen(true);
  }

  function openEditPartner(p: { id: string; name: string; phone: string; status: "active" | "inactive" }) {
    setEditPartner(p);
    setPName(p.name);
    setPPhone(p.phone);
    setPStatus(p.status);
    setPartnerDialogOpen(true);
  }

  async function submitPartner(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: pName, phone: pPhone, status: pStatus } as any;
    const url = editPartner ? `${API_BASE}/api/admin/delivery-partners/${editPartner.id}` : `${API_BASE}/api/admin/delivery-partners`;
    const method = editPartner ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Partner save failed", data);
      return;
    }
    setPartnerDialogOpen(false);
    await loadPartners();
  }

  async function togglePartnerStatus(p: { id: string; name: string; phone: string; status: "active" | "inactive" }) {
    const res = await fetch(`${API_BASE}/api/admin/delivery-partners/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: p.status === "active" ? "inactive" : "active" })
    });
    if (res.ok) loadPartners();
  }

  async function loadProducts(categoryFilter?: string) {
    try {
      const qs = categoryFilter ? `?categoryId=${encodeURIComponent(categoryFilter)}` : "";
      const res = await fetch(`${API_BASE}/api/admin/products${qs}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
      setAvailableProducts(data);
    } catch (err) {
      console.error("Load products error:", err);
    }
  }

  async function loadHomeSections() {
    try {
      // Load Fresh Picks
      const freshRes = await fetch(`${API_BASE}/api/products/fresh-picks`);
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        setFreshPicksProducts(freshData.map((p: any) => ({
          _id: p.id,
          nameEn: p.name,
          categoryName: p.category,
          price: p.price,
          imageUrl: p.image
        })));
      }

      // Load Most Loved
      const lovedRes = await fetch(`${API_BASE}/api/products/most-loved`);
      if (lovedRes.ok) {
        const lovedData = await lovedRes.json();
        setMostLovedProducts(lovedData.map((p: any) => ({
          _id: p.id,
          nameEn: p.name,
          categoryName: p.category,
          price: p.price,
          imageUrl: p.image
        })));
      }
    } catch (err) {
      console.error("Load home sections error:", err);
    }
  }

  async function toggleProductSection(productId: string, section: "freshPick" | "mostLoved", currentValue: boolean) {
    try {
      const form = new FormData();
      if (section === "freshPick") {
        form.append("isFreshPick", (!currentValue).toString());
      } else {
        form.append("isMostLoved", (!currentValue).toString());
      }
      
      const res = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
        method: "PUT",
        body: form
      });

      if (!res.ok) throw new Error("Failed to update product");
      
      await loadHomeSections();
      await loadProducts();
      setShowAddToFreshPicks(false);
      setShowAddToMostLoved(false);
    } catch (err) {
      console.error("Toggle section error:", err);
      alert("Failed to update product section");
    }
  }

  // Product management functions
  async function openEditProduct(product: { _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string; isFreshPick?: boolean; isMostLoved?: boolean }) {
    setSelectedProduct(product);
    // Fetch full product details to get all fields
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`);
      if (res.ok) {
        const allProducts = await res.json();
        const fullProduct = allProducts.find((p: any) => p._id === product._id);
        if (fullProduct) {
          setEditProductData({
            nameEn: fullProduct.nameEn || product.nameEn,
            nameTa: fullProduct.nameTa || "",
            price: fullProduct.price?.toString() || product.price.toString(),
            originalPrice: fullProduct.originalPrice?.toString() || "",
            youtubeLink: fullProduct.youtubeLink || "",
            categoryId: fullProduct.categoryId || "",
            image: null,
            isFreshPick: fullProduct.isFreshPick || false,
            isMostLoved: fullProduct.isMostLoved || false
          });
        } else {
          // Fallback to basic data
          setEditProductData({
            nameEn: product.nameEn,
            nameTa: "",
            price: product.price.toString(),
            originalPrice: "",
            youtubeLink: "",
            categoryId: "",
            image: null,
            isFreshPick: product.isFreshPick || false,
            isMostLoved: product.isMostLoved || false
          });
        }
      } else {
        // Fallback to basic data
        setEditProductData({
          nameEn: product.nameEn,
          nameTa: "",
          price: product.price.toString(),
          originalPrice: "",
          youtubeLink: "",
          categoryId: "",
          image: null,
          isFreshPick: product.isFreshPick || false,
          isMostLoved: product.isMostLoved || false
        });
      }
    } catch (err) {
      // Fallback to basic data
      setEditProductData({
        nameEn: product.nameEn,
        nameTa: "",
        price: product.price.toString(),
        originalPrice: "",
        youtubeLink: "",
        categoryId: "",
        image: null,
        isFreshPick: product.isFreshPick || false,
        isMostLoved: product.isMostLoved || false
      });
    }
    setEditProductOpen(true);
  }

  function openDeleteProduct(product: { _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string }) {
    setSelectedProduct(product);
    setDeleteProductOpen(true);
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    setEditProductLoading(true);
    setEditProductError(null);

    try {
      const form = new FormData();
      form.append("nameEn", editProductData.nameEn);
      if (editProductData.nameTa) form.append("nameTa", editProductData.nameTa);
      form.append("price", editProductData.price);
      if (editProductData.originalPrice) form.append("originalPrice", editProductData.originalPrice);
      if (editProductData.youtubeLink) form.append("youtubeLink", editProductData.youtubeLink);
      if (editProductData.categoryId) form.append("categoryId", editProductData.categoryId);
      if (editProductData.image) form.append("image", editProductData.image);
      form.append("isFreshPick", editProductData.isFreshPick.toString());
      form.append("isMostLoved", editProductData.isMostLoved.toString());

      const res = await fetch(`${API_BASE}/api/admin/products/${selectedProduct._id}`, {
        method: "PUT",
        body: form
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update product");
      }
      
      setEditProductOpen(false);
      setSelectedProduct(null);
      setEditProductData({
        nameEn: "",
        nameTa: "",
        price: "",
        originalPrice: "",
        youtubeLink: "",
        categoryId: "",
        image: null,
        isFreshPick: false,
        isMostLoved: false
      });
      await loadProducts();
    } catch (err: any) {
      console.error("Edit product error:", err);
      setEditProductError(err.message || "Failed to update product");
    } finally {
      setEditProductLoading(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) return;

    setDeleteProductLoading(true);

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/admin/products/${selectedProduct._id}`, {
        method: "DELETE",
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete product");
      }
      
      setDeleteProductOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err: any) {
      console.error("Delete product error:", err);
      alert(`Failed to delete product: ${err.message}`);
    } finally {
      setDeleteProductLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadAdminOrders() {
    try {
      setLoadingAdminOrders(true);
      const res = await fetch(`${API_BASE}/api/admin/orders?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setAdminOrders(data);
    } catch (err) {
      console.error("Load admin orders error:", err);
    } finally {
      setLoadingAdminOrders(false);
    }
  }

  async function loadAdminUsers() {
    try {
      setLoadingAdminUsers(true);
      const res = await fetch(`${API_BASE}/api/admin/users?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setAdminUsers(data);
    } catch (err) {
      console.error("Load admin users error:", err);
    } finally {
      setLoadingAdminUsers(false);
    }
  }

  // Calculate dashboard statistics
  const totalRevenue = adminOrders.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + Number(order.total || 0);
    }
    return sum;
  }, 0);

  const deliveredOrdersCount = adminOrders.filter(o => o.status === 'delivered').length;
  const totalOrdersCount = adminOrders.length;
  const activeUsersCount = adminUsers.filter(u => u.status === 'active').length;

  // Top categories with product counts
  const topCategories = categoryRows.map(cat => ({
    _id: cat._id,
    name: cat.name,
    productCount: products.filter(p => p.categoryName === cat.name).length,
    status: 'active'
  })).sort((a, b) => b.productCount - a.productCount).slice(0, 4);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    await Promise.all([
      loadAdminOrders(),
      loadAdminUsers(),
      loadProducts(),
      loadCategories(),
      loadPartners()
    ]);
  };

  useEffect(() => {
    // Preload some admin data for dashboard
    loadAdminOrders();
    loadAdminUsers();
    loadPartners();
  }, []);

  useEffect(() => {
    if (activeTab === "delivery-partners") {
      loadPartners();
    }
    if (activeTab === "promo-codes") {
      loadPromoCodes();
    }
    if (activeTab === "home-sections") {
      loadHomeSections();
      loadProducts();
    }
  }, [activeTab]);

  // Derived order stats for Order Management
  const pendingCount = adminOrders.filter(o => ["placed", "pending", "confirmed", "payment_verified"].includes(String(o.status))).length;
  const inTransitCount = adminOrders.filter(o => ["booked", "shipped"].includes(String(o.status))).length;
  const deliveredTodayCount = adminOrders.filter(o => {
    if (String(o.status) !== "delivered") return false;
    const d = new Date(o.date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;
  const cancelledCount = adminOrders.filter(o => String(o.status) === "cancelled").length;

  const orderStatuses = [
    { value: "all", label: "All" },
    { value: "placed", label: "Placed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "payment_verified", label: "Payment Verified" },
    { value: "booked", label: "Booked" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ] as const;

  const filteredOrders = adminOrders.filter((o) => {
    // date filter
    const d = new Date(o.date);
    const dateMatch = !searchDate || (
      d.getFullYear() === Number(searchDate.slice(0, 4)) &&
      (d.getMonth() + 1) === Number(searchDate.slice(5, 7)) &&
      d.getDate() === Number(searchDate.slice(8, 10))
    );
    // id filter
    const displayId = (o as any).orderId || o.id;
    const idMatch = !searchOrderId || String(displayId).toLowerCase().includes(searchOrderId.toLowerCase());
    // status filter
    const statusMatch = orderStatusFilter === "all" || String(o.status) === orderStatusFilter;
    return dateMatch && idMatch && statusMatch;
  });

  // no dummy arrays; UI uses adminOrders/adminUsers

  // removed dummy payments and delivery persons; using real data from backend

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "add-product", label: "Add Product", icon: Plus, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "product-management", label: "Products", icon: Package, color: "text-purple-600", bgColor: "bg-purple-50" },
    { id: "home-sections", label: "Home Sections", icon: Home, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { id: "categories", label: "Categories", icon: Tag, color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: "order-management", label: "Orders", icon: ShoppingCart, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { id: "user-management", label: "Users", icon: Users, color: "text-pink-600", bgColor: "bg-pink-50" },
    { id: "delivery-partners", label: "Delivery", icon: Truck, color: "text-cyan-600", bgColor: "bg-cyan-50" },
    { id: "promo-codes", label: "Promo Codes", icon: Tag, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
      out_of_stock: { color: "bg-red-100 text-red-800", label: "Out of Stock" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      shipped: { color: "bg-blue-100 text-blue-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">MDMart Management Panel</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">MDMart Admin</span>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-current"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="mt-auto p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-900">Pro Plan</span>
                </div>
                <p className="text-xs text-gray-600">Advanced analytics & features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6 lg:p-8">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" onClick={refreshDashboard}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Revenue</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ShoppingCart className="h-3 w-3 text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">{deliveredOrdersCount} delivered orders</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Total Orders</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{totalOrdersCount}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">{deliveredOrdersCount} completed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Total Products</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{products.length}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3 text-purple-600" />
                    <p className="text-xs text-purple-600 font-medium">{categoryRows.length} categories</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Active Users</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{activeUsersCount}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3 text-orange-600" />
                    <p className="text-xs text-orange-600 font-medium">{adminUsers.length} total users</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Orders</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => setActiveTab("order-management")}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminOrders.length === 0 ? (
                      <div className="py-8 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No orders yet</p>
                      </div>
                    ) : (
                      adminOrders.slice(0, 5).map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                              #{((order as any).orderId || order.id).slice(-2)}
                          </div>
                          <div>
                              <p className="font-medium text-gray-900">Order #{(order as any).orderId || order.id}</p>
                            <p className="text-sm text-gray-500">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                          <div className="mt-1">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Top Categories</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => setActiveTab("categories")}
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCategories.length === 0 ? (
                      <div className="py-8 text-center">
                        <Tag className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No categories yet</p>
                      </div>
                    ) : (
                      topCategories.map((category, index) => (
                        <div key={category._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                              <p className="text-sm text-gray-500">{category.productCount} products</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(category.status)}
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => setActiveTab("add-product")}
                  >
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Add Product</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-200"
                    onClick={() => setActiveTab("order-management")}
                  >
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">View Orders</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
                    onClick={() => setActiveTab("user-management")}
                  >
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
                    onClick={() => setActiveTab("categories")}
                  >
                    <Tag className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Categories</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delivery Partners */}
        {activeTab === "delivery-partners" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Delivery Partners</h1>
                <p className="text-gray-600 mt-1">Manage your delivery team and track performance</p>
              </div>
              <Button onClick={openCreatePartner} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200/50">
                      <TableHead className="font-semibold text-gray-900">Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnersLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                          <BalancingLoader />
                        </TableCell>
                      </TableRow>
                    ) : partners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Truck className="h-12 w-12 text-gray-300" />
                            <div>
                              <p className="text-gray-600 font-medium">No delivery partners found</p>
                              <p className="text-sm text-gray-500">Add your first delivery partner to get started</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      partners.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                {p.name.charAt(0)}
                              </div>
                              <span className="text-gray-900">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{p.phone}</TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditPartner(p)} className="hover:bg-blue-50 hover:border-blue-200">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => togglePartnerStatus(p)}
                                className={p.status === "active" ? "hover:bg-red-50 hover:border-red-200" : "hover:bg-green-50 hover:border-green-200"}
                              >
                                {p.status === "active" ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editPartner ? "Edit Partner" : "Add Partner"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitPartner} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pname">Name</Label>
                    <Input id="pname" value={pName} onChange={(e) => setPName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pphone">Phone</Label>
                    <Input id="pphone" value={pPhone} onChange={(e) => setPPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={pStatus} onValueChange={(v) => setPStatus(v as any)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setPartnerDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editPartner ? "Save" : "Create"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Add Product */}
        {activeTab === "add-product" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-2">Create and manage your product catalog with ease</p>
            </div>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200/50">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Product Information
                </CardTitle>
                <p className="text-gray-600">Fill in the details below to add a new product to your store</p>
              </CardHeader>
              <CardContent className="p-8">
                <ProductForm apiBase={API_BASE} categories={categoryRows} onCreated={loadCategories} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Product Management */}
        {activeTab === "product-management" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setActiveTab("add-product")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Filter Section */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <Label className="text-sm font-semibold text-gray-700">Filter by Category:</Label>
                  </div>
                  <Select 
                    value={selectedCategoryFilter} 
                    onValueChange={(value) => {
                      setSelectedCategoryFilter(value);
                      if (value === "all") {
                        loadProducts();
                      } else {
                        loadProducts(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-64 bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          All Categories
                        </div>
                      </SelectItem>
                      {categoryRows.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategoryFilter !== "all" && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      {products.length} {products.length === 1 ? 'product' : 'products'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200/50">
                      <TableHead className="font-semibold text-gray-900">Product</TableHead>
                      <TableHead className="font-semibold text-gray-900">Category</TableHead>
                      <TableHead className="font-semibold text-gray-900">Price</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Package className="h-12 w-12 text-gray-300" />
                            <div>
                              <p className="text-gray-600 font-medium">
                                {selectedCategoryFilter !== "all" ? "No products in this category" : "No products found"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedCategoryFilter !== "all" ? "Try selecting a different category" : "Add your first product to get started"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img src={product.imageUrl} alt={product.nameEn} className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.nameEn}</p>
                                <p className="text-sm text-gray-500">ID: {product._id.slice(-6)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                              {product.categoryName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-900">₹{product.price}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-blue-50 hover:border-blue-200"
                                onClick={() => openEditProduct(product)}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {isSuperAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="hover:bg-red-50 hover:border-red-200"
                                  onClick={() => openDeleteProduct(product)}
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-green-50 hover:border-green-200"
                                title="View Product"
                              >
                                <Eye className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Product Dialog */}
            <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Edit className="h-4 w-4 text-white" />
                    </div>
                    Edit Product
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditProduct} className="space-y-6">
                  {editProductError && (
                    <div className="rounded-md bg-red-50 text-red-600 text-sm px-3 py-2 border border-red-200">
                      {editProductError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name-en" className="text-sm font-medium text-gray-700">Product Name (English)</Label>
                      <Input 
                        id="edit-name-en" 
                        value={editProductData.nameEn} 
                        onChange={(e) => setEditProductData({...editProductData, nameEn: e.target.value})} 
                        placeholder="Enter product name in English" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name-ta" className="text-sm font-medium text-gray-700">Product Name (Tamil)</Label>
                      <Input 
                        id="edit-name-ta" 
                        value={editProductData.nameTa} 
                        onChange={(e) => setEditProductData({...editProductData, nameTa: e.target.value})} 
                        placeholder="Enter product name in Tamil" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">Price (₹)</Label>
                      <Input 
                        id="edit-price" 
                        type="number" 
                        value={editProductData.price} 
                        onChange={(e) => setEditProductData({...editProductData, price: e.target.value})} 
                        placeholder="0.00" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-original-price" className="text-sm font-medium text-gray-700">Original Price (₹)</Label>
                      <Input 
                        id="edit-original-price" 
                        type="number" 
                        value={editProductData.originalPrice} 
                        onChange={(e) => setEditProductData({...editProductData, originalPrice: e.target.value})} 
                        placeholder="0.00" 
                      />
                      <p className="text-xs text-gray-500">(Optional)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700">Category</Label>
                      <Select onValueChange={(val) => setEditProductData({...editProductData, categoryId: val})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                          <ChevronDown className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryRows.map((c) => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-youtube" className="text-sm font-medium text-gray-700">YouTube Link (optional)</Label>
                      <Input 
                        id="edit-youtube" 
                        value={editProductData.youtubeLink} 
                        onChange={(e) => setEditProductData({...editProductData, youtubeLink: e.target.value})} 
                        placeholder="https://youtube.com/..." 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image" className="text-sm font-medium text-gray-700">New Image (optional)</Label>
                    <input 
                      id="edit-image" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setEditProductData({...editProductData, image: e.target.files?.[0] || null})} 
                    />
                    <p className="text-xs text-gray-500">Leave empty to keep current image</p>
                  </div>

                  {/* Home Page Sections */}
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white">Home Page Sections</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Select which home page sections this product should appear in</p>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-fresh-pick"
                        checked={editProductData.isFreshPick}
                        onCheckedChange={(checked) => setEditProductData({...editProductData, isFreshPick: !!checked})}
                      />
                      <Label 
                        htmlFor="edit-fresh-pick" 
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-blue-600" />
                        Show in "Fresh Picks for You" section
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-most-loved"
                        checked={editProductData.isMostLoved}
                        onCheckedChange={(checked) => setEditProductData({...editProductData, isMostLoved: !!checked})}
                      />
                      <Label 
                        htmlFor="edit-most-loved" 
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                      >
                        <Heart className="h-4 w-4 text-pink-600" />
                        Show in "Most Loved Items" section
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditProductOpen(false)}
                      disabled={editProductLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={editProductLoading}
                    >
                      {editProductLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Product"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Product Dialog */}
            <Dialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-red-600">
                    <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-white" />
                    </div>
                    Delete Product
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    {selectedProduct && (
                      <>
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.nameEn} className="h-12 w-12 rounded-lg object-cover border" />
                        <div>
                          <p className="font-semibold text-gray-900">{selectedProduct.nameEn}</p>
                          <p className="text-sm text-gray-600">₹{selectedProduct.price}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteProductOpen(false)}
                      disabled={deleteProductLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteProduct}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleteProductLoading}
                    >
                      {deleteProductLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Product"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Order detail modal */}
            <Dialog open={orderDetailOpen} onOpenChange={(o) => { setOrderDetailOpen(o); if (!o) { setSelectedOrderId(null); setOrderDetail(null); } }}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Order Details {selectedOrderId ? `#${selectedOrderId}` : ""}</DialogTitle>
                </DialogHeader>
                {orderDetailLoading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : !orderDetail ? (
                  <div className="py-8 text-center text-muted-foreground">No details available.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Placed: {orderDetail.createdAt} · Status: {orderDetail.status} · Total: ₹{orderDetail.total.toFixed(2)}</div>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetail.items.map((it) => (
                            <TableRow key={it.productId}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="h-10 w-10 rounded object-cover border" /> : null}
                                  <span>{it.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{it.quantity}</TableCell>
                              <TableCell>₹{Number(it.price).toFixed(2)}</TableCell>
                              <TableCell>₹{Number(it.price * it.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Categories */}
        {/* Home Page Sections */}
        {activeTab === "home-sections" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Home Page Sections</h1>
                <p className="text-gray-600 mt-1">Manage products featured on the home page</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  loadHomeSections();
                  loadProducts();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fresh Picks Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Fresh Picks for You</CardTitle>
                        <p className="text-sm text-gray-600">{freshPicksProducts.length} products</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddToFreshPicks(!showAddToFreshPicks)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Existing
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewProductFreshPicks(!showNewProductFreshPicks)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Product
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Existing Product Modal */}
                  {showAddToFreshPicks && (
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-semibold text-gray-900">Select Product to Add</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddToFreshPicks(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableProducts
                          .filter(p => !p.isFreshPick)
                          .map((product) => (
                            <div key={product._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img src={product.imageUrl} alt={product.nameEn} className="h-10 w-10 rounded object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.nameEn}</p>
                                  <p className="text-xs text-gray-500">{product.categoryName}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleProductSection(product._id, "freshPick", false)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        {availableProducts.filter(p => !p.isFreshPick).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">All products are already added</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Product Form */}
                  {showNewProductFreshPicks && (
                    <div className="p-4 bg-white rounded-lg border-2 border-green-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-semibold text-gray-900">Create New Product</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowNewProductFreshPicks(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <ProductForm 
                        apiBase={API_BASE}
                        categories={categoryRows}
                        defaultFreshPick={true}
                        onCreated={async () => {
                          await loadProducts();
                          await loadHomeSections();
                          setShowNewProductFreshPicks(false);
                        }}
                      />
                    </div>
                  )}

                  {/* Products List */}
                  <div className="space-y-3">
                    {freshPicksProducts.length === 0 ? (
                      <div className="py-8 text-center">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No products in Fresh Picks</p>
                        <p className="text-xs text-gray-400 mt-1">Add products to showcase on home page</p>
                      </div>
                    ) : (
                      freshPicksProducts.map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.nameEn} className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                            <div>
                              <p className="font-medium text-gray-900">{product.nameEn}</p>
                              <p className="text-sm text-gray-500">{product.categoryName} • ₹{product.price}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => toggleProductSection(product._id, "freshPick", true)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Most Loved Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Most Loved Items</CardTitle>
                        <p className="text-sm text-gray-600">{mostLovedProducts.length} products</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddToMostLoved(!showAddToMostLoved)}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Existing
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewProductMostLoved(!showNewProductMostLoved)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Product
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Existing Product Modal */}
                  {showAddToMostLoved && (
                    <div className="p-4 bg-white rounded-lg border-2 border-pink-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-semibold text-gray-900">Select Product to Add</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddToMostLoved(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableProducts
                          .filter(p => !p.isMostLoved)
                          .map((product) => (
                            <div key={product._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img src={product.imageUrl} alt={product.nameEn} className="h-10 w-10 rounded object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.nameEn}</p>
                                  <p className="text-xs text-gray-500">{product.categoryName}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleProductSection(product._id, "mostLoved", false)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        {availableProducts.filter(p => !p.isMostLoved).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">All products are already added</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Product Form */}
                  {showNewProductMostLoved && (
                    <div className="p-4 bg-white rounded-lg border-2 border-green-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-semibold text-gray-900">Create New Product</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowNewProductMostLoved(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <ProductForm 
                        apiBase={API_BASE}
                        categories={categoryRows}
                        defaultMostLoved={true}
                        onCreated={async () => {
                          await loadProducts();
                          await loadHomeSections();
                          setShowNewProductMostLoved(false);
                        }}
                      />
                    </div>
                  )}

                  {/* Products List */}
                  <div className="space-y-3">
                    {mostLovedProducts.length === 0 ? (
                      <div className="py-8 text-center">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No products in Most Loved</p>
                        <p className="text-xs text-gray-400 mt-1">Add products to showcase on home page</p>
                      </div>
                    ) : (
                      mostLovedProducts.map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.nameEn} className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                            <div>
                              <p className="font-medium text-gray-900">{product.nameEn}</p>
                              <p className="text-sm text-gray-500">{product.categoryName} • ₹{product.price}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => toggleProductSection(product._id, "mostLoved", true)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                <p className="text-gray-600 mt-1">Create parent categories (e.g., Grocery & Kitchen) and their subcategories (e.g., Atta, Rice & Dal)</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hover:bg-orange-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
                setIsAddCategoryOpen(open);
                if (open) {
                  setNewParentCategory(""); // Reset parent category
                  setNewCategoryName("");
                  setNewCategoryFile(null);
                  setCatError(null);
                }
              }}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        Add New Category
                      </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    {catError && (
                        <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3 border border-red-200 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {catError}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="cat-name" className="text-sm font-medium text-gray-700">Category Name</Label>
                        <Input 
                          id="cat-name" 
                          value={newCategoryName} 
                          onChange={(e) => setNewCategoryName(e.target.value)} 
                          placeholder="e.g. Fresh Produce, Electronics, Beverages" 
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="parent-cat" className="text-sm font-medium text-gray-700">Parent Category (Optional)</Label>
                        <Select value={newParentCategory || "none"} onValueChange={(val) => setNewParentCategory(val === "none" ? "" : val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Top-level category)</SelectItem>
                            {categoryRows.filter(c => !c.parentCategory).map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Select a parent to create a subcategory</p>
                    </div>
                      <div className="space-y-2">
                        <Label htmlFor="cat-image" className="text-sm font-medium text-gray-700">
                          Category Image {!newParentCategory && <span className="text-xs font-normal text-gray-500">(Optional for parent categories)</span>}
                        </Label>
                        <div className="relative">
                          <input 
                            id="cat-image" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setNewCategoryFile(e.target.files?.[0] || null)} 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {newParentCategory 
                            ? "Image required for subcategories. Upload a high-quality image (PNG, JPG, WEBP)" 
                            : "Optional for parent categories. A placeholder will be used if not provided."}
                        </p>
                      </div>
                      
                      {/* Show in Navbar Checkbox */}
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Checkbox 
                          id="new-cat-navbar"
                          checked={newCategoryShowInNavbar}
                          onCheckedChange={(checked) => setNewCategoryShowInNavbar(!!checked)}
                        />
                        <Label 
                          htmlFor="new-cat-navbar" 
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                        >
                          <Home className="h-4 w-4 text-blue-600" />
                          Show this category in navbar
                        </Label>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={catSubmitting} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                          {catSubmitting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Category
                            </>
                          )}
                        </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            {/* Category Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Total Categories</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Tag className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{categoryRows.length}</div>
                  <p className="text-xs text-orange-600 font-medium">Active categories</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{products.length}</div>
                  <p className="text-xs text-blue-600 font-medium">Across all categories</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Most Popular</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-900 truncate">{categoryRows[0]?.name || "N/A"}</div>
                  <p className="text-xs text-green-600 font-medium">Top selling category</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Avg Products</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{categoryRows.length > 0 ? Math.round(products.length / categoryRows.length) : 0}</div>
                  <p className="text-xs text-purple-600 font-medium">Per category</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Category Grid */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-orange-600" />
                      All Categories
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize your product categories</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                    {categoryRows.length} {categoryRows.length === 1 ? 'Category' : 'Categories'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {categoryRows.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <Tag className="h-10 w-10 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">No categories yet</p>
                        <p className="text-sm text-gray-500 mt-1">Get started by creating your first product category</p>
                      </div>
                      <Button 
                        onClick={() => setIsAddCategoryOpen(true)} 
                        className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Category
                      </Button>
                    </div>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                      <TableRow className="border-b border-gray-200/50">
                        <TableHead className="font-semibold text-gray-900">#</TableHead>
                        <TableHead className="font-semibold text-gray-900">Category Name</TableHead>
                        <TableHead className="font-semibold text-gray-900">Products</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {categoryRows.map((category, index) => (
                        <TableRow key={category._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              #{index + 1}
                            </Badge>
                          </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {category.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{category.name}</p>
                                {category.parentCategory ? (
                                  <p className="text-xs text-gray-500">
                                    <span className="text-blue-600">↳ {category.parentCategory.name}</span> • ID: {category._id.slice(-6)}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-500">ID: {category._id.slice(-6)}</p>
                                )}
                              </div>
                            </div>
                        </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700 font-medium">
                                {products.filter(p => p.categoryName === category.name).length} products
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editOpenForId === category._id} onOpenChange={(o) => !o && setEditOpenForId(null)}>
                              <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                                    onClick={() => openEdit(category)}
                                  >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Edit className="h-4 w-4 text-white" />
                                      </div>
                                      Edit Category
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditCategory} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Category Name</Label>
                                    <Input 
                                      id="edit-name" 
                                      value={editName} 
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="focus:ring-2 focus:ring-blue-500" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-parent-cat" className="text-sm font-medium text-gray-700">Parent Category (Optional)</Label>
                                    <Select value={editParentCategory || "none"} onValueChange={(val) => setEditParentCategory(val === "none" ? "" : val)}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select parent category (optional)" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None (Top-level category)</SelectItem>
                                        {categoryRows.filter(c => !c.parentCategory && c._id !== editOpenForId).map((cat) => (
                                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">Select a parent to make this a subcategory</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-image" className="text-sm font-medium text-gray-700">New Image (optional)</Label>
                                      <input 
                                        id="edit-image" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                      />
                                      <p className="text-xs text-gray-500">Leave empty to keep current image</p>
                                    </div>
                                    
                                    {/* Show in Navbar Checkbox */}
                                    <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <Checkbox 
                                        id="edit-cat-navbar"
                                        checked={editShowInNavbar}
                                        onCheckedChange={(checked) => setEditShowInNavbar(!!checked)}
                                      />
                                      <Label 
                                        htmlFor="edit-cat-navbar" 
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                                      >
                                        <Home className="h-4 w-4 text-blue-600" />
                                        Show this category in navbar
                                      </Label>
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditOpenForId(null)}>Cancel</Button>
                                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Save Changes
                                      </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all"
                              >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all"
                                title="View products"
                                onClick={() => {
                                  setSelectedCategoryFilter(category._id);
                                  setActiveTab("product-management");
                                  loadProducts(category._id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Order Management */}
        {activeTab === "order-management" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-1">Track and manage customer orders efficiently</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={loadAdminOrders} disabled={loadingAdminOrders} className="hover:bg-blue-50">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingAdminOrders ? 'animate-spin' : ''}`} />
                  {loadingAdminOrders ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="outline" className="hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

              {/* Filters now in Order Management */}
              <div className="mt-2">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div>
                    <Label>Search by Date</Label>
                    <Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Search by Order ID</Label>
                    <Input type="text" placeholder="Enter Order ID" value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)} />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => { /* filters are reactive */ loadAdminOrders(); }}>Apply Filter</Button>
                    <Button variant="outline" onClick={() => { setSearchDate(""); setSearchOrderId(""); setOrderStatusFilter("all"); }}>Clear</Button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {orderStatuses.map((s) => (
                    <button key={s.value} className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors ${orderStatusFilter === s.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`} onClick={() => setOrderStatusFilter(s.value as any)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

            {/* Enhanced Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-orange-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Pending Orders</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{pendingCount}</div>
                  <p className="text-xs text-orange-600 font-medium">Awaiting processing</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">In Transit</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{inTransitCount}</div>
                  <p className="text-xs text-blue-600 font-medium">Out for delivery</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Delivered Today</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{deliveredTodayCount}</div>
                  <p className="text-xs text-green-600 font-medium">Successfully delivered</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-pink-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Cancelled</CardTitle>
                  <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-900">{cancelledCount}</div>
                  <p className="text-xs text-red-600 font-medium">Cancelled orders</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200/50">
                      <TableHead className="font-semibold text-gray-900">Order ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Items</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Delivery Person</TableHead>
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <>
                        <TableRow
                          className="cursor-pointer hover:bg-blue-50/30 transition-colors group"
                          onClick={() => {
                          setSelectedOrderId(order.id);
                          setOrderDetailOpen(false);
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
                          // optimistic: show brief items immediately if present
                          if (order.itemsBrief && order.itemsBrief.length > 0) {
                            setOrderDetail({
                              id: order.id,
                              customerDetails: {},
                              status: String(order.status),
                              total: Number(order.total || 0),
                              createdAt: new Date(order.date).toLocaleString(),
                              items: order.itemsBrief.map(it => ({
                                productId: it.productId,
                                name: it.name,
                                price: it.price,
                                quantity: it.quantity,
                                imageUrl: it.imageUrl
                              }))
                            });
                          } else {
                            setOrderDetail(null);
                          }
                          // fetch full details in background
                          loadOrderDetail(((order as any).orderId as string) || order.id);
                         }}
                        >
                         <TableCell className="font-medium">#{(order as any).orderId || order.id}</TableCell>
                         <TableCell>{order.customer}</TableCell>
                         <TableCell>{order.items}</TableCell>
                         <TableCell>₹{order.total}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {order.status === "delivered" || order.status === "cancelled" ? (
                            getStatusBadge(order.status)
                          ) : (
                            <Select value={String(order.status)} onValueChange={(val) => handleOrderStatusUpdate(order, val)}>
                              <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStatuses.map(s => (
                                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                         <TableCell onClick={(e) => e.stopPropagation()}>
                           {order.status === "delivered" || order.status === "cancelled" ? (
                             <Badge variant="outline" className="text-xs">
                               {(order as any).assignedPartnerName || "Not Assigned"}
                             </Badge>
                           ) : (
                             <Select 
                               value={(order as any).assignedDeliveryPartner || "not-assigned"}
                               onValueChange={(partnerId) => handleAssignPartner(order, partnerId)}
                             >
                              <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-assigned">Not Assigned</SelectItem>
                                {partners.filter(p => p.status === "active").map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                           )}
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                        </TableRow>
                        {expandedOrderId === order.id && (
                          <TableRow>
                          <TableCell colSpan={7}>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-l-4 border-blue-400 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="font-semibold text-blue-900 text-lg">Ordered Products</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                                  <div className="text-blue-700 font-medium mb-1">Delivery Address</div>
                                  <div className="text-blue-900">{(order as any).customerDetails?.address || orderDetail?.customerDetails?.address || '-'}</div>
                                </div>
                                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                                  <div className="text-blue-700 font-medium mb-1">Payment Mode</div>
                                  <div className="text-blue-900 font-semibold">{orderDetail?.paymentMode || 'COD'}</div>
                                </div>
                                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                                  <div className="text-blue-700 font-medium mb-1">Payment Status</div>
                                  <div className={`font-semibold ${orderDetail?.paymentStatus === 'Paid' ? 'text-green-600' : orderDetail?.paymentStatus === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {orderDetail?.paymentStatus || 'Pending'}
                                  </div>
                                  {orderDetail?.transactionId && (
                                    <div className="text-xs text-blue-600 mt-1">TXN: {orderDetail.transactionId}</div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {orderDetail && orderDetail.id === order.id && orderDetail.items.length > 0 ? (
                                  orderDetail.items.map((it) => (
                                    <div key={it.productId} className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-blue-200/50 hover:bg-white/80 transition-colors">
                                      <div className="flex items-center gap-4">
                                        {it.imageUrl ? (
                                          <div className="relative">
                                            <img src={it.imageUrl} alt={it.name} className="h-12 w-12 rounded-lg object-cover border border-blue-200 shadow-sm" />
                                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                                          </div>
                                        ) : (
                                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <Package className="h-6 w-6 text-gray-400" />
                                          </div>
                                        )}
                                        <div>
                                          <div className="font-semibold text-blue-900">{it.name}</div>
                                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">ID: {it.productId.slice(-6)}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-6">
                                        <div className="text-center">
                                          <div className="text-sm text-blue-600 font-medium">Quantity</div>
                                          <div className="text-lg font-bold text-blue-900">{it.quantity}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm text-blue-600 font-medium">Price</div>
                                          <div className="text-lg font-bold text-blue-900">₹{Number(it.price).toFixed(2)}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm text-blue-600 font-medium">Total</div>
                                          <div className="text-lg font-bold text-green-600">₹{(Number(it.price) * it.quantity).toFixed(2)}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (order as any).itemsBrief && (order as any).itemsBrief.length > 0 ? (
                                  (order as any).itemsBrief.map((it: any) => (
                                    <div key={it.productId} className="flex items-center justify-between border-b border-blue-100 pb-2 last:border-b-0">
                                      <div className="flex items-center gap-3">
                                        {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="h-10 w-10 rounded object-cover border" /> : null}
                                        <div>
                                          <div className="font-medium text-blue-900">{it.name}</div>
                                          <div className="text-xs text-blue-500">Product ID: {it.productId}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm text-blue-700">Qty: {it.quantity}</span>
                                        <span className="text-sm text-blue-900 font-semibold">₹{Number(it.price).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-blue-400">No products found in this order.</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management */}
        {activeTab === "user-management" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <div className="flex gap-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" onClick={loadAdminUsers} disabled={loadingAdminUsers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loadingAdminUsers ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === "active" ? (
                              <Button variant="outline" size="sm" className="text-orange-600">
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Promo Codes */}
        {activeTab === "promo-codes" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
                <p className="text-gray-600 mt-1">Create and manage discount codes for your customers</p>
              </div>
              <Dialog open={isAddPromoOpen} onOpenChange={setIsAddPromoOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promo Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Promo Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {promoError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                        {promoError}
                      </div>
                    )}
                    <div>
                      <Label htmlFor="promoCode">Code *</Label>
                      <Input
                        id="promoCode"
                        placeholder="e.g., SUMMER2025"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoDiscount">Discount Percent (%) *</Label>
                      <Input
                        id="promoDiscount"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g., 10"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoExpiry">Expiry Date *</Label>
                      <Input
                        id="promoExpiry"
                        type="datetime-local"
                        value={promoExpiry}
                        onChange={(e) => setPromoExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoUsageLimit">Usage Limit (optional)</Label>
                      <Input
                        id="promoUsageLimit"
                        type="number"
                        min="1"
                        placeholder="Leave empty for unlimited"
                        value={promoUsageLimit}
                        onChange={(e) => setPromoUsageLimit(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoMinAmount">Minimum Order Amount (₹)</Label>
                      <Input
                        id="promoMinAmount"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={promoMinAmount}
                        onChange={(e) => setPromoMinAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleCreatePromoCode}
                      disabled={promoSubmitting || !promoCode || !promoDiscount || !promoExpiry}
                      className="w-full"
                    >
                      {promoSubmitting ? "Creating..." : "Create Promo Code"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Promo Codes Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Codes</CardTitle>
                  <Tag className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{promoCodes.length}</div>
                  <p className="text-xs text-gray-600 mt-1">All promo codes</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Active Codes</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {promoCodes.filter(c => c.isActive && c.isValid).length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Currently active</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Expired</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {promoCodes.filter(c => !c.isValid).length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">No longer valid</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Uses</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {promoCodes.reduce((sum, c) => sum + c.usedCount, 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Times redeemed</p>
                </CardContent>
              </Card>
            </div>

            {/* Promo Codes Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Promo Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {promoCodes.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Promo Codes Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first promo code to start offering discounts</p>
                    <Button onClick={() => setIsAddPromoOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Promo Code
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Min Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promoCodes.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-yellow-600" />
                              {promo.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              {promo.discountPercent}% OFF
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(promo.expiryDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-semibold">{promo.usedCount}</span>
                              {promo.usageLimit ? ` / ${promo.usageLimit}` : ' / ∞'}
                            </div>
                          </TableCell>
                          <TableCell>
                            ₹{promo.minOrderAmount}
                          </TableCell>
                          <TableCell>
                            {promo.isValid && promo.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : !promo.isValid ? (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <Ban className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePromoCode(promo.id)}
                                className={promo.isActive ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                              >
                                {promo.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePromoCode(promo.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+24.5%</div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Order Volume</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">orders this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.3%</div>
                  <p className="text-xs text-muted-foreground">retention rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,247</div>
                  <p className="text-xs text-muted-foreground">per order</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

// Inline ProductForm component to submit to backend and use real categories
const ProductForm: React.FC<{ 
  apiBase: string; 
  categories: Array<{ _id: string; name: string }>; 
  onCreated: () => void;
  defaultFreshPick?: boolean;
  defaultMostLoved?: boolean;
}> = ({ apiBase, categories, onCreated, defaultFreshPick = false, defaultMostLoved = false }) => {
  const [nameEn, setNameEn] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isFreshPick, setIsFreshPick] = useState(defaultFreshPick);
  const [isMostLoved, setIsMostLoved] = useState(defaultMostLoved);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameEn || !price || !categoryId || !file) {
      setError("Name, price, category and image are required");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("nameEn", nameEn);
      if (nameTa) form.append("nameTa", nameTa);
      form.append("price", price);
      if (originalPrice) form.append("originalPrice", originalPrice);
      if (youtubeLink) form.append("youtubeLink", youtubeLink);
      form.append("categoryId", categoryId);
      form.append("image", file);
      form.append("isFreshPick", isFreshPick.toString());
      form.append("isMostLoved", isMostLoved.toString());
      const res = await fetch(`${apiBase}/api/admin/products`, { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to add product");
      // reset
      setNameEn(""); setNameTa(""); setPrice(""); setOriginalPrice(""); setYoutubeLink(""); setCategoryId(""); setFile(null);
      setIsFreshPick(false); setIsMostLoved(false);
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div className="rounded-md bg-red-50 text-red-600 text-sm px-3 py-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="p-name-en" className="text-sm font-medium text-gray-700">Product Name (English)</Label>
          <Input id="p-name-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Enter product name in English" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-name-ta" className="text-sm font-medium text-gray-700">Product Name (Tamil)</Label>
          <Input id="p-name-ta" value={nameTa} onChange={(e) => setNameTa(e.target.value)} placeholder="Enter product name in Tamil" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-price" className="text-sm font-medium text-gray-700">Price (₹)</Label>
          <Input id="p-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-original-price" className="text-sm font-medium text-gray-700">Original Price (₹)</Label>
          <Input id="p-original-price" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0.00" />
          <p className="text-xs text-gray-500">(Optional)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-category" className="text-sm font-medium text-gray-700">Category</Label>
          <Select onValueChange={(val) => setCategoryId(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
              <ChevronDown className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-youtube" className="text-sm font-medium text-gray-700">YouTube Link (optional)</Label>
          <Input id="p-youtube" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-image" className="text-sm font-medium text-gray-700">Image</Label>
        <input id="p-image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      {/* Home Page Sections */}
      <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <Label className="text-sm font-semibold text-gray-900 dark:text-white">Home Page Sections</Label>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Select which home page sections this product should appear in</p>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="p-fresh-pick"
            checked={isFreshPick}
            onCheckedChange={(checked) => setIsFreshPick(!!checked)}
          />
          <Label 
            htmlFor="p-fresh-pick" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
          >
            <Star className="h-4 w-4 text-blue-600" />
            Show in "Fresh Picks for You" section
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="p-most-loved"
            checked={isMostLoved}
            onCheckedChange={(checked) => setIsMostLoved(!!checked)}
          />
          <Label 
            htmlFor="p-most-loved" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
          >
            <Heart className="h-4 w-4 text-pink-600" />
            Show in "Most Loved Items" section
          </Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="px-8 py-2" type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Product"}</Button>
      </div>
    </form>
  );
};
