"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";

type EarningsData = {
  totalEarnings: number;
  deliveriesCompleted: number;
  averageEarningPerDelivery: number;
  earningsThisMonth: number;
  deliveriesThisMonth: number;
  earningsToday: number;
  deliveriesToday: number;
};

type Props = {
  earnings: EarningsData;
};

export default function EarningsOverview({ earnings }: Props) {
  return (
    <ModernCard
      title="Earnings Overview"
      icon={<TrendingUp className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      <div className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Total Earnings */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 md:col-span-1 p-4 rounded-lg bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                Total Earnings
              </p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">
              ₹{earnings.totalEarnings.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {earnings.deliveriesCompleted} deliveries
            </p>
          </motion.div>

          {/* This Month */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                This Month
              </p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
              ₹{earnings.earningsThisMonth.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              {earnings.deliveriesThisMonth} deliveries
            </p>
          </motion.div>

          {/* Today */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                Today
              </p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-300">
              ₹{earnings.earningsToday.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
              {earnings.deliveriesToday} deliveries
            </p>
          </motion.div>
        </div>

        {/* Average Earning */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  Average per Delivery
                </p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  ₹{earnings.averageEarningPerDelivery.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {earnings.deliveriesCompleted}
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500">
                Total deliveries
              </p>
            </div>
          </div>
        </motion.div>

        {/* Growth Indicator */}
        {earnings.earningsThisMonth > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {earnings.deliveriesThisMonth > 0 && (
                <>
                  You&apos;ve earned an average of{" "}
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ₹
                    {(
                      earnings.earningsThisMonth / earnings.deliveriesThisMonth
                    ).toFixed(2)}
                  </span>{" "}
                  per delivery this month
                </>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </ModernCard>
  );
}
