"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";
import { Alert } from "@/actions/alertActions";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";

// Icon mapping for alert types
const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  reminder: Bell,
};

// Enhanced color schemes for alert types
const alertStyles = {
  critical: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-300 dark:border-red-800",
    text: "text-red-900 dark:text-red-200",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-300 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-200",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    badge:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-300 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-200",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  reminder: {
    bg: "bg-gray-50 dark:bg-gray-800/50",
    border: "border-gray-300 dark:border-gray-700",
    text: "text-gray-900 dark:text-gray-200",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  },
};

type Props = {
  alerts: Alert[];
  onOpenPanel?: () => void;
};

export default function AlertsCard({ alerts, onOpenPanel }: Props) {
  // Show only top 4 most important alerts
  const displayAlerts = alerts.slice(0, 4);
  const hasMore = alerts.length > 4;

  return (
    <ModernCard
      title="Alerts & Notifications"
      icon={<Bell className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      {/* Alert Count Badge */}
      {alerts.length > 0 && (
        <div className="absolute top-4 right-4">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          >
            {alerts.length} {alerts.length === 1 ? "Alert" : "Alerts"}
          </motion.span>
        </div>
      )}

      {displayAlerts.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="No Alerts"
          description="All good! You don't have any alerts at the moment. ✨"
        />
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {displayAlerts.map((alert, idx) => {
                const Icon = alertIcons[alert.type];
                const styles = alertStyles[alert.type];

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    layout
                    className={`p-4 rounded-lg border ${styles.bg} ${styles.border} transition-all hover:shadow-md cursor-pointer`}
                    onClick={() => {
                      if (alert.produceId) {
                        window.location.href = "/my-produce";
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Alert Icon */}
                      <div
                        className={`p-2 rounded-lg ${styles.iconBg} shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`font-semibold text-sm ${styles.text}`}
                          >
                            {alert.title}
                          </h4>
                          {alert.type === "critical" && (
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}
                            >
                              Urgent
                            </motion.span>
                          )}
                        </div>

                        <p
                          className={`text-xs ${styles.text} opacity-90 line-clamp-2 mb-2`}
                        >
                          {alert.message}
                        </p>

                        {/* Action Link */}
                        {alert.produceId && (
                          <div className="flex items-center gap-1 text-xs font-medium hover:underline">
                            <span className={styles.iconColor}>
                              View details
                            </span>
                            <ChevronRight
                              className={`w-3 h-3 ${styles.iconColor}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* View More Button */}
          {hasMore && onOpenPanel && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onOpenPanel}
              className="mt-4 w-full py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              + {alerts.length - 4} more alert{alerts.length - 4 > 1 ? "s" : ""}{" "}
              →
            </motion.button>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {alerts.filter((a) => a.type === "critical").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Critical
              </div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {alerts.filter((a) => a.type === "warning").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Warning
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {
                  alerts.filter(
                    (a) => a.type === "info" || a.type === "reminder"
                  ).length
                }
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Info
              </div>
            </div>
          </motion.div>
        </>
      )}
    </ModernCard>
  );
}
