import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

type ListItem = {
  _id: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
};

const Saved: React.FC = () => {
  const { token } = useAuth() as any;
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/user/save-later`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setItems(data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Saved for later</h1>
        <p className="mt-1 text-sm text-muted-foreground">Items you saved to revisit.</p>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No saved items.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Card key={p._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted/40">
                    <img src={p.imageUrl} alt={p.nameEn} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-2">{p.nameEn}</div>
                    <div className="mt-1 text-sm">₹{p.price}</div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1">Add to Cart</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => window.location.href = "/"}>Shop More</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;













