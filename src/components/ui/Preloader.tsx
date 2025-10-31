"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type PreloaderProps = {
  onComplete: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); // 2-second preload time
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 bg-gray-50 dark:bg-gray-950 z-100 flex justify-center items-center"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative"
        >
          <svg
            className="w-24 h-24 text-green-600 dark:text-green-400"
            viewBox="0 0 100 100"
            fill="none"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M50 20 L50 50 L70 50"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
