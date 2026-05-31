import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-sidebar-background text-sidebar-foreground">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
                <Scissors className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Luxe Salon</span>
            </div>
            <p className="text-sm leading-relaxed text-sidebar-foreground/60 max-w-xs">
              Premium beauty services tailored just for you. We believe everyone deserves to look and feel their best.
            </p>
            <div className="flex gap-2.5 mt-6">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/60 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/#services", label: "Services" },
                { href: "/#about", label: "About Us" },
                { href: "/#reviews", label: "Reviews" },
                { href: "/#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-sidebar-foreground/50 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2.5">
              {["Haircut & Styling", "Hair Coloring", "Facial & Skincare", "Nail Care", "Bridal Packages", "Spa & Massage"].map((s) => (
                <li key={s}>
                  <Link
                    href="/#services"
                    className="text-sm text-sidebar-foreground/50 hover:text-primary transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/60 leading-relaxed">123 Beauty Street, Fashion District, Mumbai 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <a href="tel:+919876543210" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <a href="mailto:hello@luxesalon.com" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">
                  hello@luxesalon.com
                </a>
              </li>
            </ul>
            <div className="mt-4 pl-11 text-xs text-sidebar-foreground/40 space-y-0.5">
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p>Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="section-container py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sidebar-foreground/40">
          <p>&copy; {new Date().getFullYear()} Luxe Salon. All rights reserved.</p>
          <p>Made with care for beauty</p>
        </div>
      </div>
    </footer>
  );
}
