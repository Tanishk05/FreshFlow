import React from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Alert } from "@/actions/alertActions";
import Link from "next/link";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Icon mapping for alert types
const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  reminder: Bell,
};

// Color mapping for alert types
const alertColors = {
  critical:
    "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  reminder:
    "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200",
};

const iconColors = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
  reminder: "text-gray-500 dark:text-gray-400",
};

type Props = {
  alerts: Alert[];
  onOpenPanel?: () => void;
};

export default function AlertsCard({ alerts, onOpenPanel }: Props) {
  // Show only top 3 most important alerts
  const displayAlerts = alerts.slice(0, 3);
  const hasMore = alerts.length > 3;

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          Alerts & Notifications
          {alerts.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
              {alerts.length}
            </span>
          )}
        </h3>
        {onOpenPanel && alerts.length > 0 && (
          <button
            onClick={onOpenPanel}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All
          </button>
        )}
      </div>
      <div className="space-y-3">
        {displayAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No alerts at the moment. All good! ✨
            </p>
          </div>
        ) : (
          <>
            {displayAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alertColors[alert.type]
                  }`}
                >
                  <Icon
                    className={`${iconColors[alert.type]} shrink-0 mt-1`}
                    size={18}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs opacity-90 mt-0.5 line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.produceId && (
                      <Link
                        href="/my-produce"
                        className="inline-block mt-1.5 text-xs underline hover:no-underline"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <button
                onClick={onOpenPanel}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition-colors"
              >
                + {alerts.length - 3} more alert
                {alerts.length - 3 > 1 ? "s" : ""}
              </button>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
