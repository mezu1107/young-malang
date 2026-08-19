import RiderLayout from "@/components/rider/RiderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Navigation, Phone, ExternalLink } from "lucide-react";

const RiderMap = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("rider_id", user.id)
      .in("status", ["confirmed", "preparing", "out for delivery"])
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  return (
    <RiderLayout title="Live Map">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Delivery Map</h1>
        <Card>
          <CardContent className="p-0 h-[400px] overflow-hidden rounded-lg">
            <iframe
              src="https://www.google.com/maps?q=Rawalpindi&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              title="Delivery map"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active Drop-offs ({orders.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No active deliveries.</p>
            ) : orders.map((o) => (
              <div key={o.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{o.customer_name || "Customer"}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {o.customer_address || "—"}</p>
                  {o.customer_phone && <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" /> {o.customer_phone}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customer_address || "")}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1"><Navigation className="w-3 h-3" /> Navigate</Button>
                  </a>
                  {o.customer_phone && (
                    <a href={`tel:${o.customer_phone}`}><Button size="sm" variant="ghost" className="gap-1"><Phone className="w-3 h-3" /> Call</Button></a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RiderLayout>
  );
};

export default RiderMap;
