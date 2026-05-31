"use client";
import { useState, useEffect } from "react";
import { getServices, createService, updateService, deleteService, Service, ServiceFormData } from "@/lib/api";
import { Plus, Pencil, Trash2, Loader2, X, Check, Scissors } from "lucide-react";
import toast from "react-hot-toast";

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
          <h1 className="text-2xl font-extrabold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm">{services.length} active services</p>
        </div>
        <button onClick={openCreate}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Service List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-sm border border-gray-100">
          <Scissors className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No services yet</p>
          <button onClick={openCreate} className="mt-4 btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
            Add First Service
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-200" />
                {cat}
                <div className="h-px flex-1 bg-gray-200" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-amber-200 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{s.name}</p>
                        <p className="text-xs text-amber-700 font-medium">{s.category}</p>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ml-2 ${s.is_active ? "bg-green-400" : "bg-gray-300"}`} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{s.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-extrabold text-gray-900">₹{s.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{s.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(s)}
                          className="p-2 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)}
                          disabled={deletingId === s.id}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50" title="Deactivate">
                          {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4 animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "Edit Service" : "Add New Service"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Classic Haircut"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    min="0" placeholder="499"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (minutes) *</label>
                  <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })}
                    min="5" step="5" placeholder="45"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL (Optional)</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this service..."
                    rows={3}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 resize-none" />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving..." : editing ? "Update Service" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
