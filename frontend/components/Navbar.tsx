"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Scissors, Phone } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Luxe Salon</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-gray-600 hover:text-amber-700 font-medium transition-colors text-sm"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-sm text-amber-700 font-medium hover:text-amber-900 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 98765 43210
            </a>
            <Link
              href="/#services"
              className="btn-primary px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-amber-50 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-amber-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-amber-100">
              <Link
                href="/#services"
                onClick={() => setOpen(false)}
                className="btn-primary block text-center px-5 py-3 rounded-xl font-semibold"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
