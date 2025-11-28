import type { Metadata } from "next";
import Head from "next/head";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NextAuthProvider } from "@/providers/SessionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agridata - AI for Fresh Supply Chains",
  description:
    "Revolutionizing the fresh food supply chain with predictive AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCwOoYwi0H-XjLNCPF9UybCAsrPnFb8Xdo&libraries=places"
          async
          defer
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthProvider>
            {children}
            <SpeedInsights />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
