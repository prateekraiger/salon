"use client";
import Link from "next/link";
import { Clock, Star, ChevronRight } from "lucide-react";
import { Service } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  service: Service;
}

const categoryColors: Record<string, string> = {
  Hair: "bg-canvas text-gold-champagne border-bronze-warm/30",
  Skin: "bg-canvas text-gold-champagne border-bronze-warm/30",
  Nails: "bg-canvas text-gold-champagne border-bronze-warm/30",
  Spa: "bg-canvas text-gold-champagne border-bronze-warm/30",
  Bridal: "bg-canvas text-gold-champagne border-bronze-warm/30",
  Makeup: "bg-canvas text-gold-champagne border-bronze-warm/30",
};

const categoryEmojis: Record<string, string> = {
  Hair: "scissors-icon",
  Skin: "sparkles-icon",
  Nails: "nail-icon",
  Spa: "spa-icon",
  Bridal: "bridal-icon",
  Makeup: "makeup-icon",
};

const categoryGradients: Record<string, string> = {
  Hair: "from-surface-onyx to-canvas",
  Skin: "from-surface-onyx to-canvas",
  Nails: "from-surface-onyx to-canvas",
  Spa: "from-surface-onyx to-canvas",
  Bridal: "from-surface-onyx to-canvas",
  Makeup: "from-surface-onyx to-canvas",
};

const categoryEmojiIcons: Record<string, string> = {
  Hair: "✂️",
  Skin: "✨",
  Nails: "💅",
  Spa: "🧖",
  Bridal: "👰",
  Makeup: "💄",
};

export default function ServiceCard({ service }: Props) {
  const colorClass = categoryColors[service.category] || "bg-surface-onyx text-text-ivory border-outline/30";
  const gradient = categoryGradients[service.category] || "from-surface-onyx to-canvas";
  const emoji = categoryEmojiIcons[service.category] || "✂️";

  return (
    <Card className="glass-card-luxury group overflow-hidden border border-bronze-warm/15 hover:border-gold-champagne/40 transition-all duration-300 py-0 gap-0">
      {/* Image / Placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {service.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
            <span className="mt-2.5 text-xs text-bronze-warm font-medium uppercase tracking-widest">{service.category}</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className={`${colorClass} border text-[10px] font-semibold tracking-wider uppercase bg-surface-onyx/80 backdrop-blur-sm`}>
            {service.category}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-surface-onyx/80 backdrop-blur-sm text-gold-champagne border border-gold-champagne/30 text-[10px] font-semibold gap-1">
            <Star className="w-3 h-3 fill-gold-champagne text-gold-champagne" />
            4.9
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1 bg-surface-onyx text-text-ivory">
        <h3 className="text-text-ivory font-serif font-bold text-lg leading-snug group-hover:text-gold-champagne transition-colors">
          {service.name}
        </h3>
        <p className="text-on-surface-variant text-sm mt-1.5 flex-1 line-clamp-2 leading-relaxed font-sans">
          {service.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-bronze-warm font-sans">
            <Clock className="w-3.5 h-3.5 text-bronze-warm" />
            {service.duration_minutes} min
          </span>
          <span className="text-xl font-bold text-gold-champagne font-serif">
            ₹{service.price.toLocaleString()}
          </span>
        </div>

        <Button asChild className="btn-ghost-luxury mt-4 w-full rounded-full gap-2 py-5 font-sans uppercase tracking-widest text-xs font-bold" size="lg">
          <Link href={`/book?service=${service.id}`}>
            Book Now
            <ChevronRight className="w-4 h-4 text-gold-champagne" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
