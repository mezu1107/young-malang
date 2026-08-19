import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationKey {
  id: string;
  key_name: string;
  label: string;
  category: string;
  description: string | null;
  value: string;
  is_public: boolean;
  active: boolean;
  sort_order: number;
  updated_at: string;
}

let cache: IntegrationKey[] | null = null;
const listeners = new Set<(rows: IntegrationKey[]) => void>();
let started = false;

const emit = (rows: IntegrationKey[]) => {
  cache = rows;
  listeners.forEach((l) => l(rows));
};

const load = async () => {
  const { data } = await supabase
    .from("integration_keys" as any)
    .select("*")
    .order("sort_order", { ascending: true });
  emit(((data as unknown as IntegrationKey[]) || []));
};

const start = () => {
  if (started) return;
  started = true;
  load();
  supabase
    .channel("integration-keys-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "integration_keys" },
      () => load(),
    )
    .subscribe();
};

/** All integration keys visible to the current user, kept live via realtime. */
export function useIntegrationKeys() {
  const [keys, setKeys] = useState<IntegrationKey[]>(cache || []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    const listener = (rows: IntegrationKey[]) => {
      setKeys(rows);
      setLoading(false);
    };
    listeners.add(listener);
    start();
    if (cache) listener(cache);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const get = (name: string, fallback = "") => {
    const row = keys.find((k) => k.key_name === name);
    return row && row.active && row.value ? row.value : fallback;
  };

  return { keys, loading, get, reload: load };
}

/** Convenience: read a single key value live. */
export function useIntegrationKey(name: string, fallback = "") {
  const { get, loading } = useIntegrationKeys();
  return { value: get(name, fallback), loading };
}
