"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeSwitcher } from "@/components/dashboard/ThemeSwitcher"; // Assuming this exists
import { Plus, Download, Bell, Menu } from "lucide-react";

type Props = {
  onNewPlanClick: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  title?: string;
  newButtonText?: string;
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardHeader({
  onNewPlanClick,
  isMobileOpen,
  setIsMobileOpen,
  title = "Overview",
  newButtonText = "New Plan",
}: Props) {
  return (
    <>
      {/* Mobile-only header */}
      <motion.header
        variants={itemVariants}
        className="flex md:hidden justify-between items-center p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-950"
      >
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <ThemeSwitcher />
      </motion.header>

      {/* Desktop-only header */}
      <motion.header
        variants={itemVariants}
        className="hidden md:flex justify-between items-center p-8 pb-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewPlanClick}
            className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {newButtonText}
          </motion.button>
          <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <Bell size={20} />
          </button>
        </div>
      </motion.header>
    </>
  );
}
