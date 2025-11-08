"use client";
import React from "react";
import { motion } from "framer-motion";
import { PurchaseOrder } from "@/lib/data/types";
import { Thermometer, Clock, Truck } from "lucide-react";
import { FormattedTime } from "@/components/dashboard/FormattedTime"; // Assuming this exists

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  deliveries: PurchaseOrder[];
};

export default function IncomingDeliveries({ deliveries }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Incoming Deliveries
      </h3>
      <div className="space-y-4">
        {deliveries.map((delivery) => {
          const isHot = delivery.liveTemperature > 4; // 4°C is a common threshold
          return (
            <div
              key={delivery.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                isHot
                  ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <Truck className="text-blue-500 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {delivery.distributorName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {delivery.itemCount} items
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
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
                      {delivery.liveTemperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ETA: <FormattedTime dateString={delivery.eta} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {deliveries.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            No incoming deliveries.
          </p>
        )}
      </div>
    </motion.section>
  );
}
