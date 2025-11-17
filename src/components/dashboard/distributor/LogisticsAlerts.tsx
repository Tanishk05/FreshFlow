"use client";
import React from "react";
import { motion } from "framer-motion";
import { Alert } from "@/actions/alertActions";
import { Thermometer, Route, AlertTriangle, Info } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  alerts: Alert[];
};

export default function LogisticsAlerts({ alerts }: Props) {
  // Filter to show only logistics-related alerts
  const logisticsAlerts = alerts.filter(
    (a) =>
      a.category === "logistics" ||
      a.category === "temperature" ||
      a.category === "delivery"
  );

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI Logistics Alerts
      </h3>
      <div className="space-y-4">
        {logisticsAlerts.slice(0, 5).map((alert) => {
          const isTempAlert = alert.category === "temperature";
          const isDeliveryAlert = alert.category === "delivery";

          // Determine color based on alert type
          const colorClasses =
            alert.type === "critical"
              ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              : alert.type === "warning"
              ? "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
              : "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";

          const IconComponent = isTempAlert
            ? Thermometer
            : isDeliveryAlert
            ? Route
            : alert.type === "critical" || alert.type === "warning"
            ? AlertTriangle
            : Info;

          const iconColorClass =
            alert.type === "critical"
              ? "text-red-600 dark:text-red-400"
              : alert.type === "warning"
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-blue-600 dark:text-blue-400";

          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${colorClasses}`}
            >
              <IconComponent
                className={`${iconColorClass} shrink-0 mt-1`}
                size={20}
              />

              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
        {logisticsAlerts.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            All systems nominal. No alerts.
          </p>
        )}
      </div>
    </motion.section>
  );
}
