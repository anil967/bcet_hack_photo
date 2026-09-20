import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PhotoFinder — Find Your Event Photos Instantly",
  description: "Privacy-first event photography finder. Take a quick selfie to discover every moment you appear in, powered by biometric vector search.",
  keywords: ["event photography", "photo finder", "hackathon photos", "face search", "college events"],
  authors: [{ name: "PhotoFinder Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="min-h-screen flex flex-col justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
