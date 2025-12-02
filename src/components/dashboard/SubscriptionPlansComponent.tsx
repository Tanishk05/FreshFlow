"use client";

import React, { useState, useEffect } from "react";
import { Crown, Check, Loader2, Zap, TrendingUp, Package } from "lucide-react";
import {
  getMySubscription,
  subscribeToPlan,
  cancelSubscription,
} from "@/actions/subscriptionActions";

type SubscriptionData = {
  tier: "free" | "business" | "enterprise";
  status: "active" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
};

const PLANS = [
  {
    tier: "free" as const,
    name: "Free",
    price: 0,
    billingPeriod: "Forever",
    features: [
      "Free delivery on orders ₹2,000+",
      "Standard support",
      "Access to marketplace",
      "Basic analytics",
    ],
    color: "gray",
    icon: Package,
  },
  {
    tier: "business" as const,
    name: "Business",
    price: 999,
    billingPeriod: "per month",
    features: [
      "Free delivery on orders ₹1,500+",
      "Priority support",
      "Advanced analytics",
      "Volume discounts",
      "Loyalty points multiplier (1.5x)",
      "Dedicated account manager",
    ],
    color: "blue",
    icon: TrendingUp,
    popular: true,
  },
  {
    tier: "enterprise" as const,
    name: "Enterprise",
    price: 2499,
    billingPeriod: "per month",
    features: [
      "Free delivery on orders ₹1,000+",
      "Premium 24/7 support",
      "Custom analytics & reporting",
      "Maximum volume discounts",
      "Loyalty points multiplier (2x)",
      "Dedicated account manager",
      "Custom contract terms",
      "API access",
    ],
    color: "purple",
    icon: Crown,
  },
];

export default function SubscriptionPlansComponent() {
  const [currentSubscription, setCurrentSubscription] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      setLoading(true);
      const result = await getMySubscription();
      if (result.success && result.data) {
        setCurrentSubscription(result.data as SubscriptionData);
      }
      setLoading(false);
    }
    fetchSubscription();
  }, []);

  const handleSubscribe = async (tier: "business" | "enterprise") => {
    setActionLoading(tier);
    const result = await subscribeToPlan(tier);
    if (result.success) {
      // Refetch subscription data after successful subscribe
      const subResult = await getMySubscription();
      if (subResult.success && subResult.data) {
        setCurrentSubscription(subResult.data as SubscriptionData);
      }
    }
    setActionLoading(null);
  };

  const handleCancel = async () => {
    setActionLoading("cancel");
    const result = await cancelSubscription();
    if (result.success) {
      // Refetch subscription data after successful cancellation
      const subResult = await getMySubscription();
      if (subResult.success && subResult.data) {
        setCurrentSubscription(subResult.data as SubscriptionData);
      }
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const currentTier = currentSubscription?.tier || "free";
  const isActive = currentSubscription?.status === "active";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown size={28} />
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
        </div>
        <p className="text-purple-100">
          Upgrade your account to unlock premium features and save more
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && currentTier !== "free" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Plan: {PLANS.find((p) => p.tier === currentTier)?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Status:{" "}
                <span className="capitalize">{currentSubscription.status}</span>
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </div>
          </div>

          {isActive && (
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Started:{" "}
                {new Date(currentSubscription.startDate).toLocaleDateString()}
              </p>
              <p>
                Next billing:{" "}
                {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
              <p>
                Auto-renew:{" "}
                {currentSubscription.autoRenew ? "Enabled" : "Disabled"}
              </p>
            </div>
          )}

          {isActive && (
            <button
              onClick={handleCancel}
              disabled={actionLoading === "cancel"}
              className="mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
            >
              {actionLoading === "cancel" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </span>
              ) : (
                "Cancel Subscription"
              )}
            </button>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isUpgrade =
            (currentTier === "free" && plan.tier !== "free") ||
            (currentTier === "business" && plan.tier === "enterprise");
          const Icon = plan.icon;

          return (
            <div
              key={plan.tier}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden ${
                isCurrent
                  ? "border-green-500 shadow-lg"
                  : plan.popular
                  ? "border-purple-500 shadow-md"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-br-lg">
                  Current Plan
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Plan Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${plan.color}-100 dark:bg-${plan.color}-900`}
                  >
                    <Icon
                      className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                  </div>
                </div>

                {/* Pricing */}
                <div className="py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      /{plan.billingPeriod}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 py-4 border-t border-gray-200 dark:border-gray-700">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : isUpgrade ? (
                    <button
                      onClick={() =>
                        handleSubscribe(plan.tier as "business" | "enterprise")
                      }
                      disabled={actionLoading === plan.tier}
                      className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                        plan.popular
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {actionLoading === plan.tier ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Upgrading...
                        </span>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-4 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    >
                      Downgrade Not Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Why Upgrade?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Lower Free Delivery Threshold</p>
              <p className="text-gray-500 dark:text-gray-400">
                Save on every order with reduced minimum for free delivery
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Loyalty Points Multiplier</p>
              <p className="text-gray-500 dark:text-gray-400">
                Earn points faster and unlock rewards sooner
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Priority Support</p>
              <p className="text-gray-500 dark:text-gray-400">
                Get faster response times from our support team
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Advanced Analytics</p>
              <p className="text-gray-500 dark:text-gray-400">
                Make better decisions with detailed insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
