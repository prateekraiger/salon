"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  service: string;
  date: string;
  avatar?: string;
  likes?: number;
  isVerified?: boolean;
}

interface ReviewsSectionProps {
  reviews?: Review[];
  className?: string;
  showHeader?: boolean;
  layout?: "grid" | "carousel" | "masonry";
  maxDisplay?: number;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Priya Sharma",
    text: "Absolutely loved my experience at Luxe Salon! The staff was incredibly professional and attentive. My hair has never looked better. Will definitely be coming back!",
    rating: 5,
    service: "Hair Styling",
    date: "2024-12-15",
    likes: 12,
    isVerified: true,
  },
  {
    id: "2",
    name: "Rahul Mehta",
    text: "Best grooming experience I've had in Mumbai. The attention to detail is remarkable. They really understand what looks good and make sure you're comfortable throughout.",
    rating: 5,
    service: "Men's Grooming",
    date: "2024-12-10",
    likes: 8,
    isVerified: true,
  },
  {
    id: "3",
    name: "Ananya Gupta",
    text: "The bridal makeup team was phenomenal! They understood my vision perfectly and executed it flawlessly. I felt like a princess on my special day.",
    rating: 5,
    service: "Bridal Makeup",
    date: "2024-11-28",
    likes: 24,
    isVerified: true,
  },
  {
    id: "4",
    name: "Vikram Patel",
    text: "Great service and ambiance. The facial treatment was very relaxing and my skin feels amazing. Highly recommend their spa services.",
    rating: 4,
    service: "Facial & Skincare",
    date: "2024-11-20",
    likes: 6,
    isVerified: true,
  },
  {
    id: "5",
    name: "Sneha Reddy",
    text: "Wonderful nail art services! The technician was patient and created exactly what I wanted. The salon is clean, modern, and very welcoming.",
    rating: 5,
    service: "Nail Art",
    date: "2024-11-15",
    likes: 15,
    isVerified: true,
  },
  {
    id: "6",
    name: "Arjun Kumar",
    text: "Professional service from start to finish. The online booking was seamless and the actual experience exceeded expectations. Value for money!",
    rating: 5,
    service: "Hair Coloring",
    date: "2024-11-08",
    likes: 9,
    isVerified: true,
  },
];

const SERVICE_CATEGORIES = [
  "All Services",
  "Hair Styling",
  "Hair Coloring",
  "Men's Grooming",
  "Bridal Makeup",
  "Facial & Skincare",
  "Nail Art",
  "Spa Services",
];

export function ReviewsSection({
  reviews = DEFAULT_REVIEWS,
  className,
  showHeader = true,
  layout = "grid",
  maxDisplay = 6,
}: ReviewsSectionProps) {
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [selectedService, setSelectedService] = useState("All Services");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const itemsPerPage = layout === "carousel" ? 3 : maxDisplay;
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  useEffect(() => {
    if (selectedService === "All Services") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.service.includes(selectedService)));
    }
    setCurrentPage(0);
  }, [selectedService, reviews]);

  useEffect(() => {
    if (!isAutoPlay || layout !== "carousel") return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, totalPages, layout]);

  const visibleReviews = layout === "carousel"
    ? filteredReviews.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : filteredReviews.slice(0, maxDisplay);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="glass-card-hover border-border/30 relative overflow-hidden h-full">
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          {renderStars(review.rating)}
          <span className="text-xs text-muted-foreground">{formatDate(review.date)}</span>
        </div>
        <p className="text-foreground/80 text-sm leading-relaxed mb-4 flex-1">
          &ldquo;{review.text}&rdquo;
        </p>
        <Badge variant="secondary" className="mb-4 w-fit text-[11px]">
          {review.service}
        </Badge>
        <Separator className="mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-accent/20">
              <AvatarFallback className="text-sm font-bold text-primary">
                {review.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-foreground text-sm">{review.name}</span>
              <div className="flex items-center gap-1">
                {review.isVerified && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 border-emerald-500 text-emerald-600">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {review.likes !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs">{review.likes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="reviews" className={cn("py-20 md:py-28 bg-transparent", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              What Clients Say
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Don&apos;t just take our word for it — hear from our happy clients.
            </p>
            
            {/* Filter */}
            <div className="mt-6 flex justify-center">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Grid Layout */}
        {layout === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {layout === "carousel" && (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
                  }}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIsAutoPlay(false);
                        setCurrentPage(i);
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === currentPage ? "bg-primary w-6" : "bg-primary/20"
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentPage((prev) => (prev + 1) % totalPages);
                  }}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View All Reviews Dialog */}
        {filteredReviews.length > maxDisplay && (
          <div className="text-center mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View All {filteredReviews.length} Reviews
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    All Customer Reviews
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="grid gap-4">
                    {filteredReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reviews", value: reviews.length, icon: MessageSquare },
            { label: "Average Rating", value: "4.8/5", icon: Star },
            { label: "Verified Clients", value: "98%", icon: User },
            { label: "Response Rate", value: "100%", icon: ThumbsUp },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
