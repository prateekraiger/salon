"use client";
import Link from "next/link";
import { Clock, Star, ChevronRight, Scissors } from "lucide-react";
import { Service } from "@/lib/api";

interface Props {
  service: Service;
}

const categoryColors: Record<string, string> = {
  "Hair": "bg-purple-100 text-purple-700",
  "Skin": "bg-pink-100 text-pink-700",
  "Nails": "bg-rose-100 text-rose-700",
  "Spa": "bg-blue-100 text-blue-700",
  "Bridal": "bg-amber-100 text-amber-700",
  "Makeup": "bg-orange-100 text-orange-700",
};

const categoryEmojis: Record<string, string> = {
  "Hair": "✂️",
  "Skin": "✨",
  "Nails": "💅",
  "Spa": "🧖",
  "Bridal": "👰",
  "Makeup": "💄",
};

export default function ServiceCard({ service }: Props) {
  const colorClass = categoryColors[service.category] || "bg-gray-100 text-gray-700";
  const emoji = categoryEmojis[service.category] || "✂️";

  return (
    <div className="service-card bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
      {/* Image / Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
        {service.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-5xl">{emoji}</span>
            <span className="mt-2 text-xs text-amber-600 font-medium">{service.category}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {service.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 text-xs text-amber-600 font-semibold shadow">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          4.9
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-900 font-bold text-lg leading-snug">{service.name}</h3>
        <p className="text-gray-500 text-sm mt-1.5 flex-1 line-clamp-2">{service.description}</p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            {service.duration_minutes} min
          </span>
          <span className="text-xl font-bold text-gray-900">
            ₹{service.price.toLocaleString()}
          </span>
        </div>

        <Link
          href={`/book?service=${service.id}`}
          className="mt-4 btn-primary flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
        >
          Book Now
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
