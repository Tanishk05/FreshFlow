"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  MapPin,
  Weight,
  TrendingUp,
  Package,
  Info,
} from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";

type DeliveryFeeDisplayProps = {
  deliveryFee: number;
  distance?: number;
  weight?: number;
  destination?: string;
  showBreakdown?: boolean;
};

export default function DeliveryFeeDisplay({
  deliveryFee,
  distance,
  weight,
  destination,
  showBreakdown = false,
}: DeliveryFeeDisplayProps) {
  // Calculate estimated breakdown (approximate)
  const baseFee = 50;
  const distanceFee = distance ? Math.round(distance * 3.5 * 100) / 100 : 0;
  const weightFee = weight ? Math.round(weight * 0.4 * 100) / 100 : 0;

  return (
    <ModernCard
      title="Delivery Details"
      icon={<IndianRupee className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      <div className="space-y-4">
        {/* Main Delivery Fee */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-lg bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                Delivery Fee
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                ₹{deliveryFee.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {distance !== undefined && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  Distance
                </p>
              </div>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {distance.toFixed(1)} km
              </p>
            </motion.div>
          )}

          {weight !== undefined && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                  Weight
                </p>
              </div>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {weight.toFixed(0)} kg
              </p>
            </motion.div>
          )}

          {destination && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  Destination
                </p>
              </div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {destination}
              </p>
            </motion.div>
          )}
        </div>

        {/* Fee Breakdown */}
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Fee Breakdown
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Base Fee:</span>
                <span className="font-medium">₹{baseFee.toFixed(2)}</span>
              </div>
              {distance && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Distance Fee:</span>
                  <span className="font-medium">₹{distanceFee.toFixed(2)}</span>
                </div>
              )}
              {weight && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Weight Fee:</span>
                  <span className="font-medium">₹{weightFee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-300 dark:border-gray-600 flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span className="text-green-600 dark:text-green-400">
                  ₹{deliveryFee.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ModernCard>
  );
}
