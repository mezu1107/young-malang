import RiderLayout from "@/components/rider/RiderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RiderDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [expiry, setExpiry] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("rider_documents" as any).select("*").eq("rider_id", user.id).order("created_at", { ascending: false });
    setDocs((data as any[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!docType) { toast({ title: "Document type required", variant: "destructive" }); return; }
    const { error } = await supabase.from("rider_documents" as any).insert({
      rider_id: user!.id, doc_type: docType, file_url: fileUrl, expiry_date: expiry || null,
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Document added! 📄" }); setOpen(false); setDocType(""); setFileUrl(""); setExpiry(""); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("rider_documents" as any).delete().eq("id", id);
    load();
  };

  return (
    <RiderLayout title="Documents">
      <div className="max-w-3xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> My Documents</h1>
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
        </div>
        {docs.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No documents yet. Add your CNIC, license, etc.</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docs.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{d.doc_type}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${d.status === "approved" ? "bg-green-100 text-green-800" : d.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{d.status}</span>
                    {d.expiry_date && <p className="text-xs text-muted-foreground mt-1">Expires: {d.expiry_date}</p>}
                    {d.file_url && <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block">View file</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(d.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label>Document Type *</Label><Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="e.g. CNIC, Driving License" /></div>
              <div><Label>File URL</Label><Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
              <Button onClick={add} className="w-full">Save Document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RiderLayout>
  );
};
export default RiderDocuments;
