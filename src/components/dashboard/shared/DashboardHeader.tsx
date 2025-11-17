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
  /** Optional handler for opening alerts side panel */
  onAlertsClick?: () => void;
  /** Optional handler for export button */
  onExportClick?: () => void;
  /** Show or hide the new plan button */
  showNewPlan?: boolean;
  /** Show or hide the export button */
  showExport?: boolean;
  /** Show or hide the alerts button */
  showAlerts?: boolean;
  /** Number of alerts to display as badge */
  alertCount?: number;
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardHeader({
  onNewPlanClick,
  setIsMobileOpen,
  onAlertsClick,
  onExportClick,
  title = "Overview",
  newButtonText = "New Plan",
  showNewPlan = true,
  showExport = true,
  showAlerts = true,
  alertCount = 0,
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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          {showAlerts && (
            <button
              onClick={() => onAlertsClick && onAlertsClick()}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white relative"
              aria-label="Open alerts"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          )}
          {showExport && (
            <button
              onClick={onExportClick}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label="Export"
            >
              <Download size={20} />
            </button>
          )}
          {showNewPlan && (
            <button
              onClick={onNewPlanClick}
              className="p-2 text-green-600 hover:text-green-700"
              aria-label={newButtonText}
            >
              <Plus size={20} />
            </button>
          )}
          <ThemeSwitcher />
        </div>
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
          {showExport && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportClick}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </motion.button>
          )}
          {showNewPlan && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewPlanClick}
              className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {newButtonText}
            </motion.button>
          )}
          {showAlerts && (
            <button
              onClick={() => onAlertsClick && onAlertsClick()}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white relative"
              aria-label="Open alerts"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          )}
        </div>
      </motion.header>
    </>
  );
}
