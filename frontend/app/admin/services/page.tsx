"use client";
import { useState, useEffect } from "react";
import { getServices, createService, updateService, deleteService, Service, ServiceFormData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Check, Scissors } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Hair", "Skin", "Nails", "Spa", "Bridal", "Makeup", "Other"];

const EMPTY_FORM: ServiceFormData = {
  name: "", description: "", price: 0, duration_minutes: 30,
  category: "Hair", image_url: "", is_active: true
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await getServices();
      setServices(res.data.data || []);
    } catch { toast.error("Failed to load services"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description, price: s.price, duration_minutes: s.duration_minutes, category: s.category, image_url: s.image_url || "", is_active: s.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Service name is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.price || form.price <= 0) return toast.error("Price must be greater than 0");

    setSaving(true);
    try {
      if (editing) {
        await updateService(editing.id, form);
        toast.success("Service updated!");
      } else {
        await createService(form);
        toast.success("Service created!");
      }
      setShowModal(false);
      fetchServices();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteService(id);
      toast.success("Service deactivated");
      fetchServices();
    } catch { toast.error("Failed to deactivate"); }
    finally { setDeletingId(null); }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const s = services.filter((sv) => sv.category === cat);
    if (s.length > 0) acc[cat] = s;
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm">{services.length} active services</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {/* Service List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : services.length === 0 ? (
        <Card className="text-center border-border/30 py-16">
          <CardContent>
            <Scissors className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="font-medium text-muted-foreground">No services yet</p>
            <Button onClick={openCreate} className="mt-4 rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border/50" />
                <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">{cat}</Badge>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s) => (
                  <Card key={s.id} className="border-border/30 hover:border-primary/20 transition-all group py-0 gap-0">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate text-sm">{s.name}</p>
                          <p className="text-xs text-primary font-medium">{s.category}</p>
                        </div>
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0 mt-1 ml-2",
                          s.is_active ? "bg-green-400" : "bg-muted-foreground/30"
                        )} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{s.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-extrabold text-foreground">₹{s.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{s.duration_minutes} min</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}
                            className="text-primary hover:bg-primary/10" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id, s.name)}
                            disabled={deletingId === s.id}
                            className="text-destructive hover:bg-destructive/10" title="Deactivate">
                            {deletingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the service details below." : "Fill in the details for the new service."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>Service Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Classic Haircut" className="h-10 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  min="0" placeholder="499" className="h-10 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })}
                  min="5" step="5" placeholder="45" className="h-10 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label>Image URL (Optional)</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..." className="h-10 rounded-xl" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this service..." rows={3} className="rounded-xl resize-none" />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label className="cursor-pointer">Active (visible to customers)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving..." : editing ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
