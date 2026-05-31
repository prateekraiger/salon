import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Luxe Salon - Premium Beauty Services",
  description: "Book your perfect salon experience. Professional haircuts, coloring, skincare, and more. Easy online booking with instant confirmation.",
  keywords: "salon, beauty, haircut, hair color, skincare, spa, booking, mumbai",
  openGraph: {
    title: "Luxe Salon - Premium Beauty Services",
    description: "Book your perfect salon experience online. Premium beauty services tailored just for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              borderRadius: "12px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)",
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
                background: "#991b1b",
                color: "#fff",
                border: "1px solid #b91c1c",
              },
              iconTheme: { primary: "#fff", secondary: "#991b1b" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
