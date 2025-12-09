"use client";

import React, { useState, useEffect } from "react";
import { useScroll, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

// Layout Components
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/layout/MobileHeader"; // <--- 1. IMPORT
import MobileNav from "@/components/layout/MobileNav";
import BackToTop from "@/components/layout/BackToTop";

// SEO Components
import {
  OrganizationStructuredData,
  WebApplicationStructuredData,
  FAQStructuredData,
} from "@/components/seo/StructuredData";

// ... (other imports)
import Preloader from "@/components/ui/Preloader";
import Modal from "@/components/ui/Modal";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import SolutionSection from "@/components/sections/SolutionSection";
import ValueSection from "@/components/sections/ValueSection";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

// Scene - Lazy loaded only on desktop after delay
const HeroScene = dynamic(() => import("@/components/scene/HeroScene"), {
  ssr: false,
  loading: () => null, // No loading indicator needed
});

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"login" | "signup">("login");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showScene, setShowScene] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Only load 3D scene on desktop after a delay to prioritize content
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      // Delay loading by 1 second to prioritize content
      const timer = setTimeout(() => {
        setShowScene(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setShowBackToTop(latest > window.innerHeight);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // --- Handlers ---
  const handleLoadingComplete = () => setLoading(false);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const openModal = (type: "login" | "signup") => {
    setModalType(type);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* SEO Structured Data */}
      <OrganizationStructuredData />
      <WebApplicationStructuredData />
      <FAQStructuredData
        items={[
          {
            question: "What is FreshFlow?",
            answer:
              "FreshFlow is an AI-powered fresh food supply chain management platform that connects farmers, distributors, and retailers with real-time tracking, predictive analytics, and automated logistics.",
          },
          {
            question: "How does FreshFlow reduce food waste?",
            answer:
              "FreshFlow uses AI-powered demand forecasting, real-time inventory tracking, and shelf-life monitoring to optimize supply chain operations and minimize food waste throughout the distribution process.",
          },
          {
            question: "Who can use FreshFlow?",
            answer:
              "FreshFlow is designed for farmers, distributors, and retailers in the fresh food supply chain. Each role has access to specialized features tailored to their specific needs.",
          },
          {
            question: "Is FreshFlow free to use?",
            answer:
              "FreshFlow offers a free tier with basic features. Premium plans are available for businesses that need advanced analytics, higher transaction volumes, and priority support.",
          },
        ]}
      />

      <AnimatePresence>
        {loading && <Preloader onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <div className="text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Only render HeroScene if showScene is true (desktop, after delay) */}
        {showScene && <HeroScene />}
        <Modal isOpen={modalOpen} onClose={closeModal} type={modalType} />

        {/* --- 2. THE FIX ---
            We now render BOTH headers only when mounted.
            This prevents any theme-related UI from rendering on the server.
        */}
        {isMounted && (
          <>
            <Header
              onScrollToSection={scrollToSection}
              onOpenModal={openModal}
              onToggleTheme={toggleTheme}
              darkMode={theme === "dark"}
            />
            <MobileHeader
              onToggleTheme={toggleTheme}
              darkMode={theme === "dark"}
            />
          </>
        )}

        <MobileNav
          onScrollToSection={scrollToSection}
          onOpenModal={openModal}
          scrollToTop={scrollToTop}
        />

        {!loading && (
          <main>
            <HeroSection onScrollToSection={scrollToSection} />
            <ProblemSection />
            <SolutionSection />
            <ValueSection />
            <PricingSection />
            <CTASection />
          </main>
        )}

        <Footer />
        <BackToTop show={showBackToTop} onClick={scrollToTop} />
      </div>
    </>
  );
}
