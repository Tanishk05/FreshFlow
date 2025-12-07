"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

type MobileHeaderProps = {
  onToggleTheme: () => void;
  darkMode: boolean;
};

export default function MobileHeader({
  onToggleTheme,
  darkMode,
}: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-50/70 dark:bg-gray-950/70 backdrop-blur-md shadow-sm">
      <nav className="px-6 py-5 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
          FreshFlow<span className="text-green-400 dark:text-green-600">.</span>
        </div>
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
      </nav>
    </header>
  );
}
