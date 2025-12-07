"use client";

import React, { useState, useEffect } from "react";

type Props = {
  role: "farmer" | "retailer" | "distributor";
};
import { Sparkles, TrendingUp, Gift, Clock, Loader2 } from "lucide-react";
import { getMyLoyaltyPoints, getPointsHistory } from "@/actions/loyaltyActions";

type LoyaltyData = {
  currentPoints: number;
  lifetimePoints: number;
  tier: string;
  tierBenefits: {
    name?: string;
    benefits?: string[];
  };
  nextTier: string | null;
  pointsToNextTier: number;
  redemptionValue: number;
};

type PointsHistoryItem = {
  _id: string;
  type: "earned" | "redeemed" | "expired";
  points: number;
  description: string;
  createdAt: Date;
};

export default function LoyaltyPointsComponent({ role }: Props) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [loyaltyResult, historyResult] = await Promise.all([
        getMyLoyaltyPoints(),
        getPointsHistory(20),
      ]);

      if (loyaltyResult.success && loyaltyResult.data) {
        setLoyaltyData(loyaltyResult.data as LoyaltyData);
      }

      if (historyResult.success && historyResult.data) {
        setHistory(historyResult.data as PointsHistoryItem[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  if (!loyaltyData) return null;

  const tierColors = {
    bronze:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    silver:
      "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    gold: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
    platinum:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
  };

  const tierEmojis = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
  };

  // Role-based logic for loyalty points
  let tierLabel = "Loyalty Rewards";
  let pointsDescription =
    "Earn points with every purchase and redeem for discounts";
  if (role === "farmer") {
    tierLabel = "Farmer Loyalty Rewards";
    pointsDescription =
      "Earn points for every sale and redeem for agri-benefits.";
  } else if (role === "retailer") {
    tierLabel = "Retailer Loyalty Rewards";
    pointsDescription =
      "Earn points for every purchase and redeem for store credits.";
  } else if (role === "distributor") {
    tierLabel = "Distributor Loyalty Rewards";
    pointsDescription =
      "Earn points for every delivery and redeem for logistics perks.";
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-4">
          <Sparkles size={18} />
          <span className="text-sm font-medium">{tierLabel}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Loyalty Points
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{pointsDescription}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition border-b-2 ${
            activeTab === "overview"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition border-b-2 ${
            activeTab === "history"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points Balance */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Points Balance
              </h3>
              <Gift className="text-purple-600" size={24} />
            </div>

            <div className="mb-6">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {loyaltyData.currentPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Worth ₹{loyaltyData.redemptionValue.toFixed(2)} in discounts
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Lifetime Points
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {loyaltyData.lifetimePoints.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Redemption Rate
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  100 pts = ₹10
                </span>
              </div>
            </div>
          </div>

          {/* Tier Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Membership Tier
              </h3>
              <TrendingUp className="text-emerald-600" size={24} />
            </div>

            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
                  tierColors[loyaltyData.tier as keyof typeof tierColors]
                }`}
              >
                <span className="text-2xl">
                  {tierEmojis[loyaltyData.tier as keyof typeof tierEmojis]}
                </span>
                <span className="font-bold text-lg capitalize">
                  {loyaltyData.tier}
                </span>
              </div>
            </div>

            {loyaltyData.nextTier && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress to {loyaltyData.nextTier}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loyaltyData.pointsToNextTier.toLocaleString()} pts needed
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-linear-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (loyaltyData.lifetimePoints /
                          (loyaltyData.lifetimePoints +
                            loyaltyData.pointsToNextTier)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {loyaltyData.tierBenefits?.name || loyaltyData.tier} Benefits:
              </p>
              <ul className="space-y-1">
                {(loyaltyData.tierBenefits?.benefits || []).map(
                  (benefit: string, index: number) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1"
                    >
                      <span className="text-emerald-500">•</span>
                      {benefit}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* How to Earn */}
          <div className="lg:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={20} />
              How to Earn Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="text-2xl mb-2">🛒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Make Purchases
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn 1 point for every ₹1 spent
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Tier Multipliers
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Higher tiers earn up to 2x points
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Redeem Anytime
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimum 100 points (₹10 value)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Clock
                className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
                size={48}
              />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No Transaction History
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start earning points by making purchases
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === "earned"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : item.type === "redeemed"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                          item.type === "earned"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.type === "redeemed"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {item.type === "earned" ? "+" : "-"}
                        {item.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
