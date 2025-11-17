"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function SidePanel({
  isOpen,
  onClose,
  title,
  children,
}: SidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop - clickable to close */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/40"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="relative w-full sm:w-[480px] max-w-[90%] bg-white dark:bg-gray-900 border-l dark:border-gray-800 shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X />
              </button>
            </div>
            <div>{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
