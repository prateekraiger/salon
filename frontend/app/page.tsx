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
  Shield, Award, Users, Sparkles, ArrowDown,
  Quote, MessageSquare,
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
  { icon: Award, value: "8+", label: "Years of Excellence" },
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background pt-16">
        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-chart-2/5 rounded-full blur-3xl" />

        <div className="relative section-container py-20 text-center">
          <Badge variant="secondary" className="mb-6 animate-fade-in gap-1.5 px-4 py-1.5 text-sm rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Premium Beauty Experience
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 animate-fade-in-up tracking-tight">
            Look <span className="gradient-text">Beautiful</span>,
            <br className="hidden sm:block" />
            {" "}Feel <span className="gradient-text">Confident</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1 leading-relaxed">
            Discover premium salon services tailored just for you. Book your appointment in minutes and let our experts work their magic.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up stagger-2">
            <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg">
              <Link href="/#services">
                Explore Services
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 text-base">
              <a href="tel:+919876543210">
                <Phone className="w-4 h-4 mr-1.5 text-primary" />
                Call to Book
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto animate-fade-in-up stagger-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <Card key={label} className="glass-card glass-card-hover border-border/30 py-4 gap-1">
                <CardContent className="p-0 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <div className="text-2xl font-extrabold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 animate-bounce text-primary/60">
            <ArrowDown className="w-5 h-5 mx-auto" />
          </div>
        </div>
      </section>

      {/* ─── Services ───────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">What We Offer</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Our Services</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              From classic cuts to luxury spa treatments — we have everything you need to look and feel amazing.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-5 transition-all",
                  activeCategory === cat && "shadow-md"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Service Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden py-0 gap-0">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">No services in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── About ──────────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-28 bg-secondary/30">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">About Us</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-5">
                Where Beauty Meets{" "}
                <span className="gradient-text">Excellence</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
                Luxe Salon has been Mumbai's go-to destination for premium beauty services for over 8 years. Our team of skilled professionals is dedicated to bringing out the best version of you.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm sm:text-base">
                We use only the finest products and techniques to ensure every visit leaves you looking and feeling absolutely stunning. Your comfort, satisfaction, and confidence are our top priorities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "Premium Products", desc: "Only certified, high-quality beauty products" },
                  { icon: Award, label: "Expert Stylists", desc: "Trained professionals with years of experience" },
                  { icon: Clock, label: "Easy Booking", desc: "Book in minutes, anytime online" },
                  { icon: Star, label: "5-Star Experience", desc: "Consistently rated 5 stars by clients" },
                ].map(({ icon: Icon, label, desc }) => (
                  <Card key={label} className="glass-card-hover border-border/30 py-3 gap-0">
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-0 shadow-2xl py-0 gap-0">
                <CardContent className="w-full h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                  <div className="text-7xl sm:text-8xl mb-6">✂️</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2">Luxe Salon</h3>
                  <p className="text-muted-foreground text-base sm:text-lg">Premium Beauty Services</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="bg-background/70 backdrop-blur rounded-2xl p-3 text-center">
                      <div className="text-2xl font-extrabold text-foreground">8+</div>
                      <div className="text-xs text-muted-foreground">Years</div>
                    </div>
                    <div className="bg-background/70 backdrop-blur rounded-2xl p-3 text-center">
                      <div className="text-2xl font-extrabold text-foreground">5000+</div>
                      <div className="text-xs text-muted-foreground">Clients</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Decorative */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/15 rounded-2xl rotate-12 hidden sm:block" />
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-accent/10 rounded-full hidden sm:block" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Reviews ───────────────────────────────────────── */}
      <section id="reviews" className="py-20 md:py-28 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">What Clients Say</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Don't just take our word for it — hear from our happy clients.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, text, rating, service }) => (
              <Card key={name} className="glass-card-hover border-border/30 relative overflow-hidden py-6 gap-0">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
                <CardContent className="p-5 pt-0">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-4">"{text}"</p>
                  <Badge variant="secondary" className="mb-4 text-[11px]">{service}</Badge>
                  <Separator className="mb-4" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm text-primary">
                      {name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{name}</span>
                      <p className="text-xs text-muted-foreground">Verified Client</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] opacity-[0.03]" />
        <div className="relative section-container text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Ready for Your Transformation?
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Book your appointment today and experience the Luxe difference.
          </p>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="rounded-full px-8 text-base font-bold bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl"
          >
            <Link href="/#services">
              Book Your Appointment
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────────── */}
      <section id="contact" className="py-20 md:py-28 bg-secondary/20">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">Find Us</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Contact & Location</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: "Address", lines: ["123 Beauty Street", "Fashion District, Mumbai 400001"] },
              { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 98765 43211"] },
              { icon: Clock, title: "Hours", lines: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"] },
            ].map(({ icon: Icon, title, lines }) => (
              <Card key={title} className="text-center glass-card-hover border-border/30 py-6 gap-0">
                <CardContent className="p-5 pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm">{title}</h3>
                  {lines.map((line, i) => (
                    <p key={i} className="text-muted-foreground text-sm">{line}</p>
                  ))}
                </CardContent>
              </Card>
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
