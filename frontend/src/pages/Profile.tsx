import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Check, User, Package, MapPin, LogOut, Mail, Phone, Home, Lock, ShoppingBag, Calendar, TrendingUp, Crown, CreditCard } from "lucide-react";
import { AddressBook } from "@/components/AddressBook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Profile: React.FC = () => {
  const { user, logout, token } = useAuth() as any;
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"account" | "orders" | "addresses" | "subscription">("account");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const me = await res.json();
        if (!cancelled) {
          setName(me.name || "");
          setPhone(me.phone || "");
          setAddress(me.address || "");
        }
      } catch (e) {
        console.warn("Failed to load profile", e);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      if (activeTab !== "orders") return;
      setOrdersLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (!cancelled) setOrders(data);
      } catch (e) {
        console.warn("Load orders error:", e);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }
    loadOrders();
    return () => { cancelled = true; };
  }, [activeTab, token]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubscription() {
      if (activeTab !== "subscription") return;
      setSubscriptionLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/subscriptions/my-subscription`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch subscription");
        const data = await res.json();
        if (!cancelled) setSubscription(data);
      } catch (e) {
        console.warn("Load subscription error:", e);
      } finally {
        if (!cancelled) setSubscriptionLoading(false);
      }
    }
    loadSubscription();
    return () => { cancelled = true; };
  }, [activeTab, token]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, address, isProfileComplete: true })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to save profile");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700 border-green-300";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-300";
      case "cancelled": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="mt-2 text-blue-100">Manage your account and view your orders</p>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => { logout(); navigate("/login"); }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 mb-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{deliveredOrders}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
            </div>
          </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalSpent.toFixed(0)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
                    </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{name || user?.name || "User"}</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                  <Badge className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500">Premium Member</Badge>
                    </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{email}</span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="account" className="space-y-6" onValueChange={(val) => setActiveTab(val as any)}>
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-0 p-1">
                <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="addresses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <MapPin className="h-4 w-4 mr-2" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="subscription" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Subscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                {/* Personal Information */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={save} className="space-y-4">
                      {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 555 000 1234"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            Address
                          </Label>
                          <Textarea
                            id="address"
                            rows={3}
                            placeholder="Street, City, State, ZIP"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" className="border-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input id="confirm" type="password" className="border-gray-300" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline">Update Password</Button>
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Package className="h-5 w-5 text-blue-600" />
                      My Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                  {ordersLoading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                      </div>
                  ) : orders.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No orders yet</p>
                        <p className="text-sm text-gray-500 mt-1">Your orders will appear here</p>
                      </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const steps = ["placed", "shipped", "delivered"];
                        let currentIndex = steps.indexOf(order.status);
                        if (currentIndex === -1) {
                          if (order.status === "paid") currentIndex = 0;
                          else if (order.status === "cancelled") currentIndex = -1;
                          else currentIndex = 0;
                        }

                        return (
                            <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                              <div className="flex items-start justify-between mb-4">
                              <div>
                                  <p className="text-sm text-gray-500">Order ID: {order._id?.slice(-8)}</p>
                                  <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                                    {order.status?.toUpperCase()}
                                  </Badge>
                              </div>
                              <div className="text-right">
                                  <p className="text-2xl font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</p>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                            </div>

                              {/* Progress Tracker */}
                              {order.status !== "cancelled" && (
                                <div className="my-6">
                                  <div className="flex items-center justify-between">
                                {steps.map((s, idx) => {
                                  const done = currentIndex >= idx;
                                      const isLast = idx === steps.length - 1;
                                  return (
                                        <React.Fragment key={s}>
                                          <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                              done ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                                            }`}>
                                              {done ? <Check className="h-5 w-5" /> : <span className="text-sm font-medium">{idx + 1}</span>}
                                            </div>
                                            <p className={`mt-2 text-xs font-medium ${done ? "text-green-600" : "text-gray-500"}`}>
                                              {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </p>
                                      </div>
                                          {!isLast && (
                                            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${currentIndex > idx ? "bg-green-500" : "bg-gray-200"}`} />
                                      )}
                                        </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                              )}

                              {/* Items */}
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Order Items:</p>
                                <div className="space-y-3">
                                  {order.items?.map((it: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <img src={it.imageUrl} alt={it.name} className="w-12 h-12 object-cover rounded-md shadow-sm" />
                                      <div>
                                          <p className="text-sm font-medium text-gray-900">{it.name}</p>
                                          <p className="text-xs text-gray-500">Quantity: {it.quantity}</p>
                                        </div>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900">₹{Number(it.price * it.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                </div>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Saved Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <AddressBook showActions />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Crown className="h-5 w-5 text-blue-600" />
                      Subscription Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscriptionLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : subscription ? (
                      <div className="space-y-6">
                        {/* Current Plan Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Crown className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-sm opacity-90">Current Plan</p>
                                <h3 className="text-2xl font-bold capitalize">{subscription.planType}</h3>
                              </div>
                            </div>
                            <Badge className={`${
                              subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                            } text-white border-0`}>
                              {subscription.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                              <p className="text-sm opacity-90">Start Date</p>
                              <p className="font-semibold">{new Date(subscription.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm opacity-90">End Date</p>
                              <p className="font-semibold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {subscription.planType !== 'free' && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Auto Renew</span>
                                <Badge className="bg-white/20 text-white border-0">
                                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Plan Features */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Your Plan Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm">
                                {subscription.features.maxOrders === -1 ? 'Unlimited' : subscription.features.maxOrders} orders per month
                              </span>
                            </div>
                            {subscription.features.freeDelivery && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="text-sm">Free Delivery</span>
                              </div>
                            )}
                            {subscription.features.prioritySupport && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="text-sm">Priority Support</span>
                              </div>
                            )}
                            {subscription.features.exclusiveDeals && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="text-sm">Exclusive Deals</span>
                              </div>
                            )}
                            {subscription.features.cashbackPercentage > 0 && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="text-sm">{subscription.features.cashbackPercentage}% Cashback</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Billing History */}
                        {subscription.billingHistory && subscription.billingHistory.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              Recent Billing History
                            </h4>
                            <div className="space-y-2">
                              {subscription.billingHistory.slice(-5).reverse().map((bill: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Payment - {new Date(bill.date).toLocaleDateString()}
                                      </p>
                                      <p className="text-xs text-gray-500">Transaction: {bill.transactionId}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">₹{bill.amount}</p>
                                    <Badge className={`text-xs ${
                                      bill.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {bill.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => navigate('/subscription-plans')}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            {subscription.planType === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                          </Button>
                          {subscription.planType !== 'free' && (
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel your subscription?')) {
                                  try {
                                    const res = await fetch(`${API_BASE}/api/subscriptions/cancel`, {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    if (res.ok) {
                                      alert('Subscription cancelled successfully');
                                      setActiveTab('subscription');
                                    }
                                  } catch (e) {
                                    alert('Failed to cancel subscription');
                                  }
                                }
                              }}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Crown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                        <Button 
                          onClick={() => navigate('/subscription-plans')}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          View Plans
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;