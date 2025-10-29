import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Package, 
  LogOut, 
  MapPin, 
  CreditCard, 
  Phone, 
  User, 
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Navigation,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  PhoneCall,
  ShoppingBag,
  Timer
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

type Order = {
  id: string;
  orderId: string;
  customerDetails: any;
  address: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  total: number;
  status: string;
  paymentMode: string;
  paymentStatus: string;
  createdAt: string;
  placedAt?: string;
};

export const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    // Check if partner is logged in
    const partnerData = localStorage.getItem("deliveryPartner");
    if (!partnerData) {
      navigate("/delivery/login");
      return;
    }

    const parsedPartner = JSON.parse(partnerData);
    setPartner(parsedPartner);
    loadOrders(parsedPartner.id);
  }, [navigate]);

  const loadOrders = async (partnerId: string, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await fetch(`${API_BASE}/api/delivery/orders/${partnerId}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (partner) {
      loadOrders(partner.id, true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryPartner");
    navigate("/delivery/login");
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, partnerId: partner?.id })
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Refresh orders
      if (partner) {
        loadOrders(partner.id, true);
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-500/10 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400";
      case "shipped": return "bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400";
      case "placed": return "bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400";
      case "confirmed": return "bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400";
      case "cancelled": return "bg-red-500/10 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const pendingOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = orders.filter(o => o.status === "delivered");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  // Calculate stats
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const todayDeliveries = completedOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails?.mobile?.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && order.status !== "delivered" && order.status !== "cancelled") ||
      order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const completedFiltered = filteredOrders.filter(o => o.status === "delivered");
  const cancelledFiltered = filteredOrders.filter(o => o.status === "cancelled");

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-cyan-500/20">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{partner.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {partner.phone}
                  </p>
                  <Badge className="bg-green-500/10 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Deliveries</CardTitle>
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pendingOrders.length}</div>
                <span className="text-sm text-gray-500">orders</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {pendingOrders.length > 0 ? "In progress" : "All clear!"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedOrders.length}</div>
                <span className="text-sm text-gray-500">orders</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {todayDeliveries} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</CardTitle>
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Rs.{totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-2">From {completedOrders.length} deliveries</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</CardTitle>
                <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{orders.length}</div>
                <span className="text-sm text-gray-500">assigned</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">All time deliveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, customer name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              My Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">
                  Active ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedFiltered.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledFiltered.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500">Loading orders...</p>
                  </div>
                ) : activeOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No active orders</p>
                    <p className="text-gray-400 text-sm mt-2">All your deliveries are complete!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        expandedOrder={expandedOrder}
                        setExpandedOrder={setExpandedOrder}
                        onStatusUpdate={handleStatusUpdate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedFiltered.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No completed orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedFiltered.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        expandedOrder={expandedOrder}
                        setExpandedOrder={setExpandedOrder}
                        onStatusUpdate={handleStatusUpdate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-6">
                {cancelledFiltered.length === 0 ? (
                  <div className="text-center py-16">
                    <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No cancelled orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cancelledFiltered.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        expandedOrder={expandedOrder}
                        setExpandedOrder={setExpandedOrder}
                        onStatusUpdate={handleStatusUpdate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Enhanced Order Card Component
const OrderCard = ({
  order,
  expandedOrder,
  setExpandedOrder,
  onStatusUpdate,
  getStatusColor,
  getStatusIcon,
  formatDate,
  formatTime
}: {
  order: Order;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}) => {
  const isExpanded = expandedOrder === order.id;
  const canUpdateStatus = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Order Header */}
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm">
                    #{order.orderId}
                  </span>
                </h3>
                <Badge className={`${getStatusColor(order.status)} border flex items-center gap-1.5 px-2.5 py-1`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(order.placedAt || order.createdAt)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {order.customerDetails?.fullName || "Customer"}
                    </div>
                    {order.customerDetails?.mobile && (
                      <a 
                        href={`tel:${order.customerDetails.mobile}`}
                        className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        {order.customerDetails.mobile}
                      </a>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {order.address || order.customerDetails?.address || "No address provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment & Total */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {order.paymentMode}
                  </span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Rs.{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col items-end gap-3">
              {canUpdateStatus ? (
                <Select
                  value={order.status}
                  onValueChange={(val) => onStatusUpdate(order.id, val)}
                >
                  <SelectTrigger className="w-[160px] bg-blue-600 hover:bg-blue-700 text-white border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                    <SelectItem value="shipped">Mark as Shipped</SelectItem>
                    <SelectItem value="delivered">Mark as Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancel Order</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={`${getStatusColor(order.status)} border px-4 py-2`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1.5 capitalize">{order.status}</span>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                className="gap-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Items
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View Items ({order.items.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Items Section */}
        {isExpanded && (
          <div className="border-t bg-gray-50 dark:bg-slate-800/50 p-5">
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order Items ({order.items.length})
              </h4>
            </div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-slate-700" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Quantity: {item.quantity} × Rs.{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      Rs.{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Order Total</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rs.{order.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
