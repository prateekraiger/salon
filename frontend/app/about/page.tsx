"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, Calendar, Heart, CheckCircle2, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 sm:pt-28 sm:pb-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px] animate-pulse-subtle" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] animate-pulse-subtle" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-14 text-center animate-fade-in-up">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              Our Story
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4">
              Where Beauty Meets <span className="gradient-text italic">Excellence</span>
            </h1>
            <div className="section-divider my-4" />
            <p className="text-on-surface-variant max-w-2xl mx-auto text-base sm:text-lg">
              Luxe Salon has been Mumbai&apos;s premier destination for luxury beauty and wellness services. We believe that self-care is a necessity, not an afterthought.
            </p>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 animate-fade-in-up stagger-1">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-ivory leading-tight">
                Our Philosophy
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-base font-sans">
                At Luxe Salon, our philosophy centers on bringing out your natural beauty through personalized care and premium expertise. Founded in 2016, we have established a sanctuary where clients can escape the hustle of the city and indulge in custom treatments designed specifically for their needs.
              </p>
              <p className="text-on-surface-variant leading-relaxed text-base font-sans">
                We work exclusively with internationally renowned beauty brands and certified styling professionals to guarantee that every detail—from color formulations to massage techniques—reaches the highest standards of beauty care.
              </p>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Shield, label: "Premium Products", desc: "Certified, high-quality botanical beauty ingredients" },
                  { icon: Award, label: "Expert Stylists", desc: "Trained professionals with 10+ years experience" },
                  { icon: Calendar, label: "Easy Booking", desc: "Reserve your slot in minutes, 24/7 online" },
                  { icon: Heart, label: "5-Star Service", desc: "Consistently rated best salon in Mumbai" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="feature-card p-4 rounded-xl flex items-start gap-3 border border-gold-champagne/10 bg-surface-onyx/50">
                    <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0 text-gold-champagne">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-semibold text-text-ivory text-sm font-sans">{label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-sans">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Image Grid */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="gallery-item aspect-[3/4] rounded-2xl overflow-hidden border border-gold-champagne/20">
                    <img 
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop" 
                      alt="Hair styling" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="glass-card-luxury p-5 rounded-2xl border border-gold-champagne/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gold-champagne/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-gold-champagne" />
                      </div>
                      <span className="text-sm font-semibold text-text-ivory">Certified Experts</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Our team holds certifications from top academies in Paris and London.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="glass-card-luxury p-5 rounded-2xl border border-gold-champagne/10">
                    <div className="text-4xl font-serif font-bold text-gold-champagne mb-1">8+</div>
                    <div className="text-sm text-text-ivory font-semibold mb-1">Years of Excellence</div>
                    <p className="text-xs text-on-surface-variant">Serving Mumbai since 2016 with dedicated beauty solutions.</p>
                  </div>
                  <div className="gallery-item aspect-[3/4] rounded-2xl overflow-hidden border border-gold-champagne/20">
                    <img 
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop" 
                      alt="Makeup application" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stylists Section */}
          <div className="animate-fade-in-up stagger-2 border-t border-gold-champagne/10 pt-16">
            <div className="text-center mb-12">
              <Badge 
                variant="secondary" 
                className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
              >
                Meet The Team
              </Badge>
              <h2 className="text-3xl font-serif font-bold text-text-ivory">Our Master Stylists</h2>
              <p className="text-on-surface-variant text-sm mt-3">The creative minds behind your custom looks</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: "Marc Dupont", role: "Artistic Director & Hair Expert", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop" },
                { name: "Elena Rostova", role: "Chief Skincare Therapist", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop" },
                { name: "Priya Nair", role: "Lead Bridal & Makeup Artist", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop" }
              ].map((stylist) => (
                <div key={stylist.name} className="glass-card-luxury p-0 rounded-2xl overflow-hidden border border-gold-champagne/10 group">
                  <div className="aspect-[4/5] w-full overflow-hidden relative">
                    <img 
                      src={stylist.img} 
                      alt={stylist.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-serif font-bold text-text-ivory text-lg">{stylist.name}</h3>
                    <p className="text-xs text-gold-champagne uppercase tracking-wider font-semibold mt-1">{stylist.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}
