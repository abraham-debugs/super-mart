import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Package, LogOut, MapPin, CreditCard, Phone, User } from "lucide-react";

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
};

export const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

  const loadOrders = async (partnerId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/delivery/orders/${partnerId}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
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
        loadOrders(partner.id);
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700 border-green-300";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-300";
      case "cancelled": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const pendingOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = orders.filter(o => o.status === "delivered");

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{partner.name}</h1>
                <p className="text-sm text-gray-500">{partner.phone}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>My Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No orders assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{order.customerDetails?.fullName || "Customer"}</div>
                              {order.customerDetails?.mobile && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="h-3 w-3" />
                                  {order.customerDetails.mobile}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{order.address || order.customerDetails?.address || "No address"}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{order.paymentMode}</span>
                              <Badge variant="outline" className="text-xs">
                                {order.paymentStatus}
                              </Badge>
                            </div>
                            <div className="font-semibold text-gray-900">
                              Total: ₹{order.total}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {order.status === "delivered" || order.status === "cancelled" ? (
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        ) : (
                          <Select
                            value={order.status}
                            onValueChange={(val) => handleStatusUpdate(order.id, val)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-xs"
                    >
                      {expandedOrder === order.id ? "Hide" : "View"} Items ({order.items.length})
                    </Button>

                    {expandedOrder === order.id && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded object-cover" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</div>
                            </div>
                            <div className="font-semibold">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

