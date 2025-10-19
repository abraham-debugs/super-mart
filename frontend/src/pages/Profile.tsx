import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { AddressBook } from "@/components/AddressBook";

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

  const [activeTab, setActiveTab] = useState<"account" | "orders" | "addresses">("account");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and preferences.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border">
                  <img alt="Avatar" className="h-full w-full object-cover" src="https://api.dicebear.com/7.x/initials/svg?seed=U" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Update your personal details on the right.</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setActiveTab("account")} className={`px-3 py-2 rounded ${activeTab === "account" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Account</button>
                  <button type="button" onClick={() => setActiveTab("orders")} className={`px-3 py-2 rounded ${activeTab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>My Orders</button>
                  <button type="button" onClick={() => setActiveTab("addresses")} className={`px-3 py-2 rounded ${activeTab === "addresses" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Addresses</button>
                </div>
              </div>

              {activeTab === "account" ? (
                <form onSubmit={save}>
                  {error && <div className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                      <input id="name" type="text" placeholder="John Doe" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">Email</label>
                      <input id="email" type="email" placeholder="you@example.com" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={email} readOnly />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="phone">Phone</label>
                      <input id="phone" type="tel" placeholder="+1 555 000 1234" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium" htmlFor="address">Address</label>
                      <textarea id="address" rows={3} placeholder="Street, City, State, ZIP" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="flex items-center gap-3">
                      <button type="submit" className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:from-primary/90 hover:to-accent/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{saving ? "Saving..." : "Save Changes"}</button>
                      <button type="button" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-primary/10" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
                    </div>
                  </div>
                </form>
              ) : activeTab === "orders" ? (
                <div>
                  {ordersLoading ? (
                    <div className="py-8 text-center">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-8 text-center">You have no orders yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const steps = ["placed", "shipped", "delivered"];
                        // determine the current step index
                        let currentIndex = steps.indexOf(order.status);
                        if (currentIndex === -1) {
                          if (order.status === "paid") currentIndex = 0;
                          else if (order.status === "cancelled") currentIndex = -1;
                          else currentIndex = 0;
                        }

                        return (
                          <div key={order._id} className="p-4 border rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Order ID: {order._id}</div>
                                <div className="font-medium capitalize">{order.status}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">₹{Number(order.total).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                              </div>
                            </div>

                            {/* Status tracker */}
                            <div className="mt-4">
                              <div className="flex items-center">
                                {steps.map((s, idx) => {
                                  const done = currentIndex >= idx;
                                  return (
                                    <div key={s} className="flex items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
                                        {done ? <Check size={16} /> : <span className="text-xs">{idx + 1}</span>}
                                      </div>
                                      <div className="ml-3 text-sm">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                                      {idx < steps.length - 1 && (
                                        <div className={`h-1 flex-1 mx-4 ${currentIndex > idx ? "bg-green-500" : "bg-gray-200"}`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="text-sm font-medium">Items:</div>
                              <ul className="mt-2 space-y-1">
                                {order.items.map((it: any) => (
                                  <li key={String(it.productId)} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <img src={it.imageUrl} alt={it.name} className="w-10 h-10 object-cover rounded" />
                                      <div>
                                        <div className="text-sm">{it.name}</div>
                                        <div className="text-xs text-muted-foreground">Qty: {it.quantity}</div>
                                      </div>
                                    </div>
                                    <div className="text-sm">₹{Number(it.price * it.quantity).toFixed(2)}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <AddressBook showActions />
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="text-sm font-semibold">Security</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">New Password</label>
                  <input id="password" type="password" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="confirm">Confirm Password</label>
                  <input id="confirm" type="password" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-primary/10">Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;