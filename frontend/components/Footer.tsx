import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Twitter, ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  const services = [
    "Haircut & Styling",
    "Hair Coloring",
    "Facial & Skincare",
    "Nail Care",
    "Bridal Packages",
    "Spa & Massage",
  ];

  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
  ];

  return (
    <footer className="relative bg-canvas border-t border-gold-champagne/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-champagne/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-bronze-warm/5 rounded-full blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#d4a574] to-[#b8956a] flex items-center justify-center shadow-lg">
                  <Scissors className="w-6 h-6 text-[#0a0a0b]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#faf9f7] font-serif">Luxe Salon</span>
                <span className="text-[10px] text-[#b8956a] uppercase tracking-[0.2em] font-medium">Premium Beauty</span>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-[#9a958e] max-w-sm mb-6">
              Experience luxury beauty services tailored just for you. We believe everyone deserves to look and feel their absolute best.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-surface-elevated border border-gold-champagne/20 flex items-center justify-center text-on-surface-variant social-icon"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-[#faf9f7] font-semibold mb-5 text-sm uppercase tracking-wider font-serif flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a574]" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#9a958e] hover:text-[#d4a574] transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h3 className="text-[#faf9f7] font-semibold mb-5 text-sm uppercase tracking-wider font-serif flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a574]" />
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-sm text-on-surface-variant hover:text-gold-champagne transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {s}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h3 className="text-[#faf9f7] font-semibold mb-5 text-sm uppercase tracking-wider font-serif flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a574]" />
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gold-champagne/20 transition-colors">
                  <MapPin className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  123 Beauty Street<br />Fashion District<br />Mumbai 400001
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0 group-hover:bg-gold-champagne/20 transition-colors">
                  <Phone className="w-4 h-4 text-gold-champagne" />
                </div>
                <a href="tel:+919876543210" className="text-sm text-on-surface-variant hover:text-gold-champagne transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0 group-hover:bg-gold-champagne/20 transition-colors">
                  <Mail className="w-4 h-4 text-gold-champagne" />
                </div>
                <a href="mailto:hello@luxesalon.com" className="text-sm text-on-surface-variant hover:text-gold-champagne transition-colors">
                  hello@luxesalon.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0 group-hover:bg-gold-champagne/20 transition-colors">
                  <Clock className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-sm text-on-surface-variant">
                  Mon-Sat: 9AM - 8PM<br />Sunday: 10AM - 6PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="relative border-t border-gold-champagne/10 bg-surface-elevated/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-text-ivory font-serif font-semibold mb-1">Stay Updated</h4>
              <p className="text-sm text-on-surface-variant">Get the latest updates on our services and offers</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="input-field px-4 py-2.5 rounded-xl text-sm w-48 sm:w-64 text-text-ivory placeholder:text-on-surface-variant/60"
              />
              <button className="btn-primary-luxury px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-[#d4a574]/10" />

      {/* Bottom Bar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant/60">
          <p>&copy; {currentYear} Luxe Salon. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-gold-champagne transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gold-champagne transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
