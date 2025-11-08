"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react"; // Using a different icon

export default function SignOutBtn() {
  return (
    <motion.button
      // 1. Call signOut() on click. It knows where to redirect.
      onClick={() => signOut({ callbackUrl: "/" })} // Redirect to home
      className="
        flex items-center justify-center gap-2
        py-2 px-4
        rounded-full
        font-medium
        text-gray-700       // Standard text
        bg-gray-100         // A different, neutral color
        border border-gray-300
        transition-colors
        hover:bg-gray-200
        dark:bg-gray-700    // Dark mode styles
        dark:border-gray-600
        dark:text-gray-200
        dark:hover:bg-gray-600
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </motion.button>
  );
}
