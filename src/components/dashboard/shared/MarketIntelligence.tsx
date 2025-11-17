"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  CloudRain,
  AlertTriangle,
  Info,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { MarketIntelligence } from "@/actions/sentimentAnalysisActions";
import {
  generateMarketIntelligence,
  generateMarketSummary,
} from "@/actions/sentimentAnalysisActions";

interface Props {
  userRole: "farmer" | "distributor" | "retailer";
  userProducts?: string[];
}

export default function MarketIntelligenceCard({
  userRole,
  userProducts = [],
}: Props) {
  const [alerts, setAlerts] = useState<MarketIntelligence[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only fetch once when component mounts
    if (hasLoaded) return;

    let isCancelled = false;

    const fetchIntelligence = async () => {
      setIsLoading(true);
      try {
        const [alertsData, summaryData] = await Promise.all([
          generateMarketIntelligence(userRole, userProducts),
          generateMarketSummary(userRole),
        ]);

        if (!isCancelled) {
          setAlerts(alertsData);
          setSummary(summaryData);
          setHasLoaded(true);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching market intelligence:", error);
          setHasLoaded(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchIntelligence();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
    // Only depend on userRole to prevent infinite re-renders from array recreation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const getCategoryIcon = (category: MarketIntelligence["category"]) => {
    const icons = {
      price_trend: TrendingUp,
      weather_alert: CloudRain,
      demand_forecast: TrendingDown,
      supply_chain: AlertTriangle,
      policy_update: FileText,
    };
    const Icon = icons[category];
    return <Icon className="w-5 h-5" />;
  };

  const getSeverityColors = (severity: MarketIntelligence["severity"]) => {
    const colors = {
      info: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-400",
        icon: "text-blue-600 dark:text-blue-400",
      },
      warning: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: "text-yellow-600 dark:text-yellow-400",
      },
      critical: {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-400",
        icon: "text-red-600 dark:text-red-400",
      },
    };
    return colors[severity];
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-semibold">AI Market Intelligence</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show message when no intelligence data available
  if (alerts.length === 0 && !summary) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Market Intelligence
          </h3>
        </div>
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Market intelligence temporarily unavailable
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
          AI Market Intelligence
        </h3>
        <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
          AI-Powered
        </span>
      </div>

      {/* Market Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Market Overview
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* Intelligence Alerts */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const colors = getSeverityColors(alert.severity);
          const isExpanded = expandedAlert === alert.id;

          return (
            <motion.div
              key={alert.id}
              layout
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <button
                onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={colors.icon}>
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${colors.text}`}>
                        {alert.title}
                      </h4>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        } ${colors.icon}`}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.summary}
                    </p>
                    {alert.affectedProducts &&
                      alert.affectedProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alert.affectedProducts.map((product) => (
                            <span
                              key={product}
                              className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Impact:
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.impact}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Recommendations:
                      </h5>
                      <ul className="space-y-1">
                        {alert.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                          >
                            <span className={`${colors.icon} mt-1`}>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>Confidence: {alert.confidence}%</span>
                      <span>Sources: {alert.sources.join(", ")}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No market alerts at this time</p>
        </div>
      )}
    </motion.div>
  );
}
