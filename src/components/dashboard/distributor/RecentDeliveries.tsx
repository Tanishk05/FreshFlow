"use client";
import React from "react";
import { motion } from "framer-motion";
import { Package, MapPin, Calendar, IndianRupee } from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";

type RecentDelivery = {
  orderId: string;
  produceName: string;
  quantity: number;
  unit: string;
  deliveryFee: number;
  deliveryDate: Date;
  destination: string;
};

type Props = {
  deliveries: RecentDelivery[];
};

export default function RecentDeliveries({ deliveries }: Props) {
  if (deliveries.length === 0) {
    return (
      <ModernCard
        title="Recent Deliveries"
        icon={<Package className="w-5 h-5" />}
        gradient="blue"
        glassEffect
      >
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent deliveries
          </p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard
      title={`Recent Deliveries (${deliveries.length})`}
      icon={<Package className="w-5 h-5" />}
      gradient="blue"
      glassEffect
    >
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {deliveries.map((delivery, index) => (
          <motion.div
            key={delivery.orderId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                {/* Product Info */}
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {delivery.produceName}
                  </p>
                </div>

                {/* Quantity */}
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                  {delivery.quantity} {delivery.unit}
                </p>

                {/* Destination */}
                <div className="flex items-center gap-2 ml-6">
                  <MapPin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {delivery.destination}
                  </p>
                </div>

                {/* Delivery Date */}
                <div className="flex items-center gap-2 ml-6">
                  <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(delivery.deliveryDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-lg font-bold">
                    {delivery.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Earned
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ModernCard>
  );
}
