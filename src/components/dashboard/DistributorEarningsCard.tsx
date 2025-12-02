"use client";

import React, { useState, useEffect } from "react";
import { Truck, DollarSign, Package, TrendingUp } from "lucide-react";
import { getEarnings, EarningsData } from "@/actions/earningsActions";

export default function DistributorEarningsCard() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true);
      const result = await getEarnings(period);
      if (result.success && result.data) {
        setEarnings(result.data);
      }
      setLoading(false);
    }
    fetchEarnings();
  }, [period]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!earnings) return null;

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Truck className="text-blue-600" size={20} />
          Delivery Earnings
        </h3>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "week" | "month" | "year")
          }
          className="px-3 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          ₹{earnings.totalRevenue.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Total delivery fees earned
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Package size={16} />
            <span>Deliveries Completed</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {earnings.totalOrders}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign size={16} />
            <span>Average per Delivery</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{(earnings.avgOrderValue || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp size={16} />
            <span>Total Delivery Fees</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{earnings.grossSales.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
            💰 100% Revenue Retention
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Keep all delivery fees - platform covers free delivery subsidies
          </p>
        </div>
      </div>
    </div>
  );
}
