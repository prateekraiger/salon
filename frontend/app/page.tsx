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
import { Separator } from "@/components/ui/separator";
import {
  Star, ChevronRight, Phone, MapPin, Clock,
  Shield, Award, Users, Sparkles, Quote, Scissors,
  ArrowRight, Heart, Calendar, CheckCircle2, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: Users, value: "5000+", label: "Happy Clients" },
  { icon: Award, value: "8+ Years", label: "Of Excellence" },
  { icon: Sparkles, value: "50+", label: "Services Offered" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", text: "Amazing service! My hair has never looked better. The staff is so professional and welcoming. Highly recommend!", rating: 5, service: "Hair Coloring" },
  { name: "Ananya Kapoor", text: "Best salon in the city! The booking process was super easy and the results were absolutely stunning.", rating: 5, service: "Bridal Makeup" },
  { name: "Meera Reddy", text: "The facial was absolutely refreshing and rejuvenating. I'll definitely be coming back every month!", rating: 5, service: "Deep Cleansing Facial" },
];

const GALLERY_PREVIEW = [
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop", alt: "Hair Styling" },
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop", alt: "Makeup Application" },
  { src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=500&fit=crop", alt: "Nail Art" },
];

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

  useEffect(() => {
    getServices()
      .then((res) => setServices(res.data.data?.slice(0, 4) || []))
      .catch(() => setServices(DEMO_SERVICES.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-svh flex items-center pt-16 sm:pt-[72px] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-canvas via-surface-elevated/30 to-canvas" />
          
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-champagne/3 rounded-full blur-[120px] animate-pulse-subtle" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(184,149,106,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(184,149,106,0.02)_1px,transparent_1px)] bg-size-[60px_60px]" />
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
                  className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-2 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-6 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
                  Premium Beauty Experience
                </Badge>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-in-up stagger-1 font-serif text-[2.75rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight mb-6">
                <span className="text-text-ivory">Discover Your</span>
                <br />
                <span className="gradient-text italic">Natural Beauty</span>
              </h1>

              {/* Description */}
              <p className="animate-fade-in-up stagger-2 text-base sm:text-lg text-on-surface-variant max-w-xl font-sans leading-relaxed mb-8">
                Experience luxury salon services tailored just for you. Our expert stylists use premium products to bring out your best look in a serene, modern setting.
              </p>

              {/* CTA Buttons */}
              <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  asChild 
                  size="lg" 
                  className="btn-primary-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold shadow-lg hover:shadow-[0_0_40px_rgba(184,149,106,0.3)] transition-all duration-500 group"
                >
                  <Link href="/services" className="inline-flex items-center justify-center gap-2">
                    Explore Services
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="btn-ghost-luxury px-8 py-4 h-auto rounded-full font-sans uppercase tracking-widest text-xs font-bold border-gold-champagne/40 text-text-ivory hover:bg-gold-champagne/10 transition-all duration-300"
                >
                  <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-gold-champagne" />
                    Call to Book
                  </a>
                </Button>
              </div>

              {/* Mobile Stats */}
              <div className="animate-fade-in-up stagger-4 grid grid-cols-2 gap-3 w-full lg:hidden mt-8">
                {STATS.slice(0, 4).map(({ icon: Icon, value, label }) => (
                  <div key={label} className="glass-card-luxury p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-champagne/10 flex items-center justify-center text-gold-champagne">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-serif font-bold text-text-ivory">{value}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{label}</div>
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
                  className="stat-card p-5 rounded-2xl flex items-center gap-4 animate-fade-in-up bg-surface-onyx border border-gold-champagne/10"
                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-gold-champagne/20 to-bronze-warm/10 flex items-center justify-center shrink-0 border border-gold-champagne/20">
                    <Icon className="w-6 h-6 text-gold-champagne" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-serif font-bold text-text-ivory">{value}</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider font-medium mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Section Teaser ────────────────────────── */}
      <section className="py-20 sm:py-28 relative border-t border-gold-champagne/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col items-center mb-14 text-center">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              Our Offerings
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory mb-4">
              Featured Services
            </h2>
            <div className="section-divider my-2" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg mt-4">
              Discover our signature, premium services crafted to deliver flawless results and deep relaxation.
            </p>
          </AnimatedSection>

          {/* Service Grid */}
          <AnimatedSection delay={100} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="glass-card-luxury overflow-hidden border-gold-champagne/10 py-0 gap-0">
                    <div className="h-44 w-full bg-surface-elevated animate-pulse" />
                    <div className="p-5 space-y-3 bg-surface-onyx">
                      <div className="h-5 w-3/4 bg-surface-elevated animate-pulse rounded" />
                      <div className="h-4 w-full bg-surface-elevated animate-pulse rounded" />
                      <div className="h-10 w-full bg-surface-elevated animate-pulse rounded-xl" />
                    </div>
                  </Card>
                ))
              ) : (
                services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="flex justify-center">
            <Button asChild variant="outline" className="btn-ghost-luxury rounded-full px-8 py-3.5 h-auto text-xs font-bold uppercase tracking-widest">
              <Link href="/services" className="inline-flex items-center gap-2">
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── About Section Teaser ───────────────────────────── */}
      <section className="py-20 sm:py-28 bg-surface-onyx border-y border-gold-champagne/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <AnimatedSection>
              <Badge 
                variant="secondary" 
                className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
              >
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory leading-tight mb-6">
                Where Beauty Meets
                <span className="gradient-text italic block mt-2">Excellence</span>
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4 text-base font-sans">
                Luxe Salon has been Mumbai&apos;s premier destination for luxury beauty services for over 8 years. Our team of expert stylists and therapists are dedicated to bringing out your natural beauty in an exclusive, serene setting.
              </p>
              <p className="text-on-surface-variant leading-relaxed mb-8 text-base font-sans">
                We use only premium, certified products and cutting-edge techniques to ensure every visit leaves you looking stunning and feeling rejuvenated.
              </p>
              
              <Button asChild variant="outline" className="btn-ghost-luxury rounded-full px-8 py-3.5 h-auto text-xs font-bold uppercase tracking-widest mb-4">
                <Link href="/about" className="inline-flex items-center gap-2">
                  Our Story & Team
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </AnimatedSection>

            {/* Right Content - Image Grid */}
            <AnimatedSection delay={200} className="order-first lg:order-last">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="gallery-item aspect-3/4 rounded-2xl overflow-hidden border border-gold-champagne/20">
                    <img 
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop" 
                      alt="Hair styling" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="glass-card-luxury p-5 rounded-2xl border border-gold-champagne/10">
                    <div className="text-4xl font-serif font-bold text-gold-champagne mb-1">8+</div>
                    <div className="text-sm text-text-ivory font-semibold mb-1">Years of Excellence</div>
                    <p className="text-xs text-on-surface-variant">Serving Mumbai since 2016 with luxury treatments.</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Gallery Section Teaser ─────────────────────────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col items-center mb-14 text-center">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-2" />
              Our Work
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory mb-4">
              Beauty Lookbook
            </h2>
            <div className="section-divider my-2" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg mt-4">
              A glimpse into our world of beauty and styling transformations.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {GALLERY_PREVIEW.map((img, i) => (
                <div 
                  key={i} 
                  className="gallery-item group relative overflow-hidden rounded-2xl border border-gold-champagne/10 aspect-3/4"
                >
                  <img 
                    src={img.src} 
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="flex justify-center">
            <Button asChild variant="outline" className="btn-ghost-luxury rounded-full px-8 py-3.5 h-auto text-xs font-bold uppercase tracking-widest">
              <Link href="/gallery" className="inline-flex items-center gap-2">
                Explore Full Gallery
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Testimonials Section Teaser ────────────────────── */}
      <section className="py-20 sm:py-28 bg-surface-onyx border-y border-gold-champagne/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center mb-14">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <Star className="w-3.5 h-3.5 mr-2" />
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory">
              Client Testimonials
            </h2>
            <div className="section-divider my-2" />
            <p className="text-on-surface-variant mt-4 max-w-lg mx-auto text-base sm:text-lg">
              Don&apos;t just take our word for it — hear from our discerning, happy clients.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100} className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {TESTIMONIALS.map(({ name, text, rating, service }) => (
                <div 
                  key={name} 
                  className="testimonial-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-champagne/10 group-hover:text-gold-champagne/20 transition-colors" />
                  
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-text-ivory/90 text-sm leading-relaxed mb-5 font-sans">
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                  
                  <div>
                    <Badge 
                      variant="secondary" 
                      className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/20 mb-4 text-[10px] uppercase font-semibold tracking-wider"
                    >
                      {service}
                    </Badge>
                    <Separator className="bg-gold-champagne/10 mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-linear-to-br from-gold-champagne/30 to-bronze-warm/20 flex items-center justify-center font-serif font-bold text-sm text-gold-champagne border border-gold-champagne/30">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-serif font-semibold text-text-ivory text-sm">{name}</span>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Verified Client</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="flex justify-center">
            <Button asChild variant="outline" className="btn-ghost-luxury rounded-full px-8 py-3.5 h-auto text-xs font-bold uppercase tracking-widest">
              <Link href="/reviews" className="inline-flex items-center gap-2">
                Read All Reviews
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Contact Section Teaser ─────────────────────────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <MapPin className="w-3.5 h-3.5 mr-2" />
              Find Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-ivory">
              Visit Luxe Salon
            </h2>
            <div className="section-divider my-2" />
            <p className="text-on-surface-variant mt-4 max-w-lg mx-auto text-base sm:text-lg">
              Come experience luxury beauty treatments at our centrally located salon space.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {[
                { icon: MapPin, title: "Address", lines: ["123 Beauty Street", "Fashion District", "Mumbai 400001"] },
                { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 98765 43211"] },
                { icon: Clock, title: "Opening Hours", lines: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"] },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="contact-card p-6 rounded-2xl flex flex-col items-center text-center group bg-surface-onyx border border-gold-champagne/10">
                  <div className="w-14 h-14 rounded-xl bg-gold-champagne/10 flex items-center justify-center mb-5 text-gold-champagne group-hover:scale-110 transition-transform duration-300 border border-gold-champagne/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-text-ivory mb-3 text-lg">{title}</h3>
                  {lines.map((line, i) => (
                    <p key={i} className="text-on-surface-variant text-sm font-sans leading-relaxed">{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="flex justify-center">
            <Button asChild variant="outline" className="btn-ghost-luxury rounded-full px-8 py-3.5 h-auto text-xs font-bold uppercase tracking-widest">
              <Link href="/contact" className="inline-flex items-center gap-2">
                Location Details & Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── CTA Banner Section ─────────────────────────────── */}
      <section className="py-20 sm:py-24 relative overflow-hidden bg-gold-champagne">
        <div className="absolute inset-0 bg-linear-to-r from-gold-champagne via-gold-light to-bronze-warm opacity-90" />
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-canvas mb-4 tracking-tight">
              Ready for Your Transformation?
            </h2>
            <p className="text-canvas/95 text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto font-sans">
              Book your appointment today and experience the Luxe difference. Our experts are ready to bring out your best look.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 sm:px-10 py-4 sm:py-5 h-auto text-xs font-bold uppercase tracking-widest bg-text-ivory text-canvas hover:bg-[#2e2e33] shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <Link href="/services">
                Book Your Appointment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

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
];
