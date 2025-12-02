"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

type HeaderProps = {
  onScrollToSection: (id: string) => void;
  onOpenModal: (type: "login" | "signup") => void;
  onToggleTheme: () => void;
  darkMode: boolean;
};

const navItems = [
  { id: "problem", label: "The Problem" },
  { id: "solution", label: "Our Solution" },
  { id: "value", label: "Value" },
  { id: "pricing", label: "Pricing" },
];

export default function Header({
  onScrollToSection,
  onOpenModal,
  onToggleTheme,
  darkMode,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="hidden md:flex fixed top-0 left-0 right-0 z-40 justify-center pt-6"
    >
      <motion.nav
        className="flex justify-between items-center space-x-8 bg-gray-50/70 dark:bg-gray-950/70 backdrop-blur-lg rounded-full shadow-xl px-6 py-3"
        whileHover={{ scale: 1.01 }}
      >
        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
          FreshFlow<span className="text-green-400 dark:text-green-600">.</span>
          
        </div>

        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onScrollToSection(item.id)}
              className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 capitalize"
              whileHover={{ y: -3 }}
              whileTap={{ y: 0 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => onOpenModal("login")}
            className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            Login / Register
          </motion.button>

          <motion.button
            onClick={() => onScrollToSection("contact")}
            className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Demo
          </motion.button>

          <motion.button
            onClick={onToggleTheme}
            className="text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.nav>
    </motion.header>
  );
}
