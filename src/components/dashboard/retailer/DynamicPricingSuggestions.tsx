"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Zap, AlertCircle } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type PricingSuggestion = {
  id: string;
  itemId: string;
  itemName: string;
  currentPrice: number;
  suggestedPrice: number;
  discountPercentage: number;
  reason: string;
  shelfLifeDays: number;
  urgency: "critical" | "high" | "medium";
};

type Props = {
  suggestions: PricingSuggestion[];
  onApply: (id: string, newPrice: number) => void;
};

export default function DynamicPricingSuggestions({
  suggestions,
  onApply,
}: Props) {
  return (
    <motion.section
      id="pricing"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <Zap className="text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Dynamic Pricing
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence>
              {suggestions.map((item) => {
                const urgencyColors = {
                  critical: "text-red-600 dark:text-red-400",
                  high: "text-orange-600 dark:text-orange-400",
                  medium: "text-yellow-600 dark:text-yellow-400",
                };

                const urgencyBg = {
                  critical:
                    "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
                  high: "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
                  medium:
                    "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
                };

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className={`border ${urgencyBg[item.urgency]} mb-2`}
                  >
                    <td className="py-4 pr-3 pl-3">
                      <div className="flex items-start gap-2">
                        {item.urgency === "critical" && (
                          <AlertCircle
                            size={16}
                            className={urgencyColors[item.urgency]}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.itemName}
                          </p>
                          <p
                            className={`text-xs ${
                              urgencyColors[item.urgency]
                            } font-medium`}
                          >
                            {item.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.shelfLifeDays}{" "}
                            {item.shelfLifeDays === 1 ? "day" : "days"}{" "}
                            remaining
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-500 text-sm">
                            ₹{item.currentPrice.toFixed(2)}
                          </span>
                          <ArrowRight size={14} />
                          <span className="font-bold text-base text-green-600 dark:text-green-400">
                            ₹{item.suggestedPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {item.discountPercentage}% off
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pl-3 pr-3 text-right">
                      <button
                        onClick={() => onApply(item.id, item.suggestedPrice)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Check size={16} />
                        Apply
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {suggestions.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No pricing suggestions. All items optimized!
          </div>
        )}
      </div>
    </motion.section>
  );
}
