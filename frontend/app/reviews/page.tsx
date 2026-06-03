"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import ReviewsSection from "@/components/ReviewsSection";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-ivory font-sans antialiased overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 sm:pt-28 sm:pb-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px] animate-pulse-subtle" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px] animate-pulse-subtle" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center animate-fade-in-up">
            <Badge 
              variant="secondary" 
              className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
            >
              <Star className="w-3.5 h-3.5 mr-2" />
              Verified Reviews
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4">
              Client Testimonials
            </h1>
            <div className="section-divider my-4" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg">
              Hear directly from our discerning clients about their styling, facial, and spa experiences at Luxe Salon.
            </p>
          </div>

          {/* Reviews Directory */}
          <div className="animate-fade-in-up stagger-1">
            <ReviewsSection showHeader={false} layout="grid" maxDisplay={9} />
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}
