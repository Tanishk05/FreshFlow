"use client";
import React from "react";
import { motion } from "framer-motion";
import { Truck as TruckType } from "@/lib/data/types";
import { Thermometer, Truck } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  fleet: TruckType[];
};

const StatusChip = ({ status }: { status: TruckType["status"] }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      status === "en-route"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : status === "delayed"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : status === "loading"
        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default function FleetManagement({ fleet }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Fleet Management
      </h3>
      <div className="space-y-4">
        {fleet.map((truck) => (
          <div
            key={truck.id}
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <Truck className="text-blue-500 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {truck.id} - {truck.driver}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {truck.status === "en-route" || truck.status === "delayed"
                  ? `To: ${truck.destination}`
                  : "At Warehouse"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer
                size={14}
                className={
                  truck.liveTemperature > 4 ? "text-red-500" : "text-gray-500"
                }
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {truck.liveTemperature.toFixed(1)}°C
              </span>
            </div>
            <StatusChip status={truck.status} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
