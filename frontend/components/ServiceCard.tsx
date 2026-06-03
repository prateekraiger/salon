"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Service } from "@/lib/api";

interface ServiceCardProps {
  service: Service;
}

// Category icons and colors
const categoryStyles: Record<string, { gradient: string; icon: string }> = {
  Hair: { gradient: "from-amber-500/20 to-orange-600/20", icon: "✂️" },
  Skin: { gradient: "from-rose-500/20 to-pink-600/20", icon: "✨" },
  Nails: { gradient: "from-purple-500/20 to-violet-600/20", icon: "💅" },
  Spa: { gradient: "from-teal-500/20 to-cyan-600/20", icon: "🧘" },
  Bridal: { gradient: "from-pink-500/20 to-rose-600/20", icon: "👰" },
  Makeup: { gradient: "from-fuchsia-500/20 to-purple-600/20", icon: "💄" },
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const categoryStyle = categoryStyles[service.category] || { gradient: "from-[#d4a574]/20 to-[#b8956a]/20", icon: "✨" };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="service-card group relative bg-surface-onyx border-gold-champagne/10 overflow-hidden rounded-2xl">
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${categoryStyle.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <CardContent className="p-0">
        {/* Header with icon and category */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${categoryStyle.gradient} flex items-center justify-center text-2xl border border-gold-champagne/20 group-hover:scale-110 transition-transform duration-300`}>
                {categoryStyle.icon}
              </div>
              <div>
                <Badge 
                  variant="secondary" 
                  className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 text-[10px] uppercase tracking-wider font-semibold mb-1"
                >
                  {service.category}
                </Badge>
                <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                  <Clock className="w-3 h-3" />
                  {service.duration_minutes} mins
                </div>
              </div>
            </div>
          </div>
          
          {/* Service name */}
          <h3 className="text-lg font-serif font-semibold text-text-ivory mb-2 group-hover:text-gold-champagne transition-colors duration-300">
            {service.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-gold-champagne/20 to-transparent mx-5" />
        
        {/* Footer with price and CTA */}
        <div className="p-5 pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Starting from</p>
            <p className="text-xl font-serif font-bold text-gold-champagne">
              {formatPrice(service.price)}
            </p>
          </div>
          
          <Link href={`/book?service=${service.id}`}>
            <Button 
              className="btn-primary-luxury rounded-xl px-5 py-2.5 h-auto text-xs font-semibold uppercase tracking-wider group/btn"
            >
              <span className="flex items-center gap-2">
                Book Now
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-linear-to-br from-gold-champagne/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Card>
  );
}
