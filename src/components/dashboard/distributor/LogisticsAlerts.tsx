"use client";
import React from "react";
import { motion } from "framer-motion";
import { LogisticsAlert } from "@/lib/data/types";
import { Thermometer, Route } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  alerts: LogisticsAlert[];
};

export default function LogisticsAlerts({ alerts }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI Logistics Alerts
      </h3>
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isTempAlert = alert.title.includes("TEMP");
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                alert.type === "risk"
                  ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
              }`}
            >
              {isTempAlert ? (
                <Thermometer className="text-red-600 dark:text-red-400 shrink-0 mt-1" />
              ) : (
                <Route className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-1" />
              )}

              <div>
                <p
                  className={`font-medium ${
                    alert.type === "risk"
                      ? "text-red-800 dark:text-red-200"
                      : "text-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {alert.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            All systems nominal. No alerts.
          </p>
        )}
      </div>
    </motion.section>
  );
}
