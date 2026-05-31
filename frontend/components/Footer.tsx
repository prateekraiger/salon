import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Luxe Salon</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium beauty services tailored just for you. We believe everyone deserves to look and feel their best.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/#services", label: "Services" },
                { href: "/#about", label: "About Us" },
                { href: "/#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm">
              {["Haircut & Styling", "Hair Coloring", "Facial & Skincare", "Nail Care", "Bridal Packages", "Spa & Massage"].map((s) => (
                <li key={s}>
                  <Link href="/#services" className="hover:text-amber-400 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>123 Beauty Street, Fashion District, Mumbai 400001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-amber-400 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:hello@luxesalon.com" className="hover:text-amber-400 transition-colors">
                  hello@luxesalon.com
                </a>
              </li>
            </ul>
            <div className="mt-4 text-sm text-gray-500">
              <p>Mon – Sat: 9:00 AM – 8:00 PM</p>
              <p>Sunday: 10:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Luxe Salon. All rights reserved.</p>
          <p>Made with ❤️ for beauty</p>
        </div>
      </div>
    </footer>
  );
}
