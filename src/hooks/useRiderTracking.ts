import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIntegrationKeys } from "@/hooks/useIntegrationKeys";

export interface RiderPosition {
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  is_online?: boolean;
  updated_at?: string;
}

/** Broadcasts the signed-in rider's GPS position to the database. */
export function useRiderLocationBroadcast(enabled = true) {
  const { user } = useAuth();
  const { get } = useIntegrationKeys();
  const [position, setPosition] = useState<RiderPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSent = useRef(0);

  const intervalSec = Number(get("rider_tracking_interval_sec", "15")) || 15;

  useEffect(() => {
    if (!enabled || !user || typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const next: RiderPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        };
        setPosition(next);
        setError(null);

        const now = Date.now();
        if (now - lastSent.current < intervalSec * 1000) return;
        lastSent.current = now;

        await supabase.from("rider_locations" as any).upsert(
          {
            rider_id: user.id,
            lat: next.lat,
            lng: next.lng,
            heading: next.heading ?? null,
            speed: next.speed ?? null,
            is_online: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "rider_id" },
        );
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, user, intervalSec]);

  return { position, error };
}

/** Watches one rider's live position (for customers / admin). */
export function useRiderPosition(riderId?: string | null) {
  const [position, setPosition] = useState<RiderPosition | null>(null);

  useEffect(() => {
    if (!riderId) {
      setPosition(null);
      return;
    }
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("rider_locations" as any)
        .select("*")
        .eq("rider_id", riderId)
        .maybeSingle();
      if (active && data) setPosition(data as unknown as RiderPosition);
    };
    load();

    const channel = supabase
      .channel(`rider-location-${riderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rider_locations", filter: `rider_id=eq.${riderId}` },
        (payload) => setPosition(payload.new as unknown as RiderPosition),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [riderId]);

  return position;
}
