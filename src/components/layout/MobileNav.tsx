"use client";

import { motion } from "framer-motion";
import { Home, Beaker, Sprout, Tag, MessageSquare, User } from "lucide-react";

type MobileNavProps = {
  onScrollToSection: (id: string) => void;
  onOpenModal: (type: "login" | "signup") => void;
  scrollToTop: () => void;
};

export default function MobileNav({
  onScrollToSection,
  onOpenModal,
  scrollToTop,
}: MobileNavProps) {
  const navItems = [
    { icon: Home, label: "Home", onClick: scrollToTop },
    {
      icon: Beaker,
      label: "Solution",
      onClick: () => onScrollToSection("solution"),
    },
    { icon: Sprout, label: "Value", onClick: () => onScrollToSection("value") },
    {
      icon: Tag,
      label: "Pricing",
      onClick: () => onScrollToSection("pricing"),
    },
    {
      icon: MessageSquare,
      label: "Contact",
      onClick: () => onScrollToSection("contact"),
    },
    { icon: User, label: "Log In", onClick: () => onOpenModal("login") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        {navItems.map((item, i) => (
          <motion.button
            key={i}
            onClick={item.onClick}
            className="flex flex-col items-center text-gray-600 dark:text-gray-400"
            whileTap={{ scale: 0.9 }}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
