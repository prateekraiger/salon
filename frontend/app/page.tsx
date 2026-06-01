"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { getServices, Service } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Star, ChevronRight, Phone, MapPin, Clock,
  Shield, Award, Users, Sparkles, Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hair", "Skin", "Nails", "Spa", "Bridal", "Makeup"];

const TESTIMONIALS = [
  { name: "Priya Sharma", text: "Amazing service! My hair has never looked better. The staff is so professional and welcoming. Highly recommend!", rating: 5, service: "Hair Coloring" },
  { name: "Ananya Kapoor", text: "Best salon in the city! The booking process was super easy and the results were absolutely stunning.", rating: 5, service: "Bridal Makeup" },
  { name: "Meera Reddy", text: "The facial was absolutely refreshing and rejuvenating. I'll definitely be coming back every month!", rating: 5, service: "Deep Cleansing Facial" },
  { name: "Riya Patel", text: "Their spa treatments are world-class. The ambiance is so relaxing. Perfect for a weekend retreat!", rating: 5, service: "Relaxation Massage" },
  { name: "Sneha Gupta", text: "Got my nails done for a wedding and they looked absolutely gorgeous. The attention to detail is incredible.", rating: 5, service: "Nail Art" },
  { name: "Divya Nair", text: "The keratin treatment completely transformed my hair. It's so smooth and manageable now!", rating: 5, service: "Keratin Treatment" },
];

const STATS = [
  { icon: Users, value: "5000+", label: "Happy Clients" },
  { icon: Award, value: "8+ Years", label: "Of Excellence" },
  { icon: Sparkles, value: "50+", label: "Services Offered" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getServices()
      .then((res) => setServices(res.data.data || []))
      .catch(() => setServices(DEMO_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased">
      <Navbar />

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-[100svh] sm:min-h-[90vh] flex items-center pt-16 sm:pt-[72px] overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxe Salon interior background"
            className="w-full h-full object-cover opacity-20 sm:opacity-25"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdUitl0KzuXW-KjkM7afUX6z7iEJdNoDupcRU9BLpLajeLR8BYuvHqJaCfGsSqfYb49s3xrSfgLseLmcvDE4pynxiPCTHacjMjoSmSvg_BEcNhkLOo7_Mdl8nGX45Bf_j6WzXplkqp_GJ9cIHOjNRnurloq7AAzWhbOeJ1GeDazZMhiESf6z6yrykEHoj1o-eu1MLBjeD_HoWQYNhGPX1XQN0plwrf_vsUVH0v2Hj0CCpq_1GLThRThBAWPrfcBiKi1_GKy22cW0I"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas/80 to-canvas sm:bg-gradient-to-r sm:from-canvas sm:via-canvas/90 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
        </div>

        {/* Decorative ambient blurs */}
        <div className="absolute top-20 right-[15%] w-48 sm:w-72 h-48 sm:h-72 bg-gold-champagne/5 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-10 left-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-bronze-warm/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5 sm:gap-6">
              <Badge variant="secondary" className="bg-surface-onyx text-gold-champagne border border-gold-champagne/20 px-4 py-1.5 text-[10px] tracking-widest uppercase rounded-full font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold-champagne mr-1.5 inline-block" />
                Premium Beauty Experience
              </Badge>

              <h1 className="font-serif text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4rem] text-text-ivory font-bold tracking-tight">
                Look Beautiful,<br />
                <span className="text-gold-champagne italic">Feel Confident</span>
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl font-sans leading-relaxed">
                Discover premium salon services tailored just for you. Book your appointment in minutes and let our experts work their magic.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-1">
                <Button asChild size="lg" className="btn-primary-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                  <Link href="#services" className="inline-flex items-center justify-center gap-2">
                    Explore Services
                    <ChevronRight className="w-4 h-4 text-surface-onyx" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="btn-ghost-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold border-bronze-warm text-text-ivory hover:bg-bronze-warm/15 transition-all w-full sm:w-auto">
                  <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2">
                    <Phone className="w-3.5 h-3.5 mr-1 text-gold-champagne" />
                    Call to Book
                  </a>
                </Button>
              </div>

              {/* Mobile Stats Grid - shown on mobile only below hero text */}
              <div className="grid grid-cols-2 gap-3 w-full lg:hidden mt-4">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="glass-card-luxury p-4 rounded-xl flex items-center gap-3 border border-bronze-warm/15">
                    <div className="w-10 h-10 rounded-full bg-bronze-warm/10 flex items-center justify-center text-gold-champagne shrink-0">
                      <Icon className="w-4 h-4 text-gold-champagne" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-lg font-serif font-bold text-text-ivory">{value}</div>
                      <div className="text-[10px] font-sans text-bronze-warm uppercase tracking-widest font-semibold">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Stats Column - hidden on mobile */}
            <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="glass-card-luxury p-6 rounded-2xl flex items-center gap-4 hover:border-gold-champagne/40 transition-all duration-300 border border-bronze-warm/15">
                  <div className="w-12 h-12 rounded-full bg-bronze-warm/10 flex items-center justify-center text-gold-champagne shrink-0">
                    <Icon className="w-5 h-5 text-gold-champagne" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-serif font-bold text-text-ivory">{value}</div>
                    <div className="text-xs font-sans text-bronze-warm uppercase tracking-widest font-semibold mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Section ───────────────────────────────── */}
      <section id="services" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center mb-10 sm:mb-16 text-center gap-3">
          <Badge variant="secondary" className="bg-surface-onyx text-bronze-warm border border-bronze-warm/30 px-4 py-1.5 text-[10px] tracking-widest uppercase rounded-full font-bold">
            Our Expertise
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory">Our Services</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-sm sm:text-base font-sans mt-2">
            From classic cuts to luxury spa treatments — we have everything you need to look and feel amazing.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 border",
                  activeCategory === cat
                    ? "bg-gold-champagne text-canvas border-gold-champagne shadow-lg"
                    : "border-bronze-warm/30 text-text-ivory hover:border-gold-champagne hover:bg-bronze-warm/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Service Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-card-luxury overflow-hidden border border-bronze-warm/15 py-0 gap-0">
                <Skeleton className="h-44 w-full rounded-none bg-surface-onyx/50" />
                <div className="p-5 space-y-3 bg-surface-onyx">
                  <Skeleton className="h-5 w-3/4 bg-canvas" />
                  <Skeleton className="h-4 w-full bg-canvas" />
                  <Skeleton className="h-4 w-1/2 bg-canvas" />
                  <Skeleton className="h-10 w-full rounded-full bg-canvas" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-bronze-warm/40" />
            <p className="text-lg font-serif font-semibold text-on-surface-variant">No services in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* ─── About Section ──────────────────────────────────── */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-surface-onyx border-y border-bronze-warm/10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="bg-canvas text-bronze-warm border border-bronze-warm/30 px-4 py-1.5 text-[10px] tracking-widest uppercase rounded-full font-bold mb-3">
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory leading-tight mb-6">
                Where Beauty Meets<br />
                <span className="text-gold-champagne italic">Excellence</span>
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4 text-sm sm:text-base font-sans">
                Luxe Salon has been Mumbai&apos;s go-to destination for premium beauty services for over 8 years. Our team of skilled professionals is dedicated to bringing out the best version of you in an exclusive and serene setting.
              </p>
              <p className="text-on-surface-variant leading-relaxed mb-8 sm:mb-10 text-sm sm:text-base font-sans">
                We use only the finest products and state-of-the-art techniques to ensure every visit leaves you looking and feeling absolutely stunning.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: Shield, label: "Premium Products", desc: "Only certified, high-quality beauty products" },
                  { icon: Award, label: "Expert Stylists", desc: "Trained professionals with years of experience" },
                  { icon: Clock, label: "Easy Booking", desc: "Book in minutes, anytime online" },
                  { icon: Star, label: "5-Star Experience", desc: "Consistently rated 5 stars by clients" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="glass-card-luxury border border-bronze-warm/15 hover:border-gold-champagne/45 p-4 rounded-xl flex items-start gap-3 transition-colors duration-300">
                    <div className="w-9 h-9 rounded-xl bg-bronze-warm/10 flex items-center justify-center shrink-0 text-gold-champagne">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-semibold text-text-ivory text-sm font-sans">{label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-sans">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-first lg:order-last">
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-gold-champagne/5 via-bronze-warm/5 to-canvas border border-bronze-warm/20 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center p-8 sm:p-12 relative z-10 max-w-md mx-auto lg:max-w-none">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 select-none animate-float">&#9986;&#65039;</div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gold-champagne mb-2">Luxe Salon</h3>
                <p className="text-text-ivory text-sm sm:text-base lg:text-lg font-serif italic">Premium Beauty & Wellness</p>
                <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs">
                  <div className="bg-canvas/80 backdrop-blur border border-bronze-warm/15 rounded-xl p-3 sm:p-3.5 text-center">
                    <div className="text-xl sm:text-2xl font-serif font-bold text-gold-champagne">8+</div>
                    <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-widest font-semibold font-sans mt-0.5">Years</div>
                  </div>
                  <div className="bg-canvas/80 backdrop-blur border border-bronze-warm/15 rounded-xl p-3 sm:p-3.5 text-center">
                    <div className="text-xl sm:text-2xl font-serif font-bold text-gold-champagne">5000+</div>
                    <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-widest font-semibold font-sans mt-0.5">Clients</div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border border-gold-champagne/20 rounded-2xl rotate-12 hidden lg:block pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-bronze-warm/5 rounded-full hidden lg:block pointer-events-none blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ───────────────────────────── */}
      <section id="reviews" className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10 sm:mb-16">
          <Badge variant="secondary" className="bg-surface-onyx text-bronze-warm border border-bronze-warm/30 px-4 py-1.5 text-[10px] tracking-widest uppercase rounded-full font-bold mb-3">
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory">What Clients Say</h2>
          <p className="text-on-surface-variant mt-3 max-w-lg mx-auto text-sm sm:text-base font-sans">
            Don&apos;t just take our word for it &#8212; hear from our discerning, happy clients.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map(({ name, text, rating, service }) => (
            <div key={name} className="glass-card-luxury border border-bronze-warm/15 hover:border-gold-champagne/45 p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-champagne/10" />
              <div className="text-left">
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-champagne text-gold-champagne" />
                  ))}
                </div>
                <p className="text-text-ivory/90 text-sm leading-relaxed mb-5 sm:mb-6 font-sans">&ldquo;{text}&rdquo;</p>
              </div>
              <div>
                <Badge variant="secondary" className="bg-canvas/50 text-bronze-warm border border-bronze-warm/20 mb-3 sm:mb-4 text-[10px] uppercase font-bold tracking-wider font-sans">
                  {service}
                </Badge>
                <Separator className="bg-bronze-warm/15 mb-3 sm:mb-4" />
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-champagne/20 to-bronze-warm/20 flex items-center justify-center font-serif font-bold text-sm text-gold-champagne shrink-0">
                    {name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif font-bold text-text-ivory text-sm">{name}</span>
                    <p className="text-[10px] text-bronze-warm font-sans uppercase tracking-widest font-semibold mt-0.5">Verified Client</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner Section ─────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-gold-champagne to-bronze-warm relative overflow-hidden border-y border-gold-champagne/30 w-full">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] opacity-[0.04] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-canvas mb-4 tracking-tight leading-tight">
            Ready for Your Transformation?
          </h2>
          <p className="text-canvas/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto font-sans">
            Book your appointment today and experience the Luxe difference in absolute comfort.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 sm:px-10 py-4 sm:py-5 h-auto text-xs font-bold uppercase tracking-widest bg-canvas text-gold-champagne hover:bg-canvas/90 shadow-xl hover:shadow-2xl transition-all"
          >
            <Link href="#services">
              Book Your Appointment
              <ChevronRight className="w-4 h-4 ml-1.5 text-gold-champagne" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Contact Section ────────────────────────────────── */}
      <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-surface-onyx w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="secondary" className="bg-canvas text-bronze-warm border border-bronze-warm/30 px-4 py-1.5 text-[10px] tracking-widest uppercase rounded-full font-bold mb-3">
              Find Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory">Contact & Location</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: MapPin, title: "Address", lines: ["123 Beauty Street", "Fashion District, Mumbai 400001"] },
              { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 98765 43211"] },
              { icon: Clock, title: "Hours", lines: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="glass-card-luxury border border-bronze-warm/15 hover:border-gold-champagne/45 p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-bronze-warm/10 flex items-center justify-center mb-4 sm:mb-6 text-gold-champagne">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-text-ivory mb-2 sm:mb-3 text-lg">{title}</h3>
                {lines.map((line, i) => (
                  <p key={i} className="text-on-surface-variant text-sm font-sans leading-relaxed">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Demo Services (fallback when API is unavailable) ─────────────────────
const DEMO_SERVICES: Service[] = [
  { id: "1", name: "Classic Haircut", description: "Expert cut tailored to your face shape and style preferences.", price: 399, duration_minutes: 45, category: "Hair", is_active: true, created_at: "" },
  { id: "2", name: "Hair Coloring", description: "Full hair coloring using premium, vibrant colors that last longer.", price: 1499, duration_minutes: 120, category: "Hair", is_active: true, created_at: "" },
  { id: "3", name: "Deep Cleansing Facial", description: "Thorough facial cleansing for glowing, refreshed skin.", price: 799, duration_minutes: 60, category: "Skin", is_active: true, created_at: "" },
  { id: "4", name: "Manicure & Pedicure", description: "Complete nail care with polish, buffing, and massage.", price: 599, duration_minutes: 60, category: "Nails", is_active: true, created_at: "" },
  { id: "5", name: "Relaxation Massage", description: "Full body relaxation massage to release stress and tension.", price: 1299, duration_minutes: 90, category: "Spa", is_active: true, created_at: "" },
  { id: "6", name: "Bridal Makeover", description: "Complete bridal package including makeup, hair & styling.", price: 4999, duration_minutes: 180, category: "Bridal", is_active: true, created_at: "" },
  { id: "7", name: "HD Makeup", description: "High definition makeup for special occasions and events.", price: 1999, duration_minutes: 90, category: "Makeup", is_active: true, created_at: "" },
  { id: "8", name: "Keratin Treatment", description: "Smooth, frizz-free hair with long-lasting keratin treatment.", price: 2999, duration_minutes: 150, category: "Hair", is_active: true, created_at: "" },
];
