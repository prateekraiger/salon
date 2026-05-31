"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  CreditCard,
  Save,
  Loader2,
  Plus,
  Trash2,
  Store,
  Settings as SettingsIcon,
  CalendarDays,
  DollarSign,
  Users,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getSettings,
  updateSettings,
  updateBusinessHours,
  addHoliday,
  removeHoliday,
  ShopSettings,
  BusinessHours,
  Holiday,
} from "@/lib/api";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    salon_name: "",
    salon_tagline: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    website: "",
    facebook_url: "",
    instagram_url: "",
    whatsapp_number: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    advance_booking_days: 30,
    max_bookings_per_slot: 2,
    allow_cod: true,
    slot_duration_minutes: 30,
  });

  useEffect(() => {
    loadSettings();
  }, []);

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
          salon_name: data.salon_name || "",
          salon_tagline: data.salon_tagline || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          pincode: data.pincode || "",
          website: data.website || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          whatsapp_number: data.whatsapp_number || "",
          timezone: data.timezone || "Asia/Kolkata",
          currency: data.currency || "INR",
          advance_booking_days: data.advance_booking_days || 30,
          max_bookings_per_slot: data.max_bookings_per_slot || 2,
          allow_cod: data.allow_cod ?? true,
          slot_duration_minutes: 30,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings. Using demo data.",
        variant: "destructive",
      });
      // Demo data fallback
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    const demoBusinessHours: BusinessHours[] = WEEKDAYS.map((day, index) => ({
      day,
      day_index: index,
      is_open: index !== 0, // Closed on Sunday
      open_time: "09:00",
      close_time: "19:00",
      slot_duration_minutes: 30,
    }));

    const demoHolidays: Holiday[] = [
      { date: "2024-12-25", name: "Christmas" },
      { date: "2025-01-01", name: "New Year's Day" },
    ];

    setBusinessHours(demoBusinessHours);
    setHolidays(demoHolidays);
    setFormData({
      salon_name: "Luxe Salon",
      salon_tagline: "Where Beauty Meets Excellence",
      phone: "+91 98765 43210",
      email: "contact@luxesalon.com",
      address: "123 Beauty Street, Fashion District",
      city: "Mumbai",
      pincode: "400001",
      website: "https://luxesalon.com",
      facebook_url: "https://facebook.com/luxesalon",
      instagram_url: "https://instagram.com/luxesalon",
      whatsapp_number: "+91 98765 43210",
      timezone: "Asia/Kolkata",
      currency: "INR",
      advance_booking_days: 30,
      max_bookings_per_slot: 2,
      allow_cod: true,
      slot_duration_minutes: 30,
    });
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast({
        title: "Success",
        description: "General settings saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Demo Mode",
        description: "Settings would be saved in production.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessHours = async () => {
    setIsSaving(true);
    try {
      await updateBusinessHours(businessHours);
      toast({
        title: "Success",
        description: "Business hours saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Demo Mode",
        description: "Business hours would be saved in production.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayName) {
      toast({
        title: "Validation Error",
        description: "Please enter both date and name for the holiday.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addHoliday(newHolidayDate, newHolidayName);
      setHolidays([...holidays, { date: newHolidayDate, name: newHolidayName }]);
      setNewHolidayDate("");
      setNewHolidayName("");
      setShowAddHoliday(false);
      toast({
        title: "Success",
        description: "Holiday added successfully!",
      });
    } catch (error) {
      // Demo mode: just add locally
      setHolidays([...holidays, { date: newHolidayDate, name: newHolidayName }]);
      setNewHolidayDate("");
      setNewHolidayName("");
      setShowAddHoliday(false);
      toast({
        title: "Demo Mode",
        description: "Holiday would be saved in production.",
      });
    }
  };

  const handleRemoveHoliday = async (date: string) => {
    try {
      await removeHoliday(date);
      setHolidays(holidays.filter((h) => h.date !== date));
      toast({
        title: "Success",
        description: "Holiday removed successfully!",
      });
    } catch (error) {
      setHolidays(holidays.filter((h) => h.date !== date));
      toast({
        title: "Demo Mode",
        description: "Holiday would be removed in production.",
      });
    }
  };

  const updateDaySchedule = (index: number, field: keyof BusinessHours, value: unknown) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Salon Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure your salon details, business hours, and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-rose-500 data-[state=active]:text-white gap-2"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="hours"
            className="data-[state=active]:bg-rose-500 data-[state=active]:text-white gap-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger
            value="holidays"
            className="data-[state=active]:bg-rose-500 data-[state=active]:text-white gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Holidays</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Salon Info */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-rose-500" />
                  Salon Information
                </CardTitle>
                <CardDescription>
                  Basic details about your salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salon_name">Salon Name *</Label>
                  <Input
                    id="salon_name"
                    value={formData.salon_name}
                    onChange={(e) =>
                      setFormData({ ...formData, salon_name: e.target.value })
                    }
                    placeholder="Your salon name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon_tagline">Tagline</Label>
                  <Input
                    id="salon_tagline"
                    value={formData.salon_tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, salon_tagline: e.target.value })
                    }
                    placeholder="Your salon tagline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      placeholder="contact@salon.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" />
                  Address
                </CardTitle>
                <CardDescription>
                  Your salon location details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="123 Beauty Street, Fashion District"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      placeholder="400001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social & Web */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-rose-500" />
                  Social & Web
                </CardTitle>
                <CardDescription>
                  Online presence and social links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="pl-10"
                      placeholder="https://yoursalon.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook_url: e.target.value })
                      }
                      className="pl-10"
                      placeholder="https://facebook.com/yoursalon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram_url: e.target.value })
                      }
                      className="pl-10"
                      placeholder="https://instagram.com/yoursalon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_number: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-rose-500" />
                  Booking Preferences
                </CardTitle>
                <CardDescription>
                  Configure booking and payment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance_booking_days">
                      Advance Booking (Days)
                    </Label>
                    <Input
                      id="advance_booking_days"
                      type="number"
                      min={1}
                      max={365}
                      value={formData.advance_booking_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          advance_booking_days: parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_bookings_per_slot">
                      Max Bookings/Slot
                    </Label>
                    <Input
                      id="max_bookings_per_slot"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.max_bookings_per_slot}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_bookings_per_slot: parseInt(e.target.value) || 2,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot_duration">Default Slot Duration</Label>
                  <Select
                    value={String(formData.slot_duration_minutes)}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        slot_duration_minutes: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_DURATIONS.map((duration) => (
                        <SelectItem key={duration} value={String(duration)}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      Allow Cash on Delivery
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enable COD payment option for bookings
                    </p>
                  </div>
                  <Switch
                    checked={formData.allow_cod}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allow_cod: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Set your salon opening hours for each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {businessHours.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 sm:w-32">
                        <Switch
                          checked={day.is_open}
                          onCheckedChange={(checked) =>
                            updateDaySchedule(index, "is_open", checked)
                          }
                        />
                        <span className="font-medium">{day.day}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {day.is_open ? (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Open
                            </Badge>
                            <div className="flex items-center gap-2 ml-4">
                              <Input
                                type="time"
                                value={day.open_time}
                                onChange={(e) =>
                                  updateDaySchedule(index, "open_time", e.target.value)
                                }
                                className="w-24"
                              />
                              <span className="text-gray-400">to</span>
                              <Input
                                type="time"
                                value={day.close_time}
                                onChange={(e) =>
                                  updateDaySchedule(index, "close_time", e.target.value)
                                }
                                className="w-24"
                              />
                            </div>
                          </>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            <X className="h-3 w-3 mr-1" />
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveBusinessHours}
              disabled={isSaving}
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Business Hours
            </Button>
          </div>
        </TabsContent>

        {/* Holidays */}
        <TabsContent value="holidays" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-rose-500" />
                  Holidays & Special Days
                </CardTitle>
                <CardDescription>
                  Mark days when your salon will be closed
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddHoliday(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            </CardHeader>
            <CardContent>
              {holidays.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No holidays added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add holidays when your salon will be closed
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.date}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-rose-500" />
                        </div>
                        <div>
                          <p className="font-medium">{holiday.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(holiday.date)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveHoliday(holiday.date)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-rose-500" />
              Add Holiday
            </DialogTitle>
            <DialogDescription>
              Add a day when your salon will be closed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holiday_date">Date *</Label>
              <Input
                id="holiday_date"
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday_name">Holiday Name *</Label>
              <Input
                id="holiday_name"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="e.g., Christmas, New Year"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHoliday(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddHoliday}
              disabled={!newHolidayDate || !newHolidayName}
              className="bg-rose-500 hover:bg-rose-600 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
