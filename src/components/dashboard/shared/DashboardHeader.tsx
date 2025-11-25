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
  /** Hide the mobile menu (sidebar) button for bottom-nav UX */
  hideMobileMenuButton?: boolean;
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
  hideMobileMenuButton = false,
}: Props) {
  return (
    <>
      {/* Mobile-only header */}
      <motion.header
        variants={itemVariants}
        className="flex md:hidden justify-between items-center px-4 py-3 border-b border-gray-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
      >
        {!hideMobileMenuButton ? (
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        ) : (
          <div className="w-8" />
        )}
        <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100 truncate">
          {title}
        </h1>
        <div className="flex items-center gap-1">
          {showAlerts && (
            <button
              onClick={() => onAlertsClick && onAlertsClick()}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-xl relative transition-colors"
              aria-label="Open alerts"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-sm">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          )}
          {showExport && (
            <button
              onClick={onExportClick}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
              aria-label="Export"
            >
              <Download size={20} />
            </button>
          )}
          {showNewPlan && (
            <button
              onClick={onNewPlanClick}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors"
              aria-label={newButtonText}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          )}
          <ThemeSwitcher />
        </div>
      </motion.header>

      {/* Desktop-only header */}
      <motion.header
        variants={itemVariants}
        className="hidden md:flex justify-between items-center px-8 pt-6 pb-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {showExport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExportClick}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download size={16} />
              Export
            </motion.button>
          )}
          {showNewPlan && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewPlanClick}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 text-sm font-medium\"
            >
              <Plus size={18} strokeWidth={2.5} />
              {newButtonText}
            </motion.button>
          )}
          {showAlerts && (
            <button
              onClick={() => onAlertsClick && onAlertsClick()}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-xl relative transition-colors"
              aria-label="Open alerts"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-sm">
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
