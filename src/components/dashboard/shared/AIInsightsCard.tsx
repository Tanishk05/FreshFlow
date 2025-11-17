"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Trophy,
  Lightbulb,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { PersonalizedInsight } from "@/actions/aiInsightsActions";
import { generatePersonalizedInsights } from "@/actions/aiInsightsActions";

interface Props {
  role: "farmer" | "distributor" | "retailer";
  dashboardData?: {
    stats: Record<string, unknown>;
    recentActivity: string[];
    inventory?: unknown[];
    orders?: unknown[];
    performance?: Record<string, number>;
  };
}

export default function AIInsightsCard({ role, dashboardData }: Props) {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only fetch once when component mounts
    if (hasLoaded) return;

    let isCancelled = false;

    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const data = {
          role,
          userId: "current-user", // This will be replaced by actual user ID in production
          stats: dashboardData?.stats || {},
          recentActivity: dashboardData?.recentActivity || [],
          inventory: dashboardData?.inventory,
          orders: dashboardData?.orders,
          performance: dashboardData?.performance,
        };

        const insightsData = await generatePersonalizedInsights(data);

        if (!isCancelled) {
          setInsights(insightsData);
          setHasLoaded(true);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching AI insights:", error);
          setHasLoaded(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchInsights();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
    // Only depend on role to prevent infinite re-renders from object recreation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const getInsightIcon = (type: PersonalizedInsight["type"]) => {
    const icons = {
      opportunity: TrendingUp,
      warning: AlertCircle,
      achievement: Trophy,
      tip: Lightbulb,
    };
    return icons[type];
  };

  const getInsightColors = (type: PersonalizedInsight["type"]) => {
    const colors = {
      opportunity: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-400",
        icon: "text-green-600 dark:text-green-400",
      },
      warning: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: "text-yellow-600 dark:text-yellow-400",
      },
      achievement: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-400",
        icon: "text-purple-600 dark:text-purple-400",
      },
      tip: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-400",
        icon: "text-blue-600 dark:text-blue-400",
      },
    };
    return colors[type];
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-semibold">AI Insights for You</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show message when no insights available
  if (insights.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🤖 AI Insights for You
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            AI insights temporarily unavailable
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This feature may not work properly due to API rate limits. Please
            check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-500 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🤖 AI Insights for You
        </h3>
        <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
          Personalized
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const colors = getInsightColors(insight.type);

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.icon} mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${colors.text} mb-1`}>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.message}
                  </p>

                  <div className="flex items-center justify-between">
                    {insight.actionable && insight.action && (
                      <button
                        onClick={() => {
                          if (insight.action?.url) {
                            window.location.hash =
                              insight.action.url.split("#")[1] || "";
                          }
                        }}
                        className={`text-sm font-medium ${colors.text} hover:underline flex items-center gap-1`}
                      >
                        {insight.action.label}
                        {insight.action.url ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-auto">
                      {insight.confidence}% confident
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No new insights at this time</p>
          <p className="text-sm mt-1">
            Check back soon for personalized recommendations!
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          💡 Insights refresh daily based on your activity and market conditions
        </p>
      </div>
    </motion.div>
  );
}
