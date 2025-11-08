import React from "react";
import { motion } from "framer-motion";
import { Shipment } from "@/lib/data/farmerMockData";
import { AlertTriangle, Ship, Thermometer } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  shipments: Shipment[];
};

export default function ShipmentsCard({ shipments }: Props) {
  return (
    <motion.section
      id="shipments"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Shipments
        </h3>
        <button className="text-sm text-gray-500 hover:text-gray-900">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {shipments.map((shipment) => {
          const isDelayed = shipment.status === "delayed";
          const isHot = shipment.temperatureC > 6;
          return (
            <div
              key={shipment.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                isDelayed || isHot
                  ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              {isDelayed || isHot ? (
                <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-1" />
              ) : (
                <Ship className="text-blue-500 shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isDelayed || isHot
                      ? "text-red-800 dark:text-red-200"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {shipment.destination}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Shipment {shipment.id}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Thermometer
                    size={14}
                    className={isHot ? "text-red-500" : "text-gray-500"}
                  />
                  <span
                    className={`text-sm ${
                      isHot
                        ? "text-red-500 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {shipment.temperatureC}°C
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  isDelayed
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {shipment.status}
              </span>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
