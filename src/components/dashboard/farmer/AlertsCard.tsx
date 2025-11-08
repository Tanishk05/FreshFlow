import React from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, Droplet } from "lucide-react";
import { FormattedTime } from "@/components/dashboard/FormattedTime";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Define a type for the alerts, based on the useMemo in the parent
type Alert = {
  id: string;
  type: "reminder" | "advisory" | "risk";
  title: string;
  message: string;
  eta?: string;
};

type Props = {
  alerts: Alert[];
};

export default function AlertsCard({ alerts }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alerts & Notifications
        </h3>
        <button className="text-sm text-gray-500 hover:text-gray-900">
          Manage
        </button>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg ${
              alert.type === "risk"
                ? "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
                : ""
            }`}
          >
            {alert.type === "risk" && (
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-1" />
            )}
            {alert.type === "reminder" && (
              <Bell className="text-gray-500 shrink-0 mt-1" />
            )}
            {alert.type === "advisory" && (
              <Droplet className="text-blue-500 shrink-0 mt-1" />
            )}
            <div>
              <p
                className={`font-medium ${
                  alert.type === "risk"
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {alert.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {alert.message}{" "}
                {alert.eta && <FormattedTime dateString={alert.eta} />}
              </p>
              {alert.type === "risk" && !alert.id.startsWith("s") && (
                <button className="mt-2 px-3 py-1 rounded-lg text-sm bg-yellow-600 text-white hover:bg-yellow-700">
                  Adjust Plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
