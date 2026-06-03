"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import ServiceCard from "@/components/ServiceCard";
import { getServices, Service } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hair", "Skin", "Nails", "Spa", "Bridal", "Makeup"];

export default function ServicesPage() {
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
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased overflow-x-hidden">
      <Navbar />

      <main className="grow pt-24 pb-16 sm:pt-28 sm:pb-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px] animate-pulse-subtle" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-14 text-center animate-fade-in-up">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Our Expertise
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-glow-sm">
              Our Premium Services
            </h1>
            <div className="section-divider my-4" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg">
              Explore our curated selection of luxury beauty services, custom-tailored to enhance your natural beauty and well-being.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 animate-fade-in-up stagger-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "category-btn px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer",
                  activeCategory === cat
                    ? "active bg-linear-to-r from-gold-champagne to-bronze-warm text-canvas border-transparent shadow-lg shadow-gold-champagne/20"
                    : "border-gold-champagne/30 text-on-surface-variant hover:text-gold-champagne hover:border-gold-champagne bg-surface-onyx/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Grid */}
          <div className="animate-fade-in-up stagger-2">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="glass-card-luxury overflow-hidden border-gold-champagne/10 py-0 gap-0">
                    <Skeleton className="h-44 w-full rounded-none bg-surface-elevated" />
                    <div className="p-5 space-y-3 bg-surface-onyx">
                      <Skeleton className="h-5 w-3/4 bg-surface-elevated" />
                      <Skeleton className="h-4 w-full bg-surface-elevated" />
                      <Skeleton className="h-4 w-1/2 bg-surface-elevated" />
                      <Skeleton className="h-10 w-full rounded-xl bg-surface-elevated" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-surface-onyx/50 rounded-2xl border border-gold-champagne/10">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-gold-champagne/30" />
                <p className="text-xl font-serif font-semibold text-on-surface-variant">No services in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {filtered.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}

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
