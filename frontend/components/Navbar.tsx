"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Scissors, Phone, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/#about", label: "About" },
    { href: "/#reviews", label: "Reviews" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-canvas/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-bronze-warm/10"
          : "bg-canvas/70 backdrop-blur-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gold-champagne to-bronze-warm flex items-center justify-center shadow-lg group-hover:shadow-gold-champagne/20 transition-all duration-300">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-canvas" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-text-ivory tracking-tight font-serif">
                Luxe Salon
              </span>
              <span className="text-[9px] sm:text-[10px] text-bronze-warm uppercase tracking-[0.2em] font-medium -mt-0.5 hidden sm:block">
                Premium Beauty
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-gold-champagne rounded-lg hover:bg-bronze-warm/10 transition-all duration-200 tracking-wide"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-gold-champagne font-medium transition-colors duration-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">+91 98765 43210</span>
            </a>
            <Button asChild className="btn-primary-luxury rounded-full px-6 py-2.5 h-auto shadow-lg hover:shadow-gold-champagne/20 transition-all duration-300 text-xs font-bold uppercase tracking-widest">
              <Link href="/#services">Book Now</Link>
            </Button>
          </div>

          {/* Mobile: Phone + Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="tel:+919876543210"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gold-champagne hover:bg-bronze-warm/10 transition-colors"
              aria-label="Call us"
            >
              <Phone className="w-4.5 h-4.5" />
            </a>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-ivory hover:bg-bronze-warm/10 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 bg-canvas border-l border-bronze-warm/15">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-champagne to-bronze-warm flex items-center justify-center">
                      <Scissors className="w-4.5 h-4.5 text-canvas" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-text-ivory font-serif text-lg">Luxe Salon</span>
                      <span className="text-[9px] text-bronze-warm uppercase tracking-[0.2em] font-medium -mt-0.5">Premium Beauty</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <Separator className="bg-bronze-warm/15" />
                <div className="p-4 space-y-1">
                  {links.map((l) => (
                    <SheetClose key={l.href} asChild>
                      <Link
                        href={l.href}
                        className="flex items-center px-4 py-3.5 text-sm font-medium text-text-ivory hover:bg-bronze-warm/10 hover:text-gold-champagne rounded-xl transition-all duration-200"
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <Separator className="bg-bronze-warm/15" />
                <div className="p-4 space-y-3">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface-variant hover:text-gold-champagne transition-colors rounded-xl"
                  >
                    <Phone className="w-4 h-4 text-gold-champagne" />
                    +91 98765 43210
                  </a>
                  <SheetClose asChild>
                    <Button asChild className="btn-primary-luxury w-full rounded-xl h-12 text-xs font-bold uppercase tracking-widest" size="lg">
                      <Link href="/#services">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
