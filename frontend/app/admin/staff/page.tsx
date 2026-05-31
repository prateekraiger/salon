"use client";
import { useState, useEffect } from "react";
import {
  getStaffMembers,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffActive,
  Staff,
  StaffFormData,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Users,
  Star,
  Search,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const DESIGNATIONS = [
  "Hair Stylist",
  "Senior Stylist",
  "Colorist",
  "Makeup Artist",
  "Beautician",
  "Spa Therapist",
  "Nail Technician",
  "Salon Manager",
  "Receptionist",
  "Other",
];

const SPECIALTIES = [
  "Hair Cutting",
  "Hair Coloring",
  "Bridal Makeup",
  "Facial & Skincare",
  "Nail Art",
  "Massage Therapy",
  "Keratin Treatment",
  "Manicure & Pedicure",
];

const EMPTY_FORM: StaffFormData = {
  name: "",
  email: "",
  phone: "",
  designation: "Hair Stylist",
  specialties: [],
  experience_years: 0,
  bio: "",
  image_url: "",
  is_active: true,
  rating: 0,
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await getStaffMembers();
      setStaff(res.data.data || []);
    } catch {
      toast.error("Failed to load staff members");
      // Demo data fallback
      setStaff(DEMO_STAFF);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      designation: s.designation,
      specialties: s.specialties || [],
      experience_years: s.experience_years || 0,
      bio: s.bio || "",
      image_url: s.image_url || "",
      is_active: s.is_active,
      rating: s.rating || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Staff name is required");
    if (!form.designation) return toast.error("Designation is required");

    setSaving(true);
    try {
      if (editing) {
        await updateStaff(editing.id, form);
        toast.success("Staff member updated!");
      } else {
        await createStaff(form);
        toast.success("Staff member added!");
      }
      setShowModal(false);
      fetchStaff();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from staff?`)) return;
    setDeletingId(id);
    try {
      await deleteStaff(id);
      toast.success("Staff member removed");
      fetchStaff();
    } catch {
      toast.error("Failed to remove staff member");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStaffActive(id, !currentStatus);
      toast.success(currentStatus ? "Staff deactivated" : "Staff activated");
      fetchStaff();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.designation.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialties || []).some((sp) =>
        sp.toLowerCase().includes(search.toLowerCase())
      );
    const matchesFilter =
      filterActive === null || s.is_active === filterActive;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground text-sm">
            {staff.length} team members ·{" "}
            {staff.filter((s) => s.is_active).length} active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Staff",
            value: staff.length,
            icon: Users,
            color: "bg-blue-500",
          },
          {
            label: "Active",
            value: staff.filter((s) => s.is_active).length,
            icon: Check,
            color: "bg-green-500",
          },
          {
            label: "Stylists",
            value: staff.filter((s) => s.designation.includes("Stylist")).length,
            icon: Briefcase,
            color: "bg-purple-500",
          },
          {
            label: "Avg Rating",
            value:
              staff.length > 0
                ? (
                    staff.reduce((acc, s) => acc + (s.rating || 0), 0) /
                    staff.length
                  ).toFixed(1)
                : "0.0",
            icon: Star,
            color: "bg-amber-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/30 py-4 gap-0">
            <CardContent className="p-4 pt-0 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/30 py-0 gap-0">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background flex-1">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, designation, or specialty..."
              className="text-sm bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterActive === null ? "all" : filterActive ? "active" : "inactive"}
              onChange={(e) => {
                const val = e.target.value;
                setFilterActive(
                  val === "all" ? null : val === "active" ? true : false
                );
              }}
              className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary text-foreground"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card className="text-center border-border/30 py-16">
          <CardContent>
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="font-medium text-muted-foreground">No staff members found</p>
            <Button onClick={openCreate} className="mt-4 rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add First Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((s) => (
            <Card
              key={s.id}
              className={cn(
                "border-border/30 transition-all group overflow-hidden py-0 gap-0",
                !s.is_active && "opacity-60"
              )}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border-2 border-background shadow-md">
                      <AvatarImage src={s.image_url} alt={s.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate">
                        {s.name}
                      </h3>
                      <p className="text-xs text-primary font-medium">
                        {s.designation}
                      </p>
                      {s.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">
                            {s.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={() => handleToggleActive(s.id, s.is_active)}
                      className="scale-75"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-4">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.experience_years > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{s.experience_years} years experience</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {s.specialties && s.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {s.specialties.slice(0, 3).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="secondary"
                          className="text-[10px] font-medium"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {s.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{s.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {s.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {s.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <Badge
                    variant={s.is_active ? "default" : "secondary"}
                    className={cn(
                      "text-[10px]",
                      s.is_active
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(s)}
                      className="text-primary hover:bg-primary/10"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={deletingId === s.id}
                      className="text-destructive hover:bg-destructive/10"
                      title="Remove"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the staff member details below."
                : "Fill in the details for the new staff member."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g., Priya Sharma"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="priya@luxesalon.com"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Designation *</Label>
                <Select
                  value={form.designation}
                  onValueChange={(value) =>
                    setForm({ ...form, designation: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={form.experience_years}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experience_years: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  placeholder="5"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating (0-5)</Label>
                <Input
                  type="number"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rating:
                        Math.min(
                          5,
                          Math.max(0, parseFloat(e.target.value) || 0)
                        ) || 0,
                    })
                  }
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => {
                        const current = form.specialties || [];
                        const updated = current.includes(specialty)
                          ? current.filter((s) => s !== specialty)
                          : [...current, specialty];
                        setForm({ ...form, specialties: updated });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        form.specialties?.includes(specialty)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Bio</Label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief description about the staff member..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring focus:border-ring resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_active: checked })
                  }
                />
                <Label className="cursor-pointer">Active (visible to customers)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? "Saving..." : editing ? "Update Staff" : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Demo data for fallback
const DEMO_STAFF: Staff[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya@luxesalon.com",
    phone: "+91 98765 43210",
    designation: "Senior Stylist",
    specialties: ["Hair Cutting", "Hair Coloring", "Bridal Makeup"],
    experience_years: 8,
    bio: "Expert in bridal transformations with 8+ years of experience in premium salons.",
    image_url: "",
    is_active: true,
    rating: 4.9,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Ananya Kapoor",
    email: "ananya@luxesalon.com",
    phone: "+91 98765 43211",
    designation: "Makeup Artist",
    specialties: ["Bridal Makeup", "Facial & Skincare"],
    experience_years: 6,
    bio: "Award-winning makeup artist specializing in natural and glamorous looks.",
    image_url: "",
    is_active: true,
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Meera Reddy",
    email: "meera@luxesalon.com",
    phone: "+91 98765 43212",
    designation: "Spa Therapist",
    specialties: ["Massage Therapy", "Facial & Skincare"],
    experience_years: 5,
    bio: "Certified spa therapist with expertise in relaxation and therapeutic massages.",
    image_url: "",
    is_active: true,
    rating: 4.7,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Riya Patel",
    email: "riya@luxesalon.com",
    phone: "+91 98765 43213",
    designation: "Nail Technician",
    specialties: ["Nail Art", "Manicure & Pedicure"],
    experience_years: 4,
    bio: "Creative nail artist known for intricate designs and attention to detail.",
    image_url: "",
    is_active: true,
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
];
