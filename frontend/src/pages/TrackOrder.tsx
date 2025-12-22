import { useState, useEffect } from "react";
import { Search, Package, Truck, CheckCircle, Clock, CreditCard, Box, MapPin, Calendar, Smartphone, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const TrackOrder = () => {
  const { user, token } = useAuth() as any;
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadUserOrders();
    }
  }, [token]);

  const loadUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (e) {
      console.warn("Failed to load user orders", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTrackOrder = async (id?: string, phone?: string) => {
    const targetId = id || orderId;
    const targetMobile = phone || mobile;

    if (!targetId.trim() || !targetMobile.trim()) {
      alert("Please enter both Order ID and Mobile Number");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/orders/track?orderId=${encodeURIComponent(targetId)}&mobile=${encodeURIComponent(targetMobile)}`);
      if (!response.ok) throw new Error("Order not found");
      const data = await response.json();
      setOrderStatus(data);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('tracking-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      setOrderStatus({ error: error.message || "Order not found or mobile number does not match" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: "Confirmed", icon: Package, description: "Order received & processed" },
    { name: "Verified", icon: CreditCard, description: "Payment verified successfully" },
    { name: "Dispatched", icon: Truck, description: "Out for delivery" },
    { name: "Delivered", icon: CheckCircle, description: "Successfully delivered" }
  ];

  const getStatusStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return 1;
      case "payment_verified": return 2;
      case "booked": return 3;
      case "delivered": return 4;
      default: return 0;
    }
  };

  const currentStep = orderStatus ? getStatusStep(orderStatus.status) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gray-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-[0.2em] text-primary uppercase bg-primary/10 rounded-full">
            Real-time Updates
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
            Track Your <span className="text-primary italic">Package.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
            Stay updated on your order's journey from our warehouse to your doorstep with precision tracking.
          </p>
        </div>
      </section>

      {/* Tracking Search Layer */}
      <section className="relative -mt-16 z-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Search Card */}
            <Card className="lg:col-span-2 border-0 shadow-[0_30px_60px_rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-xl rounded-[40px] overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" /> Order ID
                    </label>
                    <Input
                      placeholder="e.g. ORD-12345"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="h-14 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" /> Mobile Number
                    </label>
                    <Input
                      placeholder="e.g. +91 99999 99999"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="h-14 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                  className="w-full h-16 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center gap-3"
                >
                  {loading ? "Locating Order..." : (
                    <>
                      Track Progress <Search className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Access Card (Recent Orders) */}
            <Card className="border-0 shadow-lg bg-gray-900 text-white rounded-[40px] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Your Recent Orders</h3>
                </div>

                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm font-light mb-4">Login to see your orders automatically.</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full" onClick={() => window.location.href = '/login'}>
                      Login Now
                    </Button>
                  </div>
                ) : ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : userOrders.length === 0 ? (
                  <p className="text-gray-400 text-sm font-light text-center py-6">No orders found.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {userOrders.map((order) => (
                      <button
                        key={order._id}
                        onClick={() => {
                          setOrderId(order.orderId || order._id);
                          setMobile(order.customerDetails?.mobile || '');
                          handleTrackOrder(order.orderId || order._id, order.customerDetails?.mobile || '');
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">#{order.orderId?.slice(-6) || order._id.slice(-6)}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{order.status}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="tracking-results" className="py-12 bg-white min-h-[400px]">
        <div className="container mx-auto px-4">
          {orderStatus && !loading && (
            <div className="max-w-5xl mx-auto">
              {orderStatus.error ? (
                <Card className="border-red-100 bg-red-50/50 rounded-3xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-red-600 font-medium">{orderStatus.error}</p>
                </Card>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  {/* Progress Timeline */}
                  <div className="relative py-12">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 hidden md:block"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>

                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0">
                      {steps.map((step, index) => {
                        const isActive = index < currentStep;
                        const isCurrent = index === currentStep - 1;
                        return (
                          <div key={index} className="flex flex-col items-center z-10 group">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl ${isActive ? 'bg-primary text-white scale-110' : 'bg-white text-gray-300 border border-gray-100'
                              } ${isCurrent ? 'animate-pulse' : ''}`}>
                              <step.icon className="h-8 w-8" />
                            </div>
                            <div className="mt-6 text-center">
                              <h4 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.name}</h4>
                              <p className="text-sm text-gray-500 font-light mt-1 max-w-[150px]">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-0 shadow-lg bg-gray-50/50 rounded-[40px] p-8 md:p-10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Order Information</h3>
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                          {orderStatus.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-y-8 gap-x-12">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Identifier</p>
                          <p className="text-lg font-mono font-bold text-gray-900">{orderStatus.orderId || orderStatus._id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Name</p>
                          <p className="text-lg font-bold text-gray-900">{orderStatus.customerDetails?.fullName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                          <p className="text-2xl font-black text-primary">Rs. {Number(orderStatus.total).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Date</p>
                          <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            {new Date(orderStatus.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gray-900 text-white rounded-[40px] p-8 md:p-10 flex flex-col justify-between">
                      <div className="space-y-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-4">Delivery Status</h4>
                          {orderStatus.status === 'booked' ? (
                            <div className="space-y-4">
                              <p className="text-gray-400 font-light underline decoration-primary underline-offset-8">Dispatched via {orderStatus.transportName}</p>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">LR Number</p>
                                <p className="font-mono text-lg">{orderStatus.lrNumber}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 font-light leading-relaxed">
                              Your order is currently in the <span className="text-white font-bold">{orderStatus.status?.replace('_', ' ')}</span> stage. We will notify you once it's out for delivery.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/10 mt-8">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Support Pin</p>
                        <p className="text-2xl font-mono tracking-widest mt-1">*{(orderStatus.orderId || orderStatus._id).slice(-4)}</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;
