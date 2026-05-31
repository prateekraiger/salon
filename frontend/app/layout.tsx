import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Luxe Salon – Premium Beauty Services",
  description: "Book your perfect salon experience. Professional haircuts, coloring, skincare, and more. Easy online booking with instant confirmation.",
  keywords: "salon, beauty, haircut, hair color, skincare, spa, booking",
  openGraph: {
    title: "Luxe Salon – Premium Beauty Services",
    description: "Book your perfect salon experience online.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              style: { background: '#065f46', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#065f46' },
            },
            error: {
              style: { background: '#991b1b', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#991b1b' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
