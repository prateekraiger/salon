import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Luxe Salon | Premium Beauty Services & Salon Booking",
  description: "Book your perfect salon experience at Luxe Salon. Professional haircuts, hair coloring, skincare, spa treatments, bridal packages and more. Easy online booking with instant confirmation. Mumbai's premier luxury salon.",
  keywords: "salon, beauty salon, hair salon, haircut, hair color, skincare, spa, bridal makeup, nail care, salon booking, mumbai salon, luxury salon, beauty services",
  authors: [{ name: "Luxe Salon" }],
  openGraph: {
    title: "Luxe Salon | Premium Beauty Services",
    description: "Book your perfect salon experience online. Premium beauty services tailored just for you.",
    type: "website",
    locale: "en_IN",
    siteName: "Luxe Salon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Salon | Premium Beauty Services",
    description: "Book your perfect salon experience online. Premium beauty services tailored just for you.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className={`${inter.className} antialiased bg-[#0a0a0b] text-[#faf9f7]`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1c1c1f",
              color: "#faf9f7",
              borderRadius: "12px",
              border: "1px solid rgba(212, 165, 116, 0.2)",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.4), 0 0 20px rgba(212, 165, 116, 0.1)",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: {
              style: {
                background: "#065f46",
                color: "#fff",
                border: "1px solid #047857",
              },
              iconTheme: { primary: "#fff", secondary: "#065f46" },
            },
            error: {
              style: {
                background: "#7f1d1d",
                color: "#fff",
                border: "1px solid #991b1b",
              },
              iconTheme: { primary: "#fff", secondary: "#7f1d1d" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
