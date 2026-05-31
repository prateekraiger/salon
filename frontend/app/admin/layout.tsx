"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Scissors, CalendarDays, Menu, X,
  LogOut, ChevronRight, BarChart2
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("admin_key");
    if (stored) setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return setError("Please enter admin key");
    localStorage.setItem("admin_key", key);
    setAuthed(true);
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_key");
    setAuthed(false);
    router.push("/admin");
  };

  // ─── Login Screen ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Luxe Salon Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Secret Key</label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your admin key"
                className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold">
              Login to Dashboard
            </button>
          </form>

          <div className="mt-5 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 text-center border border-amber-200">
            🔒 The admin key is set in your backend <code>.env</code> file as <code>ADMIN_SECRET_KEY</code>
          </div>

          <Link href="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-amber-700 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
    { href: "/admin/services", icon: Scissors, label: "Services" },
    { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Luxe Salon</p>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 text-sm font-medium transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </p>
          </div>
          <Link href="/" className="text-xs text-gray-500 hover:text-amber-700 transition-colors">
            View Website →
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
