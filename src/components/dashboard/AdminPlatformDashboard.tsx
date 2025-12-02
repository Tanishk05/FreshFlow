"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Loader2,
  Crown,
} from "lucide-react";
import { getPlatformEarnings } from "@/actions/earningsActions";
import { getSubscriptionStats } from "@/actions/subscriptionActions";

type PlatformData = {
  platformRevenue: number;
  totalCommission: number;
  totalServiceFees: number;
  totalOrders: number;
  totalVolume: number;
  avgOrderValue: number;
};

type SubscriptionStats = {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  tierBreakdown: Record<string, number>;
};

export default function AdminPlatformDashboard() {
  const [earningsData, setEarningsData] = useState<PlatformData | null>(null);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [earningsResult, subsResult] = await Promise.all([
        getPlatformEarnings(period),
        getSubscriptionStats(),
      ]);

      if (earningsResult.success && earningsResult.data) {
        setEarningsData(earningsResult.data as PlatformData);
      }

      if (subsResult.success && subsResult.data) {
        setSubscriptionData(subsResult.data as SubscriptionStats);
      }

      setLoading(false);
    }

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Revenue Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor platform performance and earnings
          </p>
        </div>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "week" | "month" | "year")
          }
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              Total Revenue
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ₹{earningsData?.platformRevenue.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Platform earnings this {period}
          </p>
        </div>

        <div className="bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Commission
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ₹{earningsData?.totalCommission.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            From transaction fees
          </p>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Package className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Service Fees
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ₹{earningsData?.totalServiceFees.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Additional platform fees
          </p>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
              <Users className="text-orange-600" size={20} />
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Total Orders
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {earningsData?.totalOrders || 0}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Avg: ₹{earningsData?.avgOrderValue.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Subscription Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription Revenue
            </h3>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              ₹{subscriptionData?.monthlyRevenue || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monthly recurring revenue
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Subscriptions
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {subscriptionData?.totalSubscriptions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Subscriptions
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {subscriptionData?.activeSubscriptions || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Breakdown
          </h3>

          <div className="space-y-3">
            {subscriptionData?.tierBreakdown &&
              Object.entries(subscriptionData.tierBreakdown).map(
                ([tier, count]) => (
                  <div
                    key={tier}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          tier === "pro" || tier === "business"
                            ? "bg-blue-500"
                            : tier === "premium" || tier === "enterprise"
                            ? "bg-purple-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                        {tier}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                )
              )}
          </div>
        </div>
      </div>

      {/* Transaction Volume */}
      <div className="bg-linear-to-r from-emerald-500 to-green-500 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Transaction Volume</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total GMV</p>
            <p className="text-3xl font-bold">
              ₹{earningsData?.totalVolume.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Platform Take Rate</p>
            <p className="text-3xl font-bold">
              {earningsData && earningsData.totalVolume > 0
                ? (
                    (earningsData.platformRevenue / earningsData.totalVolume) *
                    100
                  ).toFixed(2)
                : "0.00"}
              %
            </p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Avg Commission Rate</p>
            <p className="text-3xl font-bold">4.0%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
