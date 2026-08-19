import { useIntegrationKeys } from "@/hooks/useIntegrationKeys";

interface Props {
  /** Rider live position */
  rider?: { lat: number; lng: number } | null;
  /** Destination (customer) position */
  destination?: { lat: number; lng: number } | null;
  /** Free-text fallback location (address / city) */
  query?: string;
  height?: number;
  title?: string;
}

/**
 * Live map. Uses the Google Maps key from Admin → API Keys when present
 * (directions view with rider + destination), otherwise a keyless embed.
 */
export default function LiveTrackingMap({
  rider,
  destination,
  query = "Rawalpindi, Pakistan",
  height = 360,
  title = "Live tracking map",
}: Props) {
  const { get } = useIntegrationKeys();
  const key = get("google_maps_api_key");

  let src: string;
  if (key && rider && destination) {
    src = `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${rider.lat},${rider.lng}&destination=${destination.lat},${destination.lng}&mode=driving`;
  } else if (key && (rider || destination)) {
    const p = (rider || destination)!;
    src = `https://www.google.com/maps/embed/v1/view?key=${key}&center=${p.lat},${p.lng}&zoom=15&maptype=roadmap`;
  } else if (rider || destination) {
    const p = (rider || destination)!;
    src = `https://www.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`;
  } else {
    src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20" style={{ height }}>
      <iframe src={src} title={title} loading="lazy" className="w-full h-full border-0" />
    </div>
  );
}
