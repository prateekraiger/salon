"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { getServices, Service } from "@/lib/api";
import {
  Star, ChevronRight, Phone, MapPin, Clock,
  Shield, Award, Users, Sparkles, ArrowDown
} from "lucide-react";

const CATEGORIES = ["All", "Hair", "Skin", "Nails", "Spa", "Bridal", "Makeup"];

const TESTIMONIALS = [
  { name: "Priya S.", text: "Amazing service! My hair has never looked better. The staff is so professional and welcoming.", rating: 5 },
  { name: "Ananya K.", text: "Best salon in the city! The booking process was super easy and the results were stunning.", rating: 5 },
  { name: "Meera R.", text: "The facial was absolutely refreshing. I'll definitely be coming back every month!", rating: 5 },
];

const STATS = [
  { icon: Users, value: "5000+", label: "Happy Clients" },
  { icon: Award, value: "8+", label: "Years of Excellence" },
  { icon: Sparkles, value: "50+", label: "Services Offered" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getServices()
      .then((res) => setServices(res.data.data || []))
      .catch(() => setServices(DEMO_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-16">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Premium Beauty Experience
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in-up">
            Look <span className="gradient-text">Beautiful</span>,<br />
            Feel <span className="gradient-text">Confident</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up">
            Discover premium salon services tailored just for you. Book your appointment in minutes and let our experts work their magic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link href="/#services" className="btn-primary px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-lg">
              Explore Services
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="tel:+919876543210" className="bg-white text-gray-800 border border-gray-200 px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow hover:shadow-md transition-all">
              <Phone className="w-5 h-5 text-amber-600" />
              Call to Book
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass-card rounded-2xl p-4 text-center">
                <Icon className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 animate-bounce text-amber-600">
            <ArrowDown className="w-6 h-6 mx-auto" />
          </div>
        </div>
      </section>

      {/* ─── Services ───────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">What We Offer</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">Our Services</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From classic cuts to luxury spa treatments — we have everything you need to look and feel amazing.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  activeCategory === cat
                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-44 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No services in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── About ──────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">About Us</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-5">
                Where Beauty Meets <span className="gradient-text">Excellence</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Luxe Salon has been Mumbai's go-to destination for premium beauty services for over 8 years. Our team of skilled professionals is dedicated to bringing out the best version of you.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                We use only the finest products and techniques to ensure every visit leaves you looking and feeling absolutely stunning. Your comfort, satisfaction, and confidence are our top priorities.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Premium Products", desc: "Only certified, high-quality beauty products" },
                  { icon: Award, label: "Expert Stylists", desc: "Trained professionals with years of experience" },
                  { icon: Clock, label: "Easy Booking", desc: "Book in minutes, anytime online" },
                  { icon: Star, label: "5-Star Experience", desc: "Consistently rated 5 stars by clients" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-amber-200 to-rose-200 rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="text-8xl mb-6">✂️</div>
                  <h3 className="text-3xl font-extrabold text-amber-900 mb-2">Luxe Salon</h3>
                  <p className="text-amber-700 text-lg">Premium Beauty Services</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="bg-white/70 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-extrabold text-gray-900">8+</div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                    <div className="bg-white/70 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-extrabold text-gray-900">5000+</div>
                      <div className="text-xs text-gray-500">Clients</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-300 rounded-2xl opacity-40 rotate-12" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-rose-300 rounded-full opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">What Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, text, rating }) => (
              <div key={name} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800">
                    {name[0]}
                  </div>
                  <span className="font-semibold text-gray-900">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Ready for Your Transformation?
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            Book your appointment today and experience the Luxe difference.
          </p>
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 bg-white text-amber-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Book Your Appointment
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Find Us</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">Contact & Location</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: "Address", lines: ["123 Beauty Street", "Fashion District, Mumbai 400001"] },
              { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 98765 43211"] },
              { icon: Clock, title: "Hours", lines: ["Mon–Sat: 9:00 AM – 8:00 PM", "Sunday: 10:00 AM – 6:00 PM"] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                {lines.map((line, i) => (
                  <p key={i} className="text-gray-500 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Demo Services (fallback when API is unavailable) ─────────────────────
const DEMO_SERVICES: Service[] = [
  { id: "1", name: "Classic Haircut", description: "Expert cut tailored to your face shape and style preferences.", price: 399, duration_minutes: 45, category: "Hair", is_active: true, created_at: "" },
  { id: "2", name: "Hair Coloring", description: "Full hair coloring using premium, vibrant colors that last longer.", price: 1499, duration_minutes: 120, category: "Hair", is_active: true, created_at: "" },
  { id: "3", name: "Deep Cleansing Facial", description: "Thorough facial cleansing for glowing, refreshed skin.", price: 799, duration_minutes: 60, category: "Skin", is_active: true, created_at: "" },
  { id: "4", name: "Manicure & Pedicure", description: "Complete nail care with polish, buffing, and massage.", price: 599, duration_minutes: 60, category: "Nails", is_active: true, created_at: "" },
  { id: "5", name: "Relaxation Massage", description: "Full body relaxation massage to release stress and tension.", price: 1299, duration_minutes: 90, category: "Spa", is_active: true, created_at: "" },
  { id: "6", name: "Bridal Makeover", description: "Complete bridal package including makeup, hair & styling.", price: 4999, duration_minutes: 180, category: "Bridal", is_active: true, created_at: "" },
  { id: "7", name: "HD Makeup", description: "High definition makeup for special occasions and events.", price: 1999, duration_minutes: 90, category: "Makeup", is_active: true, created_at: "" },
  { id: "8", name: "Keratin Treatment", description: "Smooth, frizz-free hair with long-lasting keratin treatment.", price: 2999, duration_minutes: 150, category: "Hair", is_active: true, created_at: "" },
];
