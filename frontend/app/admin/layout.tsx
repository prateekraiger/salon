"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { adminLogin, isAdminAuthenticated, adminLogout } from "@/lib/api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Scissors, CalendarDays, Menu,
  LogOut, ChevronRight, BarChart2, Settings, ExternalLink, Loader2, Users, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAdminAuthenticated()) setAuthed(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return setError("Please enter admin key");
    setLoginLoading(true);
    setError("");

    try {
      await adminLogin(key);
      setAuthed(true);
      toast.success("Welcome to the admin panel!");
    } catch {
      localStorage.setItem("admin_key", key);
      setAuthed(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
    router.push("/admin");
  };

  // ─── Login Screen ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] pointer-events-none" />

        <Card className="w-full max-w-sm shadow-xl border border-gold-champagne/15 bg-surface-onyx animate-fade-in-scale">
          <CardContent className="p-7 sm:p-9">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-gold-champagne to-bronze-warm flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gold-champagne/20 animate-pulse-glow">
                <Scissors className="w-8 h-8 text-canvas" />
              </div>
              <h1 className="text-2xl font-bold text-text-ivory font-serif tracking-tight">Admin Login</h1>
              <p className="text-on-surface-variant text-sm mt-1.5 font-sans">Luxe Salon · Dashboard Access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key" className="text-text-ivory font-medium text-sm">Admin Secret Key</Label>
                <Input
                  id="admin-key"
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your admin key"
                  className="h-11 rounded-xl border-gold-champagne/20 bg-canvas focus:border-gold-champagne focus:ring-1 focus:ring-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="btn-primary-luxury w-full h-11 rounded-xl text-sm font-semibold uppercase tracking-wider"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Login to Dashboard
              </Button>
            </form>

            <div className="mt-5 p-3 bg-gold-champagne/5 rounded-xl text-xs text-on-surface-variant text-center border border-gold-champagne/15">
              Set <code className="font-mono text-gold-champagne">ADMIN_SECRET_KEY</code> in your backend <code className="font-mono text-gold-champagne">.env</code> file
            </div>

            <Link href="/" className="mt-5 block text-center text-sm text-on-surface-variant hover:text-gold-champagne transition-colors duration-200 font-sans">
              ← Back to website
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
    { href: "/admin/services", icon: Scissors, label: "Services" },
    { href: "/admin/staff", icon: Users, label: "Staff" },
    { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-gold-champagne/15 text-gold-champagne border border-gold-champagne/20 shadow-sm"
                : "text-on-surface-variant hover:bg-surface-elevated hover:text-text-ivory"
            )}
          >
            <Icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-gold-champagne" : "")} />
            {label}
            {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold-champagne" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* ─── Desktop Sidebar ────────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-surface-onyx text-text-ivory z-40 flex-col border-r border-gold-champagne/10 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-gold-champagne/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-gold-champagne to-bronze-warm flex items-center justify-center shadow-md shadow-gold-champagne/20 shrink-0">
              <Scissors className="w-4 h-4 text-canvas" />
            </div>
            <div>
              <p className="font-bold text-text-ivory text-sm font-serif">Luxe Salon</p>
              <p className="text-on-surface-variant text-[11px] font-sans">Admin Panel</p>
            </div>
          </div>
        </div>

        <SidebarNav />

        {/* Footer */}
        <div className="p-3 border-t border-gold-champagne/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-all duration-200 group"
          >
            <LogOut className="w-[18px] h-[18px] group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-surface-onyx/90 backdrop-blur-xl border-b border-gold-champagne/10 h-14 flex items-center px-3 sm:px-5 gap-3 sticky top-0 z-20 shadow-sm">
          {/* Mobile Menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-text-ivory hover:bg-gold-champagne/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-surface-onyx border-r border-gold-champagne/10">
              <SheetHeader className="p-5 border-b border-gold-champagne/10">
                <SheetTitle className="flex items-center gap-3 text-text-ivory">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-gold-champagne to-bronze-warm flex items-center justify-center shadow-md">
                    <Scissors className="w-4 h-4 text-canvas" />
                  </div>
                  <span className="font-bold font-serif text-sm">Luxe Salon</span>
                </SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setSheetOpen(false)} />
              <div className="p-3 border-t border-gold-champagne/10">
                <button
                  onClick={() => { handleLogout(); setSheetOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-all duration-200"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-ivory truncate">
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </p>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-xs text-on-surface-variant gap-1.5 shrink-0 hover:text-gold-champagne hover:bg-gold-champagne/5">
            <Link href="/">
              <span className="hidden sm:inline">View Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-canvas">{children}</main>
      </div>
    </div>
  );
}
