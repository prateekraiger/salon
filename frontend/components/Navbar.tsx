"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Scissors, Phone, X } from "lucide-react";
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50"
          : "bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Scissors className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text tracking-tight">
              Luxe Salon
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">+91 98765 43210</span>
            </a>
            <Button asChild className="rounded-full shadow-md hover:shadow-lg">
              <Link href="/#services">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <SheetHeader className="p-6 pb-4">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold gradient-text">Luxe Salon</span>
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <div className="p-4 space-y-1">
                {links.map((l) => (
                  <SheetClose key={l.href} asChild>
                    <Link
                      href={l.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 rounded-xl transition-colors"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <Separator />
              <div className="p-4 space-y-3">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-xl" size="lg">
                    <Link href="/#services">Book Appointment</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
