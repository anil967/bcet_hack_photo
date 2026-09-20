import type { Metadata, Viewport } from "next";
import { Cinzel, Marcellus, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
  weight: ["400"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PhotoFinder — The Odyssey Hackathon",
  description: "Find your moments from The Odyssey Hackathon. Take a selfie to discover your event photographs instantly.",
  keywords: ["HackOdyssey", "The Odyssey", "BCET Hackathon", "photo finder", "biometric search"],
  authors: [{ name: "The Odyssey Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0705",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${cinzel.variable} ${marcellus.variable} ${cormorant.variable}`}
    >
      <body className="font-body antialiased bg-[#0a0705] text-[#e0d5c1] selection:bg-[#f39c12]/30 selection:text-[#ffd700]">
        <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
