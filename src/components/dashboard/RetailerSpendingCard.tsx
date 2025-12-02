"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, Package, Sparkles } from "lucide-react";
import { getEarnings, EarningsData } from "@/actions/earningsActions";
import Link from "next/link";

export default function RetailerSpendingCard() {
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
    <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="text-purple-600" size={20} />
          Spending & Savings
        </h3>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "week" | "month" | "year")
          }
          className="px-3 py-1 text-sm border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
          ₹{earnings.totalRevenue.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Total spent on purchases
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Package size={16} />
            <span>Orders Placed</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {earnings.totalOrders}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign size={16} />
            <span>Average Order Value</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{(earnings.avgOrderValue || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <Sparkles size={16} />
            <span className="font-medium">Total Savings</span>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            ₹{earnings.platformCommission.toFixed(2)}
          </span>
        </div>

        {earnings.subscriptionTier !== "free" && (
          <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
              💎{" "}
              {earnings.subscriptionTier === "business"
                ? "Business"
                : "Enterprise"}{" "}
              Member
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {earnings.subscriptionTier === "business"
                ? "3% discount + free delivery at ₹1500"
                : "5% discount + free delivery at ₹1000"}
            </p>
          </div>
        )}

        {earnings.subscriptionTier === "free" && (
          <div className="mt-4 p-3 rounded-lg bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
              💡 Unlock More Savings
            </p>
            <Link
              href="/profile?tab=subscription"
              className="block text-center text-xs px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Upgrade to Business
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
