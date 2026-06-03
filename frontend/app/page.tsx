"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import FloatingCTA from "@/components/FloatingCTA";
import { getServices, Service } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Star, ChevronRight, Phone, MapPin, Clock,
  Shield, Award, Users, Sparkles, Quote, Scissors,
  ArrowRight, Heart, Calendar, CheckCircle2, Image as ImageIcon
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

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop", alt: "Hair Styling" },
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop", alt: "Makeup Application" },
  { src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=500&fit=crop", alt: "Nail Art" },
  { src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=500&fit=crop", alt: "Facial Treatment" },
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=500&fit=crop", alt: "Spa Massage" },
  { src: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=500&fit=crop", alt: "Bridal Makeup" },
];

// Custom hook for scroll animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] text-[#faf9f7] font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center pt-16 sm:pt-[72px] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] via-[#141416] to-[#0a0a0b]" />
          
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#d4a574]/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[#b8956a]/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4a574]/5 rounded-full blur-[120px] animate-pulse-subtle" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,165,116,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,165,116,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Badge */}
              <div className="animate-fade-in-up">
                <Badge 
                  variant="secondary" 
                  className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-2 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-6 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a574]" />
                  Premium Beauty Experience
                </Badge>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-in-up stagger-1 font-serif text-[2.75rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight mb-6">
                <span className="text-[#faf9f7]">Discover Your</span>
                <br />
                <span className="gradient-text italic">Natural Beauty</span>
              </h1>

              {/* Description */}
              <p className="animate-fade-in-up stagger-2 text-base sm:text-lg text-[#9a958e] max-w-xl font-sans leading-relaxed mb-8">
                Experience luxury salon services tailored just for you. Our expert stylists use premium products to bring out your best look.
              </p>

              {/* CTA Buttons */}
              <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  asChild 
                  size="lg" 
                  className="btn-primary-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold shadow-lg hover:shadow-[0_0_40px_rgba(212,165,116,0.4)] transition-all duration-500 group"
                >
                  <Link href="#services" className="inline-flex items-center justify-center gap-2">
                    Explore Services
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="btn-ghost-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold border-[#d4a574]/40 text-[#faf9f7] hover:bg-[#d4a574]/10 transition-all duration-300"
                >
                  <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-[#d4a574]" />
                    Call to Book
                  </a>
                </Button>
              </div>

              {/* Mobile Stats - shown on mobile only */}
              <div className="animate-fade-in-up stagger-4 grid grid-cols-2 gap-3 w-full lg:hidden mt-8">
                {STATS.slice(0, 4).map(({ icon: Icon, value, label }) => (
                  <div key={label} className="glass-card-luxury p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4a574]/10 flex items-center justify-center text-[#d4a574]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-serif font-bold text-[#faf9f7]">{value}</div>
                      <div className="text-[10px] text-[#9a958e] uppercase tracking-wider font-medium">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
              {STATS.map(({ icon: Icon, value, label }, i) => (
                <div 
                  key={label} 
                  className="stat-card p-5 rounded-2xl flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#b8956a]/10 flex items-center justify-center shrink-0 border border-[#d4a574]/20">
                    <Icon className="w-6 h-6 text-[#d4a574]" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-serif font-bold text-[#faf9f7]">{value}</div>
                    <div className="text-xs text-[#9a958e] uppercase tracking-wider font-medium mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-fade-in-up stagger-5">
          <span className="text-xs text-[#9a958e] uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-[#d4a574]/30 flex justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── Services Section ───────────────────────────────── */}
      <section id="services" className="py-20 sm:py-28 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col items-center mb-14 text-center">
            <Badge 
              variant="secondary" 
              className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              Our Expertise
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf9f7] mb-4 section-heading">
              Premium Services
            </h2>
            <p className="text-[#9a958e] max-w-xl mx-auto text-base sm:text-lg mt-6">
              From classic cuts to luxury spa treatments — we have everything you need to look and feel amazing.
            </p>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={100} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "category-btn px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 border",
                  activeCategory === cat
                    ? "active bg-gradient-to-r from-[#d4a574] to-[#b8956a] text-[#0a0a0b] border-transparent shadow-lg shadow-[#d4a574]/20"
                    : "border-[#d4a574]/30 text-[#9a958e] hover:text-[#d4a574] hover:border-[#d4a574]"
                )}
              >
                {cat}
              </button>
            ))}
          </AnimatedSection>

          {/* Service Grid */}
          <AnimatedSection delay={200}>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="glass-card-luxury overflow-hidden border-[#d4a574]/10 py-0 gap-0">
                    <Skeleton className="h-44 w-full rounded-none bg-[#141416]" />
                    <div className="p-5 space-y-3 bg-[#1c1c1f]">
                      <Skeleton className="h-5 w-3/4 bg-[#141416]" />
                      <Skeleton className="h-4 w-full bg-[#141416]" />
                      <Skeleton className="h-4 w-1/2 bg-[#141416]" />
                      <Skeleton className="h-10 w-full rounded-xl bg-[#141416]" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-[#d4a574]/30" />
                <p className="text-xl font-serif font-semibold text-[#9a958e]">No services in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {filtered.map((service, i) => (
                  <div 
                    key={service.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── About Section ──────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28 lg:py-32 bg-[#141416] border-y border-[#d4a574]/10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4a574]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#b8956a]/5 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <AnimatedSection>
              <Badge 
                variant="secondary" 
                className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
              >
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf9f7] leading-tight mb-6">
                Where Beauty Meets
                <span className="gradient-text italic block mt-2">Excellence</span>
              </h2>
              <p className="text-[#9a958e] leading-relaxed mb-4 text-base font-sans">
                Luxe Salon has been Mumbai&apos;s premier destination for luxury beauty services for over 8 years. Our team of expert stylists and therapists are dedicated to bringing out your natural beauty in an exclusive, serene setting.
              </p>
              <p className="text-[#9a958e] leading-relaxed mb-8 text-base font-sans">
                We use only premium, certified products and cutting-edge techniques to ensure every visit leaves you looking stunning and feeling rejuvenated.
              </p>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Premium Products", desc: "Certified, high-quality beauty products" },
                  { icon: Award, label: "Expert Stylists", desc: "Trained professionals with 10+ years experience" },
                  { icon: Calendar, label: "Easy Booking", desc: "Book in minutes, 24/7 online scheduling" },
                  { icon: Heart, label: "5-Star Service", desc: "Consistently rated best salon in Mumbai" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="feature-card p-4 rounded-xl flex items-start gap-3 border border-[#d4a574]/10">
                    <div className="w-10 h-10 rounded-lg bg-[#d4a574]/10 flex items-center justify-center shrink-0 text-[#d4a574]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-semibold text-[#faf9f7] text-sm font-sans">{label}</p>
                      <p className="text-xs text-[#9a958e] mt-0.5 leading-relaxed font-sans">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Right Content - Image Grid */}
            <AnimatedSection delay={200} className="order-first lg:order-last">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="gallery-item aspect-[3/4] rounded-2xl overflow-hidden border border-[#d4a574]/20">
                    <img 
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop" 
                      alt="Hair styling" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="glass-card-luxury p-5 rounded-2xl border border-[#d4a574]/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#d4a574]" />
                      </div>
                      <span className="text-sm font-semibold text-[#faf9f7]">Certified Experts</span>
                    </div>
                    <p className="text-xs text-[#9a958e]">Our stylists are internationally certified with years of experience.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="glass-card-luxury p-5 rounded-2xl border border-[#d4a574]/10">
                    <div className="text-4xl font-serif font-bold text-[#d4a574] mb-1">8+</div>
                    <div className="text-sm text-[#faf9f7] font-semibold mb-1">Years of Excellence</div>
                    <p className="text-xs text-[#9a958e]">Serving Mumbai since 2016</p>
                  </div>
                  <div className="gallery-item aspect-[3/4] rounded-2xl overflow-hidden border border-[#d4a574]/20">
                    <img 
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop" 
                      alt="Makeup application" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Gallery Section ────────────────────────────────── */}
      <section id="gallery" className="py-20 sm:py-28 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col items-center mb-14 text-center">
            <Badge 
              variant="secondary" 
              className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-2" />
              Our Work
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf9f7] mb-4 section-heading">
              Beauty Gallery
            </h2>
            <p className="text-[#9a958e] max-w-xl mx-auto text-base sm:text-lg mt-6">
              A glimpse into our world of beauty and transformation.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GALLERY_IMAGES.map((img, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "gallery-item group relative overflow-hidden rounded-2xl border border-[#d4a574]/10 cursor-pointer",
                    i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""
                  )}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <span className="text-[#faf9f7] font-semibold text-sm">{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Testimonials Section ───────────────────────────── */}
      <section id="reviews" className="py-20 sm:py-28 lg:py-32 bg-[#141416] border-y border-[#d4a574]/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#d4a574]/5 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center mb-14">
            <Badge 
              variant="secondary" 
              className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <Star className="w-3.5 h-3.5 mr-2" />
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf9f7] section-heading">
              What Our Clients Say
            </h2>
            <p className="text-[#9a958e] mt-6 max-w-lg mx-auto text-base sm:text-lg">
              Don&apos;t just take our word for it — hear from our discerning, happy clients.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {TESTIMONIALS.map(({ name, text, rating, service }, i) => (
                <div 
                  key={name} 
                  className="testimonial-card p-6 sm:p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between group"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-[#d4a574]/10 group-hover:text-[#d4a574]/20 transition-colors" />
                  
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-[#d4a574] text-[#d4a574]" />
                      ))}
                    </div>
                    <p className="text-[#faf9f7]/90 text-sm leading-relaxed mb-5 font-sans">
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                  
                  <div>
                    <Badge 
                      variant="secondary" 
                      className="bg-[#d4a574]/10 text-[#d4a574] border border-[#d4a574]/20 mb-4 text-[10px] uppercase font-semibold tracking-wider"
                    >
                      {service}
                    </Badge>
                    <Separator className="bg-[#d4a574]/10 mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4a574]/30 to-[#b8956a]/20 flex items-center justify-center font-serif font-bold text-sm text-[#d4a574] border border-[#d4a574]/30">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-serif font-semibold text-[#faf9f7] text-sm">{name}</span>
                        <p className="text-[10px] text-[#9a958e] uppercase tracking-wider font-medium">Verified Client</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── CTA Banner Section ─────────────────────────────── */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 cta-banner" />
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0a0a0b] mb-4 tracking-tight">
              Ready for Your Transformation?
            </h2>
            <p className="text-[#0a0a0b]/70 text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto font-sans">
              Book your appointment today and experience the Luxe difference. Our experts are ready to bring out your best look.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 sm:px-10 py-4 sm:py-5 h-auto text-xs font-bold uppercase tracking-widest bg-[#0a0a0b] text-[#d4a574] hover:bg-[#141416] shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <Link href="#services">
                Book Your Appointment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Contact Section ────────────────────────────────── */}
      <section id="contact" className="py-20 sm:py-28 lg:py-32 bg-[#141416] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <Badge 
              variant="secondary" 
              className="bg-[#1c1c1f] text-[#d4a574] border border-[#d4a574]/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <MapPin className="w-3.5 h-3.5 mr-2" />
              Find Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf9f7] section-heading">
              Visit Our Salon
            </h2>
            <p className="text-[#9a958e] mt-6 max-w-lg mx-auto text-base sm:text-lg">
              Come experience luxury beauty services at our conveniently located salon.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto mb-12">
              {[
                { icon: MapPin, title: "Visit Us", lines: ["123 Beauty Street", "Fashion District", "Mumbai 400001"] },
                { icon: Phone, title: "Call Us", lines: ["+91 98765 43210", "+91 98765 43211", "Available 9AM - 8PM"] },
                { icon: Clock, title: "Opening Hours", lines: ["Monday - Saturday", "9:00 AM - 8:00 PM", "Sunday: 10AM - 6PM"] },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="contact-card p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-xl bg-[#d4a574]/10 flex items-center justify-center mb-5 text-[#d4a574] group-hover:scale-110 transition-transform duration-300 border border-[#d4a574]/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-[#faf9f7] mb-3 text-lg">{title}</h3>
                  {lines.map((line, i) => (
                    <p key={i} className="text-[#9a958e] text-sm font-sans leading-relaxed">{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Map placeholder */}
          <AnimatedSection delay={200}>
            <div className="glass-card-luxury rounded-2xl overflow-hidden border border-[#d4a574]/10 aspect-[21/9] max-w-5xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1f] to-[#141416] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-[#d4a574] mx-auto mb-4" />
                  <p className="text-[#faf9f7] font-semibold mb-1">123 Beauty Street, Mumbai</p>
                  <p className="text-sm text-[#9a958e]">Click to view on Google Maps</p>
                </div>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-[#0a0a0b]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Button className="btn-primary-luxury rounded-full">
                  Open in Google Maps
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
      <FloatingCTA />
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
