"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Package } from "lucide-react";
import { getEarnings, EarningsData } from "@/actions/earningsActions";

export default function FarmerEarningsCard() {
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
    <div className="bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="text-emerald-600" size={20} />
          Your Earnings
        </h3>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "week" | "month" | "year")
          }
          className="px-3 py-1 text-sm border border-emerald-300 dark:border-emerald-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
          ₹{earnings.totalRevenue.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Net earnings after platform commission
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Package size={16} />
            <span>Orders Completed</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {earnings.totalOrders}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp size={16} />
            <span>Gross Sales</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{earnings.grossSales.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-xs">💰</span>
            <span>Platform Commission</span>
          </div>
          <span className="font-semibold text-red-600 dark:text-red-400">
            -₹{earnings.platformCommission.toFixed(2)}
          </span>
        </div>

        {earnings.subscriptionTier !== "free" && (
          <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
              💎 {earnings.subscriptionTier === "pro" ? "Pro" : "Premium"}{" "}
              Member Benefits
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {earnings.subscriptionTier === "pro"
                ? "3% lower commission rate"
                : "2% lower commission + priority listing"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
