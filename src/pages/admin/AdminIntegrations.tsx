import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrationKeys, IntegrationKey } from "@/hooks/useIntegrationKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, KeyRound, Plus, Save, Search, Trash2, Zap } from "lucide-react";

const emptyNew = {
  key_name: "",
  label: "",
  category: "Custom",
  description: "",
  value: "",
  is_public: true,
};

export default function AdminIntegrations() {
  const { keys, loading } = useIntegrationKeys();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState(emptyNew);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (next[k.id] === undefined) next[k.id] = k.value;
      });
      return next;
    });
  }, [keys]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = keys.filter(
      (k) =>
        !q ||
        k.label.toLowerCase().includes(q) ||
        k.key_name.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q),
    );
    const map = new Map<string, IntegrationKey[]>();
    filtered.forEach((k) => {
      map.set(k.category, [...(map.get(k.category) || []), k]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [keys, query]);

  const save = async (row: IntegrationKey) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("integration_keys" as any)
      .update({ value: drafts[row.id] ?? "" })
      .eq("id", row.id);
    setSavingId(null);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: `${row.label} is live ⚡`, description: "Applied across the app instantly." });
  };

  const toggleActive = async (row: IntegrationKey, active: boolean) => {
    const { error } = await supabase.from("integration_keys" as any).update({ active }).eq("id", row.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
  };

  const remove = async (row: IntegrationKey) => {
    if (!confirm(`Delete "${row.label}"?`)) return;
    const { error } = await supabase.from("integration_keys" as any).delete().eq("id", row.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: "Key deleted" });
  };

  const addKey = async () => {
    if (!newKey.key_name.trim() || !newKey.label.trim()) {
      toast({ title: "Key name and label are required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("integration_keys" as any).insert({
      ...newKey,
      key_name: newKey.key_name.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_"),
      sort_order: 500,
    });
    if (error) toast({ title: "Add failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Key added ⚡" });
      setNewKey(emptyNew);
      setAdding(false);
    }
  };

  return (
    <AdminLayout title="API Keys & Integrations">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="w-5 h-5" /> All API Keys (A–Z)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Paste any key here and hit save — it goes live across the website, POS and rider app instantly.
              Keys marked <b>Private</b> are only readable by admins.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search maps, whatsapp, payments…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setAdding((v) => !v)}>
              <Plus className="w-4 h-4" /> Add custom key
            </Button>
          </CardContent>
        </Card>

        {adding && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Key name (system id)</Label>
                  <Input
                    value={newKey.key_name}
                    onChange={(e) => setNewKey({ ...newKey, key_name: e.target.value })}
                    placeholder="e.g. tiktok_api_key"
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input
                    value={newKey.label}
                    onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
                    placeholder="TikTok API Key"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newKey.category}
                    onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Value</Label>
                  <Input value={newKey.value} onChange={(e) => setNewKey({ ...newKey, value: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={newKey.is_public}
                  onCheckedChange={(v) => setNewKey({ ...newKey, is_public: v })}
                />
                <span className="text-sm text-muted-foreground">
                  Usable by the public website (turn off for secret server-side keys)
                </span>
              </div>
              <Button onClick={addKey} className="gap-2">
                <Plus className="w-4 h-4" /> Add key
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && <p className="text-muted-foreground text-center py-10">Loading keys…</p>}

        {grouped.map(([category, rows]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {rows.map((row) => {
                const shown = reveal[row.id] || row.is_public;
                return (
                  <div key={row.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-sm font-semibold">{row.label}</Label>
                      <Badge variant={row.is_public ? "secondary" : "outline"}>
                        {row.is_public ? "Public" : "Private"}
                      </Badge>
                      {row.value ? (
                        <Badge className="gap-1">
                          <Zap className="w-3 h-3" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="outline">Empty</Badge>
                      )}
                      <code className="text-xs text-muted-foreground ml-auto">{row.key_name}</code>
                    </div>
                    {row.description && (
                      <p className="text-xs text-muted-foreground">{row.description}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={shown ? "text" : "password"}
                          value={drafts[row.id] ?? ""}
                          onChange={(e) => setDrafts({ ...drafts, [row.id]: e.target.value })}
                          placeholder="Paste value here…"
                        />
                        {!row.is_public && (
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label={shown ? "Hide value" : "Show value"}
                            onClick={() => setReveal({ ...reveal, [row.id]: !reveal[row.id] })}
                          >
                            {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => save(row)}
                          disabled={savingId === row.id || (drafts[row.id] ?? "") === row.value}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" /> {savingId === row.id ? "Saving…" : "Save"}
                        </Button>
                        <Switch
                          checked={row.active}
                          onCheckedChange={(v) => toggleActive(row, v)}
                          aria-label="Enable key"
                        />
                        <Button variant="ghost" size="icon" onClick={() => remove(row)} aria-label="Delete key">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
