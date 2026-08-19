import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { BUSINESS } from "@/lib/contact";
import { useIntegrationKeys } from "@/hooks/useIntegrationKeys";

const FloatingWhatsApp = () => {
  const { get } = useIntegrationKeys();
  const number = get("whatsapp_business_number", BUSINESS.whatsapp).replace(/[^0-9]/g, "");

  return (
    <motion.a
      href={`https://wa.me/${number}?text=${encodeURIComponent(
        `Assalam o Alaikum! I want to order from ${BUSINESS.name}`,
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-50 group flex items-center gap-2 pl-3 pr-4 py-3 bg-primary text-primary-foreground rounded-full shadow-xl border border-accent/30"
      aria-label="Order on WhatsApp"
    >
      <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
        <Phone className="w-4 h-4" />
      </span>
      <span className="text-sm font-semibold tracking-wide hidden sm:inline">Order Now</span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
    </motion.a>
  );
};

export default FloatingWhatsApp;
