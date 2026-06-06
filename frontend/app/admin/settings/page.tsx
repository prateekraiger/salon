"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar, Clock, MapPin, Phone, Mail, Globe, Facebook, Instagram,
  CreditCard, Save, Loader2, Plus, Trash2, Store, Settings as SettingsIcon,
  CalendarDays, CheckCircle, X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSettings, updateSettings, updateBusinessHours, addHoliday, removeHoliday,
  ShopSettings, BusinessHours, Holiday,
} from "@/lib/api";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMEZONES = [
  "Asia/Kolkata", "America/New_York", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney",
];

const CURRENCIES = [
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "AED", symbol: "\u062F.\u0625", name: "UAE Dirham" },
];

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  const [formData, setFormData] = useState({
    salon_name: "", salon_tagline: "", phone: "", email: "",
    address: "", city: "", pincode: "", website: "",
    facebook_url: "", instagram_url: "", whatsapp_number: "",
    timezone: "Asia/Kolkata", currency: "INR",
    advance_booking_days: 30, max_bookings_per_slot: 2,
    allow_cod: true, slot_duration_minutes: 30,
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getSettings();
      if (response.data?.success && response.data?.data) {
        const data = response.data.data as ShopSettings;
        setSettings(data);
        setBusinessHours(data.business_hours || []);
        setHolidays(data.holidays || []);
        setFormData({
          salon_name: data.salon_name || "", salon_tagline: data.salon_tagline || "",
          phone: data.phone || "", email: data.email || "",
          address: data.address || "", city: data.city || "",
          pincode: data.pincode || "", website: data.website || "",
          facebook_url: data.facebook_url || "", instagram_url: data.instagram_url || "",
          whatsapp_number: data.whatsapp_number || "",
          timezone: data.timezone || "Asia/Kolkata", currency: data.currency || "INR",
          advance_booking_days: data.advance_booking_days || 30,
          max_bookings_per_slot: data.max_bookings_per_slot || 2,
          allow_cod: data.allow_cod ?? true, slot_duration_minutes: 30,
        });
      }
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };



  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success("General settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessHours = async () => {
    setIsSaving(true);
    try {
      await updateBusinessHours(businessHours);
      toast.success("Business hours saved successfully!");
    } catch {
      toast.error("Failed to save business hours.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayName) {
      toast.error("Please enter both date and name for the holiday.");
      return;
    }
    try {
      await addHoliday(newHolidayDate, newHolidayName);
      setHolidays([...holidays, { date: newHolidayDate, name: newHolidayName }]);
      setNewHolidayDate(""); setNewHolidayName(""); setShowAddHoliday(false);
      toast.success("Holiday added successfully!");
    } catch {
      toast.error("Failed to add holiday.");
    }
  };

  const handleRemoveHoliday = async (date: string) => {
    try {
      await removeHoliday(date);
      setHolidays(holidays.filter((h) => h.date !== date));
      toast.success("Holiday removed successfully!");
    } catch {
      toast.error("Failed to remove holiday.");
    }
  };

  const updateDaySchedule = (index: number, field: keyof BusinessHours, value: unknown) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-foreground">Salon Settings</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Configure your salon details, business hours, and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Hours</span>
            <span className="sm:hidden">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Holidays</span>
            <span className="sm:hidden">Days Off</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Salon Info */}
            <Card className="border-border/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Salon Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Basic details about your salon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salon_name" className="text-xs sm:text-sm">Salon Name *</Label>
                  <Input id="salon_name" value={formData.salon_name}
                    onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                    placeholder="Your salon name" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon_tagline" className="text-xs sm:text-sm">Tagline</Label>
                  <Input id="salon_tagline" value={formData.salon_tagline}
                    onChange={(e) => setFormData({ ...formData, salon_tagline: e.target.value })}
                    placeholder="Your salon tagline" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-10 rounded-xl" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-10 rounded-xl" placeholder="contact@salon.com" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-border/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Address
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your salon location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs sm:text-sm">Street Address *</Label>
                  <Textarea id="address" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Beauty Street, Fashion District" rows={3} className="rounded-xl resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm">City</Label>
                    <Input id="city" value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Mumbai" className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-xs sm:text-sm">Pincode</Label>
                    <Input id="pincode" value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="400001" className="h-10 rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social & Web */}
            <Card className="border-border/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Social & Web
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Online presence and social links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="pl-10 h-10 rounded-xl" placeholder="https://yoursalon.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      className="pl-10 h-10 rounded-xl" placeholder="https://facebook.com/yoursalon" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      className="pl-10 h-10 rounded-xl" placeholder="https://instagram.com/yoursalon" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">WhatsApp Number</Label>
                  <Input value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="+91 98765 43210" className="h-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-border/30">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Booking Preferences
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configure booking and payment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => <SelectItem key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Advance Booking (Days)</Label>
                    <Input type="number" min={1} max={365} value={formData.advance_booking_days}
                      onChange={(e) => setFormData({ ...formData, advance_booking_days: parseInt(e.target.value) || 30 })}
                      className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Max Bookings/Slot</Label>
                    <Input type="number" min={1} max={10} value={formData.max_bookings_per_slot}
                      onChange={(e) => setFormData({ ...formData, max_bookings_per_slot: parseInt(e.target.value) || 2 })}
                      className="h-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Default Slot Duration</Label>
                  <Select value={String(formData.slot_duration_minutes)}
                    onValueChange={(value) => setFormData({ ...formData, slot_duration_minutes: parseInt(value) })}>
                    <SelectTrigger className="rounded-xl h-10">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5 min-w-0">
                    <Label className="flex items-center gap-2 text-xs sm:text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      Allow Cash on Delivery
                    </Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Enable COD payment option</p>
                  </div>
                  <Switch checked={formData.allow_cod}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_cod: checked })} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} disabled={isSaving} className="gap-2 rounded-xl w-full sm:w-auto">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="space-y-4 sm:space-y-6">
          <Card className="border-border/30">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Weekly Schedule
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Set your salon opening hours for each day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {businessHours.map((day, index) => (
                  <div key={day.day}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/50 bg-background hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 sm:w-36">
                      <Switch checked={day.is_open}
                        onCheckedChange={(checked) => updateDaySchedule(index, "is_open", checked)} />
                      <span className="font-medium text-sm">{day.day}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 pl-10 sm:pl-0">
                      {day.is_open ? (
                        <>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />Open
                          </Badge>
                          <div className="flex items-center gap-2 ml-2 sm:ml-4">
                            <Input type="time" value={day.open_time}
                              onChange={(e) => updateDaySchedule(index, "open_time", e.target.value)}
                              className="w-[110px] sm:w-24 h-9 rounded-lg text-xs sm:text-sm" />
                            <span className="text-muted-foreground text-xs">to</span>
                            <Input type="time" value={day.close_time}
                              onChange={(e) => updateDaySchedule(index, "close_time", e.target.value)}
                              className="w-[110px] sm:w-24 h-9 rounded-lg text-xs sm:text-sm" />
                          </div>
                        </>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                          <X className="h-3 w-3 mr-1" />Closed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveBusinessHours} disabled={isSaving} className="gap-2 rounded-xl w-full sm:w-auto">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Business Hours
            </Button>
          </div>
        </TabsContent>

        {/* Holidays */}
        <TabsContent value="holidays" className="space-y-4 sm:space-y-6">
          <Card className="border-border/30">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Holidays & Special Days
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Mark days when your salon will be closed</CardDescription>
              </div>
              <Button onClick={() => setShowAddHoliday(true)} className="gap-2 rounded-xl text-xs sm:text-sm w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Add Holiday
              </Button>
            </CardHeader>
            <CardContent>
              {holidays.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <CalendarDays className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No holidays added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add holidays when your salon will be closed</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {holidays.map((holiday) => (
                    <div key={holiday.date}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border/50 bg-background hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{holiday.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(holiday.date)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveHoliday(holiday.date)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Holiday Dialog */}
      <Dialog open={showAddHoliday} onOpenChange={setShowAddHoliday}>
        <DialogContent className="sm:max-w-md rounded-2xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Add Holiday
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Add a day when your salon will be closed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Date *</Label>
              <Input type="date" value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Holiday Name *</Label>
              <Input value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="e.g., Christmas, New Year" className="h-10 rounded-xl" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddHoliday(false)} className="rounded-xl w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleAddHoliday} disabled={!newHolidayDate || !newHolidayName}
              className="gap-2 rounded-xl w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
