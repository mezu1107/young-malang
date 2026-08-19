import RiderLayout from "@/components/rider/RiderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRiderLocationBroadcast } from "@/hooks/useRiderTracking";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { MapPin, Navigation, Phone, Radio } from "lucide-react";

const RiderMap = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [sharing, setSharing] = useState(true);
  const { position, error } = useRiderLocationBroadcast(sharing);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("rider_id", user.id)
      .in("status", ["confirmed", "preparing", "out_for_delivery", "out for delivery"])
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  const target = orders.find((o) => o.delivery_lat && o.delivery_lng);
  const destination = target ? { lat: Number(target.delivery_lat), lng: Number(target.delivery_lng) } : null;

  return (
    <RiderLayout title="Live Map">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-heading font-bold">Delivery Map</h1>
          <Badge variant={position ? "default" : "outline"} className="gap-1">
            <Radio className="w-3 h-3" /> {position ? "Live GPS on" : "Waiting for GPS"}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => setSharing((v) => !v)} className="ml-auto">
            {sharing ? "Stop sharing location" : "Start sharing location"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">Location error: {error}</p>}

        <Card>
          <CardContent className="p-0">
            <LiveTrackingMap
              rider={position ? { lat: position.lat, lng: position.lng } : null}
              destination={destination}
              height={400}
              title="Rider live map"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Drop-offs ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No active deliveries.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{o.customer_name || "Customer"}</p>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {o.customer_address || "—"}
                    </p>
                    {o.customer_phone && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {o.customer_phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href={
                        o.delivery_lat && o.delivery_lng
                          ? `https://www.google.com/maps/dir/?api=1&destination=${o.delivery_lat},${o.delivery_lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customer_address || "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="gap-1">
                        <Navigation className="w-3 h-3" /> Navigate
                      </Button>
                    </a>
                    {o.customer_phone && (
                      <a href={`tel:${o.customer_phone}`}>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </RiderLayout>
  );
};

export default RiderMap;
