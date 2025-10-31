"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

type BackToTopProps = {
  show: boolean;
  onClick: () => void;
};

export default function BackToTop({ show, onClick }: BackToTopProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={onClick}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
