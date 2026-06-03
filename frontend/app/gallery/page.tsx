"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop", alt: "Hair Styling" },
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop", alt: "Makeup Application" },
  { src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=500&fit=crop", alt: "Nail Art" },
  { src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=500&fit=crop", alt: "Facial Treatment" },
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=500&fit=crop", alt: "Spa Massage" },
  { src: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=500&fit=crop", alt: "Bridal Makeup" },
];

export default function GalleryPage() {
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
              <ImageIcon className="w-3.5 h-3.5 mr-2" />
              Our Work
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4">
              Luxe Lookbook Gallery
            </h1>
            <div className="section-divider my-4" />
            <p className="text-on-surface-variant max-w-xl mx-auto text-base sm:text-lg">
              Take a look inside Luxe Salon. Here are some of our favorite hair styling, makeup designs, and facial treatments.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="animate-fade-in-up stagger-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {GALLERY_IMAGES.map((img, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "gallery-item group relative overflow-hidden rounded-2xl border border-gold-champagne/10 cursor-pointer aspect-3/4"
                  )}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-canvas/90 via-canvas/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="space-y-1">
                      <Badge className="bg-gold-champagne text-canvas hover:bg-gold-champagne text-[9px] uppercase tracking-wider font-semibold">
                        {img.alt}
                      </Badge>
                      <h3 className="text-text-ivory font-serif font-bold text-lg mt-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-gold-champagne" />
                        Premium Finish
                      </h3>
                    </div>
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
