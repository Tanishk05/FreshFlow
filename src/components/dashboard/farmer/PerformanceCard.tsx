"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Award,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";

type Metrics = {
  totalRevenue: number;
  revenueGrowth: number;
  fulfillmentRate: number;
  averageOrderValue: number;
  totalOrders: number;
  deliveredOrders: number;
  activeListings: number;
  totalQuantitySold: number;
  topSellingProduce: string;
};

type Props = {
  metrics: Metrics;
};

export default function PerformanceCard({ metrics }: Props) {
  return (
    <ModernCard
      title="Performance Metrics"
      icon={<Award className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {/* Period Selector */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Calendar className="w-4 h-4 text-gray-500" />
        <button className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          This Month
        </button>
      </div>

      <div className="space-y-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Total Revenue
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metrics.deliveredOrders} orders delivered
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                metrics.revenueGrowth >= 0
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}
            >
              {metrics.revenueGrowth > 0 ? "+" : ""}
              {metrics.revenueGrowth.toFixed(1)}%
            </span>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                This month
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{metrics.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Avg. Order Value</span>
              <span className="font-medium">
                ₹{metrics.averageOrderValue.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Fulfillment Rate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Fulfillment Rate
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metrics.deliveredOrders}/{metrics.totalOrders} orders
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                metrics.fulfillmentRate >= 95
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : metrics.fulfillmentRate >= 80
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
              }`}
            >
              {metrics.fulfillmentRate >= 95
                ? "Excellent"
                : metrics.fulfillmentRate >= 80
                ? "Good"
                : "Fair"}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Completion rate</span>
              <span className="font-medium">
                {metrics.fulfillmentRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.fulfillmentRate}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full ${
                  metrics.fulfillmentRate >= 95
                    ? "bg-linear-to-r from-green-400 to-emerald-500"
                    : metrics.fulfillmentRate >= 80
                    ? "bg-linear-to-r from-blue-400 to-cyan-500"
                    : "bg-linear-to-r from-yellow-400 to-orange-500"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Sales Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Sales Summary
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This month&apos;s performance
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.totalOrders}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Quantity Sold
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.totalQuantitySold} kg
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Listings
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.activeListings}
              </span>
            </div>
            {metrics.topSellingProduce !== "N/A" && (
              <div className="flex justify-between items-center p-2 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50">
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Top Selling
                </span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {metrics.topSellingProduce}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-4 p-3 rounded-lg border ${
          metrics.fulfillmentRate >= 95 && metrics.revenueGrowth >= 0
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50"
            : metrics.fulfillmentRate >= 80 || metrics.revenueGrowth >= 0
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50"
        }`}
      >
        <div className="flex items-start gap-2">
          <div
            className={`p-1 rounded ${
              metrics.fulfillmentRate >= 95 && metrics.revenueGrowth >= 0
                ? "bg-green-100 dark:bg-green-900/30"
                : metrics.fulfillmentRate >= 80 || metrics.revenueGrowth >= 0
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-yellow-100 dark:bg-yellow-900/30"
            }`}
          >
            <Award
              className={`w-4 h-4 ${
                metrics.fulfillmentRate >= 95 && metrics.revenueGrowth >= 0
                  ? "text-green-600 dark:text-green-400"
                  : metrics.fulfillmentRate >= 80 || metrics.revenueGrowth >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`}
            />
          </div>
          <div className="flex-1">
            <h4
              className={`text-sm font-semibold mb-1 ${
                metrics.fulfillmentRate >= 95 && metrics.revenueGrowth >= 0
                  ? "text-green-900 dark:text-green-300"
                  : metrics.fulfillmentRate >= 80 || metrics.revenueGrowth >= 0
                  ? "text-blue-900 dark:text-blue-300"
                  : "text-yellow-900 dark:text-yellow-300"
              }`}
            >
              Performance Summary
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.fulfillmentRate >= 95 && metrics.revenueGrowth >= 0
                ? `Excellent work! You've achieved ${metrics.fulfillmentRate.toFixed(
                    1
                  )}% fulfillment with ${
                    metrics.revenueGrowth > 0 ? "growing" : "stable"
                  } revenue.`
                : metrics.fulfillmentRate >= 80 || metrics.revenueGrowth >= 0
                ? `Good progress! ${metrics.fulfillmentRate.toFixed(
                    1
                  )}% fulfillment rate. ${
                    metrics.revenueGrowth >= 0
                      ? "Revenue is growing."
                      : "Focus on increasing sales."
                  }`
                : `Focus on improving order fulfillment and revenue. Current rate: ${metrics.fulfillmentRate.toFixed(
                    1
                  )}%`}
            </p>
          </div>
        </div>
      </motion.div>
    </ModernCard>
  );
}
