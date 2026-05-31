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
  Hair: "bg-purple-100 text-purple-700 border-purple-200",
  Skin: "bg-pink-100 text-pink-700 border-pink-200",
  Nails: "bg-rose-100 text-rose-700 border-rose-200",
  Spa: "bg-blue-100 text-blue-700 border-blue-200",
  Bridal: "bg-amber-100 text-amber-700 border-amber-200",
  Makeup: "bg-orange-100 text-orange-700 border-orange-200",
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
  Hair: "from-purple-50 to-purple-100/50",
  Skin: "from-pink-50 to-pink-100/50",
  Nails: "from-rose-50 to-rose-100/50",
  Spa: "from-blue-50 to-blue-100/50",
  Bridal: "from-amber-50 to-amber-100/50",
  Makeup: "from-orange-50 to-orange-100/50",
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
  const colorClass = categoryColors[service.category] || "bg-muted text-muted-foreground";
  const gradient = categoryGradients[service.category] || "from-muted to-muted/50";
  const emoji = categoryEmojiIcons[service.category] || "✂️";

  return (
    <Card className="service-card group overflow-hidden border-border/50 hover:border-primary/20 py-0 gap-0">
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
            <span className="mt-2.5 text-xs text-muted-foreground font-medium">{service.category}</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className={`${colorClass} border text-[11px] font-semibold`}>
            {service.category}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-amber-600 border-0 shadow-sm text-[11px] font-semibold gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            4.9
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="text-foreground font-semibold text-base leading-snug group-hover:text-primary transition-colors">
          {service.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-1.5 flex-1 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary/70" />
            {service.duration_minutes} min
          </span>
          <span className="text-xl font-bold text-foreground">
            ₹{service.price.toLocaleString()}
          </span>
        </div>

        <Button asChild className="mt-4 w-full rounded-xl gap-2" size="lg">
          <Link href={`/book?service=${service.id}`}>
            Book Now
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
