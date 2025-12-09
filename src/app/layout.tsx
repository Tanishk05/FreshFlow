import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NextAuthProvider } from "@/providers/SessionProvider";
import { GoogleMapsProvider } from "@/providers/GoogleMapsProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com"
  ),
  title: {
    default: "FreshFlow - AI-Powered Fresh Food Supply Chain Management",
    template: "%s | FreshFlow",
  },
  description:
    "Transform your fresh food supply chain with FreshFlow's AI-powered platform. Real-time inventory tracking, predictive analytics, and automated logistics for farmers, distributors, and retailers.",
  keywords: [
    "fresh food supply chain",
    "agricultural technology",
    "AI supply chain management",
    "farm to table platform",
    "inventory management software",
    "food logistics platform",
    "predictive analytics agriculture",
    "fresh produce marketplace",
    "food distribution software",
    "agricultural marketplace",
    "smart farming platform",
    "food waste reduction",
    "supply chain optimization",
    "fresh food tracking",
  ],
  authors: [{ name: "FreshFlow Team" }],
  creator: "FreshFlow",
  publisher: "FreshFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com",
    siteName: "FreshFlow",
    title: "FreshFlow - AI-Powered Fresh Food Supply Chain Management",
    description:
      "Transform your fresh food supply chain with FreshFlow's AI-powered platform. Real-time tracking, predictive analytics, and automated logistics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreshFlow - AI-Powered Supply Chain Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshFlow - AI-Powered Fresh Food Supply Chain Management",
    description:
      "Transform your fresh food supply chain with AI-powered platform. Real-time tracking, predictive analytics, and automated logistics.",
    images: ["/og-image.png"],
    creator: "@freshflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthProvider>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
