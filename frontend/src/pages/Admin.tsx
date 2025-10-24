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
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Categories (backend-driven)
  const [categoryRows, setCategoryRows] = useState<Array<{ _id: string; name: string; imageUrl: string }>>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [editOpenForId, setEditOpenForId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

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

  function openEdit(category: { _id: string; name: string }) {
    setEditOpenForId(category._id);
    setEditName(category.name);
    setEditFile(null);
  }

  async function handleEditCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editOpenForId) return;
    const form = new FormData();
    if (editName) form.append("name", editName);
    if (editFile) form.append("image", editFile);
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
    if (!newCategoryName || !newCategoryFile) {
      setCatError("Name and image are required");
      return;
    }
    setCatSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", newCategoryName);
      form.append("image", newCategoryFile);
      const res = await fetch(`${API_BASE}/api/admin/categories`, { method: "POST", body: form });
      const data = await res.json().then(v => v).catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to add category");
      setNewCategoryName("");
      setNewCategoryFile(null);
      setIsAddCategoryOpen(false);
      await loadCategories();
    } catch (err: any) {
      setCatError(err.message || "Failed to add category");
    } finally {
      setCatSubmitting(false);
    }
  }

  // Sample data
  const categories = [
    { id: 1, name: "Fruits & Vegetables", products: 45, status: "active" },
    { id: 2, name: "Dairy & Eggs", products: 32, status: "active" },
    { id: 3, name: "Meat & Seafood", products: 28, status: "active" },
    { id: 4, name: "Bakery", products: 15, status: "inactive" },
  ];

  const [products, setProducts] = useState<Array<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string }>>([]);
  const [adminOrders, setAdminOrders] = useState<Array<{ id: string; customer: string; total: number; status: string; date: string | Date; items: number; delivery: string; itemsBrief?: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl?: string }> }>>([]);
  
  // Product management states
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string } | null>(null);
  const [editProductData, setEditProductData] = useState({
    nameEn: "",
    nameTa: "",
    price: "",
    originalPrice: "",
    youtubeLink: "",
    categoryId: "",
    image: null as File | null
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
  const [orderDetail, setOrderDetail] = useState<null | { id: string; customerDetails?: any; status: string; total: number; createdAt: string; items: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl?: string }> }>(null);
  const [searchDate, setSearchDate] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "placed" | "confirmed" | "payment_verified" | "booked" | "shipped" | "delivered" | "cancelled">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "with_payment" | "pending_verification" | "verified">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Delivery partners state
  const [partners, setPartners] = useState<Array<{ id: string; name: string; phone: string; status: "active" | "inactive" }>>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<null | { id: string; name: string; phone: string; status: "active" | "inactive" }>(null);
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pStatus, setPStatus] = useState<"active" | "inactive">("active");

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
    } catch (err) {
      console.error("Load products error:", err);
    }
  }

  // Product management functions
  function openEditProduct(product: { _id: string; nameEn: string; categoryName: string; price: number; imageUrl: string }) {
    setSelectedProduct(product);
    setEditProductData({
      nameEn: product.nameEn,
      nameTa: "",
      price: product.price.toString(),
      originalPrice: "",
      youtubeLink: "",
      categoryId: "",
      image: null
    });
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
        image: null
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
      const res = await fetch(`${API_BASE}/api/admin/products/${selectedProduct._id}`, {
        method: "DELETE"
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
  const paymentFilters = [
    { value: "all", label: "All" },
    { value: "with_payment", label: "With Payment" },
    { value: "pending_verification", label: "Pending Verification" },
    { value: "verified", label: "Verified" },
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
    // payment filter
    let paymentMatch = true;
    const ps = (o as any).paymentScreenshot || null;
    if (paymentFilter === "with_payment") paymentMatch = !!ps;
    else if (paymentFilter === "pending_verification") paymentMatch = !!ps && !ps.verified;
    else if (paymentFilter === "verified") paymentMatch = !!ps && !!ps.verified;
    return dateMatch && idMatch && statusMatch && paymentMatch;
  });

  // no dummy arrays; UI uses adminOrders/adminUsers

  const payments = [
    { id: 1, orderId: 1001, customer: "John Doe", amount: 45.99, method: "UPI", status: "completed", date: "2024-01-15", transactionId: "TXN123456" },
    { id: 2, orderId: 1002, customer: "Jane Smith", amount: 32.50, method: "Card", status: "completed", date: "2024-01-14", transactionId: "TXN123457" },
    { id: 3, orderId: 1003, customer: "Bob Johnson", amount: 67.25, method: "Wallet", status: "pending", date: "2024-01-13", transactionId: "TXN123458" },
    { id: 4, orderId: 1004, customer: "Alice Brown", amount: 23.75, method: "UPI", status: "failed", date: "2024-01-12", transactionId: "TXN123459" },
  ];

  // removed dummy delivery persons; using `partners` from backend instead

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "add-product", label: "Add Product", icon: Plus, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "product-management", label: "Products", icon: Package, color: "text-purple-600", bgColor: "bg-purple-50" },
    { id: "categories", label: "Categories", icon: Tag, color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: "order-management", label: "Orders", icon: ShoppingCart, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { id: "user-management", label: "Users", icon: Users, color: "text-pink-600", bgColor: "bg-pink-50" },
    { id: "payment-reports", label: "Payments", icon: CreditCard, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { id: "delivery-partners", label: "Delivery", icon: Truck, color: "text-cyan-600", bgColor: "bg-cyan-50" },
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
                <p className="text-sm text-gray-500">Zepto Management Panel</p>
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
                <span className="text-lg font-bold text-gray-900">Zepto Admin</span>
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
                <Button size="sm">
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
                  <div className="text-3xl font-bold text-blue-900">₹1,45,231.89</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">+20.1% from last month</p>
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
                  <div className="text-3xl font-bold text-green-900">2,350</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">+180.1% from last month</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Active Products</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">1,234</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">+19% from last month</p>
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
                  <div className="text-3xl font-bold text-orange-900">573</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">+201 since last hour</p>
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
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminOrders.slice(0, 5).map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            #{order.id.slice(-2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{order.total}</p>
                          <div className="mt-1">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Top Categories</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.products} products</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(category.status)}
                        </div>
                      </div>
                    ))}
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
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Add Product</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-200">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">View Orders</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Analytics</span>
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
                          <div className="flex items-center justify-center gap-3">
                            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-gray-600">Loading partners...</span>
                          </div>
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
                              <p className="text-gray-600 font-medium">No products found</p>
                              <p className="text-sm text-gray-500">Add your first product to get started</p>
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-red-50 hover:border-red-200"
                                onClick={() => openDeleteProduct(product)}
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
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
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    {catError && (
                      <div className="rounded-md bg-red-50 text-red-600 text-sm px-3 py-2">{catError}</div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Name</Label>
                      <Input id="cat-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Fresh Produce" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-image">Image</Label>
                      <input id="cat-image" type="file" accept="image/*" onChange={(e) => setNewCategoryFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={catSubmitting}>{catSubmitting ? "Adding..." : "Add"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRows.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          <img src={category.imageUrl} alt={category.name} className="h-10 w-10 rounded-md object-cover border" />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editOpenForId === category._id} onOpenChange={(o) => !o && setEditOpenForId(null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditCategory} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-image">Image (optional)</Label>
                                    <input id="edit-image" type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditOpenForId(null)}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                    <Button variant="outline" onClick={() => { setSearchDate(""); setSearchOrderId(""); setOrderStatusFilter("all"); setPaymentFilter("all"); }}>Clear</Button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {orderStatuses.map((s) => (
                    <button key={s.value} className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors ${orderStatusFilter === s.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`} onClick={() => setOrderStatusFilter(s.value as any)}>
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {paymentFilters.map((pf) => (
                    <button key={pf.value} className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors ${paymentFilter === pf.value ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50'}`} onClick={() => setPaymentFilter(pf.value as any)}>
                      {pf.label}
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
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
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
                        </TableCell>
                         <TableCell>
                           <Select defaultValue={order.delivery}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                              {partners.filter(p => p.status === "active").map((p) => (
                                <SelectItem key={p.id} value={p.name}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                              <Truck className="h-4 w-4 text-purple-600" />
                            </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                        {expandedOrderId === order.id && (
                          <TableRow>
                          <TableCell colSpan={8}>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-l-4 border-blue-400 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="font-semibold text-blue-900 text-lg">Ordered Products</h4>
                              </div>
                              <div className="mb-3 text-sm text-blue-900">
                                <div className="text-blue-700 font-medium">Delivery Address:</div>
                                <div>{(order as any).customerDetails?.address || orderDetail?.customerDetails?.address || '-'}</div>
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

        {/* Payment Reports */}
        {activeTab === "payment-reports" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Payment & Transaction Reports</h1>
              <div className="flex gap-2">
                <Input placeholder="Search transactions..." className="w-64" />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,69,456.49</div>
                  <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">98.5% success rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">43</div>
                  <p className="text-xs text-muted-foreground">1.5% failure rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.transactionId}</TableCell>
                        <TableCell>#{payment.orderId}</TableCell>
                        <TableCell>{payment.customer}</TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
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
const ProductForm: React.FC<{ apiBase: string; categories: Array<{ _id: string; name: string }>; onCreated: () => void }> = ({ apiBase, categories, onCreated }) => {
  const [nameEn, setNameEn] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
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
      const res = await fetch(`${apiBase}/api/admin/products`, { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to add product");
      // reset
      setNameEn(""); setNameTa(""); setPrice(""); setOriginalPrice(""); setYoutubeLink(""); setCategoryId(""); setFile(null);
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
      <div className="flex justify-end">
        <Button className="px-8 py-2" type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Product"}</Button>
      </div>
    </form>
  );
};
