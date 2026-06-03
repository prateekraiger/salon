"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased overflow-x-hidden">
      <Navbar />

      <main className="grow pt-24 pb-16 sm:pt-28 sm:pb-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px] animate-pulse-subtle" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] animate-pulse-subtle" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-14 text-center animate-fade-in-up">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <MapPin className="w-3.5 h-3.5 mr-2" />
              Visit Us
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4">
              Connect With Luxe
            </h1>
            <div className="section-divider my-4" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg">
              Have questions or want to make a booking? We are here to help. Reach out or visit our premier salon location.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16 animate-fade-in-up stagger-1">
            {[
              { icon: MapPin, title: "Visit Us", lines: ["123 Beauty Street", "Fashion District", "Mumbai 400001"] },
              { icon: Phone, title: "Call Us", lines: ["+91 98765 43210", "+91 98765 43211", "Available 9AM - 8PM"] },
              { icon: Clock, title: "Opening Hours", lines: ["Monday - Saturday", "9:00 AM - 8:00 PM", "Sunday: 10AM - 6PM"] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="contact-card p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center group border border-gold-champagne/10 bg-surface-onyx">
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

          {/* Interactive Map Section */}
          <div className="animate-fade-in-up stagger-2 max-w-5xl mx-auto">
            <div className="glass-card-luxury rounded-2xl overflow-hidden border border-gold-champagne/10 aspect-21/9 relative group">
              <div className="absolute inset-0 bg-linear-to-br from-surface-elevated to-surface-onyx flex items-center justify-center">
                <div className="text-center p-4">
                  <MapPin className="w-12 h-12 text-gold-champagne mx-auto mb-4" />
                  <p className="text-text-ivory font-semibold mb-1">123 Beauty Street, Mumbai</p>
                  <p className="text-sm text-on-surface-variant">Click to view on Google Maps</p>
                </div>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-canvas/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Button className="btn-primary-luxury rounded-full px-6 py-2.5 h-auto text-xs uppercase tracking-widest font-bold">
                  Open in Google Maps
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}
