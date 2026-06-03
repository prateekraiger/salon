"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, ArrowUp, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50 flex items-center gap-3 w-[90%] max-w-sm md:w-auto"
        >
          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-surface-elevated/90 backdrop-blur-md border border-gold-champagne/20 flex items-center justify-center text-on-surface-variant hover:text-gold-champagne hover:border-gold-champagne/50 shadow-lg transition-all duration-300 group cursor-pointer shrink-0"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Unified Luxury Dock */}
          <div className="flex-1 md:flex-initial flex items-center gap-1.5 bg-canvas/85 backdrop-blur-lg border border-gold-champagne/20 p-1.5 rounded-full shadow-2xl">
            {/* Call Button */}
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-gold-champagne transition-colors duration-200"
              aria-label="Call Luxe Salon"
            >
              <Phone className="w-4 h-4 text-gold-champagne" />
              <span className="font-sans">Call</span>
            </a>

            {/* Divider */}
            <div className="w-px h-6 bg-gold-champagne/15" />

            {/* Book Now Button */}
            <Link
              href="/services"
              className="btn-primary-luxury flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-[0_0_20px_rgba(212,165,116,0.4)] transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-sans">Book Now</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
