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
  RefreshCw
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
  const [activeTab, setActiveTab] = useState("add-product");
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

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Load products error:", err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const orders = [
    { id: 1001, customer: "John Doe", total: 45.99, status: "pending", date: "2024-01-15", items: 5, delivery: "Not Assigned" },
    { id: 1002, customer: "Jane Smith", total: 32.50, status: "shipped", date: "2024-01-14", items: 3, delivery: "Mike Wilson" },
    { id: 1003, customer: "Bob Johnson", total: 67.25, status: "delivered", date: "2024-01-13", items: 7, delivery: "Sarah Davis" },
    { id: 1004, customer: "Alice Brown", total: 23.75, status: "cancelled", date: "2024-01-12", items: 2, delivery: "N/A" },
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+91 98765 43210", status: "active", orders: 15, joinDate: "2023-06-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+91 98765 43211", status: "active", orders: 8, joinDate: "2023-08-20" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+91 98765 43212", status: "suspended", orders: 3, joinDate: "2023-09-10" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "+91 98765 43213", status: "banned", orders: 0, joinDate: "2023-10-05" },
  ];

  const payments = [
    { id: 1, orderId: 1001, customer: "John Doe", amount: 45.99, method: "UPI", status: "completed", date: "2024-01-15", transactionId: "TXN123456" },
    { id: 2, orderId: 1002, customer: "Jane Smith", amount: 32.50, method: "Card", status: "completed", date: "2024-01-14", transactionId: "TXN123457" },
    { id: 3, orderId: 1003, customer: "Bob Johnson", amount: 67.25, method: "Wallet", status: "pending", date: "2024-01-13", transactionId: "TXN123458" },
    { id: 4, orderId: 1004, customer: "Alice Brown", amount: 23.75, method: "UPI", status: "failed", date: "2024-01-12", transactionId: "TXN123459" },
  ];

  const deliveryPersons = [
    { id: 1, name: "Mike Wilson", phone: "+91 98765 43220", status: "available", orders: 12 },
    { id: 2, name: "Sarah Davis", phone: "+91 98765 43221", status: "busy", orders: 8 },
    { id: 3, name: "Tom Brown", phone: "+91 98765 43222", status: "available", orders: 15 },
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "add-product", label: "Add Product", icon: Plus },
    { id: "product-management", label: "Product Management", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "order-management", label: "Order Management", icon: ShoppingCart },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "payment-reports", label: "Payment Reports", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex space-x-6 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === item.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-sm text-gray-500">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.total}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.products} products</p>
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
          </div>
        )}

        {/* Add Product */}
        {activeTab === "add-product" && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Add Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProductForm apiBase={API_BASE} categories={categoryRows} onCreated={loadCategories} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Product Management */}
        {activeTab === "product-management" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
              <div className="flex gap-2">
                <Input placeholder="Search products..." className="w-64" />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.nameEn} className="h-10 w-10 rounded object-cover border" />
                            <span>{product.nameEn}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.categoryName}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              <div className="flex gap-2">
                <Input placeholder="Search orders..." className="w-64" />
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

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Awaiting processing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Out for delivery</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Cancelled orders</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Person</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>₹{order.total}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Select defaultValue={order.delivery}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                              {deliveryPersons.map((person) => (
                                <SelectItem key={person.id} value={person.name}>
                                  {person.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Truck className="h-4 w-4" />
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
                    {users.map((user) => (
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
