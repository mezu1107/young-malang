import { useEffect, useMemo, useState } from "react";
import POSLayout from "@/components/pos/POSLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Search, ShoppingBag, User } from "lucide-react";

interface CustomerRow {
  name: string;
  phone: string;
  address: string;
  orders: number;
  spent: number;
  last: string;
}

const money = (n: number) => `Rs. ${Number(n || 0).toLocaleString()}`;

export default function POSCustomers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("customer_name, customer_phone, customer_address, total, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      const map = new Map<string, CustomerRow>();
      (data || []).forEach((o: any) => {
        const keyId = (o.customer_phone || o.customer_name || "walk-in").trim();
        const prev = map.get(keyId);
        map.set(keyId, {
          name: o.customer_name || prev?.name || "Walk-in customer",
          phone: o.customer_phone || prev?.phone || "",
          address: o.customer_address || prev?.address || "",
          orders: (prev?.orders || 0) + 1,
          spent: (prev?.spent || 0) + Number(o.total || 0),
          last: prev?.last || o.created_at,
        });
      });

      setRows(Array.from(map.values()).sort((a, b) => b.spent - a.spent));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.address.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <POSLayout title="Customers">
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, phone or address…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No customers found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <Card key={`${c.phone}-${i}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold truncate">{c.name}</span>
                    <Badge variant="secondary" className="ml-auto gap-1">
                      <ShoppingBag className="w-3 h-3" /> {c.orders}
                    </Badge>
                  </div>
                  {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                  {c.address && <p className="text-xs text-muted-foreground line-clamp-2">{c.address}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">{money(c.spent)}</span>
                    {c.phone && (
                      <a href={`tel:${c.phone}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </POSLayout>
  );
}
