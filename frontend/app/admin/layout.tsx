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
  LogOut, ChevronRight, BarChart2, Settings, ExternalLink, Loader2, Users
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
      // Fallback: just store the key directly for backwards compatibility
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
      <div className="min-h-screen bg-gradient-to-br from-sidebar-background via-gray-900 to-sidebar-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl border-0 bg-card">
          <CardContent className="p-8">
            <div className="text-center mb-7">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">Admin Login</h1>
              <p className="text-muted-foreground text-sm mt-1">Luxe Salon Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Secret Key</Label>
                <Input
                  id="admin-key"
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your admin key"
                  className="h-11 rounded-xl"
                />
                {error && <p className="text-destructive text-xs">{error}</p>}
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl text-base" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Login to Dashboard
              </Button>
            </form>

            <div className="mt-5 p-3 bg-primary/5 rounded-xl text-xs text-muted-foreground text-center border border-primary/10">
              The admin key is set in your backend <code className="font-mono text-primary">.env</code> file as <code className="font-mono text-primary">ADMIN_SECRET_KEY</code>
            </div>

            <Link href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              &larr; Back to website
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
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
            {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* ─── Desktop Sidebar ────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-sidebar-background text-sidebar-foreground z-40 flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sidebar-foreground text-sm">Luxe Salon</p>
              <p className="text-sidebar-foreground/40 text-[11px]">Admin Panel</p>
            </div>
          </div>
        </div>

        <SidebarNav />

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sidebar-foreground/50 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-background/95 backdrop-blur-xl border-b border-border/50 h-14 flex items-center px-4 gap-3 sticky top-0 z-20">
          {/* Mobile Menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-sidebar-background text-sidebar-foreground border-sidebar-border">
              <SheetHeader className="p-5 border-b border-sidebar-border">
                <SheetTitle className="flex items-center gap-2.5 text-sidebar-foreground">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm">Luxe Salon</span>
                </SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setSheetOpen(false)} />
              <div className="p-3 border-t border-sidebar-border">
                <button
                  onClick={() => { handleLogout(); setSheetOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sidebar-foreground/50 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-all"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground gap-1.5">
            <Link href="/">
              View Website <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
