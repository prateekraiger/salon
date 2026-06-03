"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Scissors, Phone, X, Sparkles, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Toggle background blur
      setScrolled(currentScrollY > 20);
      
      // Hide/show navbar on scroll direction (only after scrolling down 100px)
      if (currentScrollY > 100) {
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 200);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "navbar-scrolled" : "navbar-glass",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-[#d4a574] to-[#b8956a] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_rgba(212,165,116,0.4)] transition-all duration-500">
                <Scissors className="w-5 h-5 sm:w-5 sm:h-5 text-canvas" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 rounded-xl border border-[#d4a574]/20 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-all duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-text-ivory tracking-tight font-serif">
                Luxe Salon
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#b8956a] uppercase tracking-[0.25em] font-medium -mt-0.5 hidden sm:block">
                Premium Beauty
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link px-4 py-2 text-sm font-medium text-[#9a958e] hover:text-[#d4a574] rounded-lg transition-colors duration-200 tracking-wide"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9a958e] border-r border-[#d4a574]/20 pr-4">
              <Clock className="w-3.5 h-3.5 text-[#b8956a]" />
              <span className="hidden xl:inline text-xs">Open 9AM - 8PM</span>
            </div>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 text-sm text-[#9a958e] hover:text-[#d4a574] font-medium transition-colors duration-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">+91 98765 43210</span>
            </a>
            <Button 
              asChild 
              className="btn-primary-luxury rounded-full px-6 py-2.5 h-auto shadow-lg hover:shadow-[0_0_30px_rgba(212,165,116,0.4)] transition-all duration-300 text-xs font-bold uppercase tracking-wider"
            >
              <Link href="/services" className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Book Now
              </Link>
            </Button>
          </div>

          {/* Mobile: Phone + Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="tel:+919876543210"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#d4a574] hover:bg-[#d4a574]/10 transition-colors border border-[#d4a574]/20"
              aria-label="Call us"
            >
              <Phone className="w-4 h-4" />
            </a>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-ivory hover:bg-[#d4a574]/10 transition-colors border border-[#d4a574]/20"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 bg-canvas border-l border-gold-champagne/20">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#d4a574] to-[#b8956a] flex items-center justify-center shadow-lg">
                        <Scissors className="w-5 h-5 text-canvas" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-text-ivory font-serif text-lg">Luxe Salon</span>
                      <span className="text-[9px] text-[#b8956a] uppercase tracking-[0.2em] font-medium">Premium Beauty</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <Separator className="bg-[#d4a574]/15" />
                <div className="p-4 space-y-1">
                  {links.map((l) => (
                    <SheetClose key={l.href} asChild>
                      <Link
                        href={l.href}
                        className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-text-ivory hover:bg-[#d4a574]/10 hover:text-[#d4a574] rounded-xl transition-all duration-200 group"
                      >
                        {l.label}
                        <ChevronRight className="w-4 h-4 text-[#9a958e] group-hover:text-[#d4a574] transition-colors" />
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <Separator className="bg-[#d4a574]/15" />
                <div className="p-4 space-y-3">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#9a958e] hover:text-[#d4a574] transition-colors rounded-xl hover:bg-[#d4a574]/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#d4a574]/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-[#d4a574]" />
                    </div>
                    +91 98765 43210
                  </a>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#9a958e]">
                    <div className="w-8 h-8 rounded-lg bg-[#d4a574]/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#d4a574]" />
                    </div>
                    Mon-Sat: 9AM - 8PM
                  </div>
                  <SheetClose asChild>
                    <Button 
                      asChild 
                      className="btn-primary-luxury w-full rounded-xl h-12 text-xs font-bold uppercase tracking-widest" 
                      size="lg"
                    >
                      <Link href="/services">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
                
                {/* Mobile menu footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gold-champagne/10 bg-surface-elevated">
                  <p className="text-xs text-on-surface-variant text-center">
                    Premium Beauty Experience
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
