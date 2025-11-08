"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PricingSuggestion } from "@/lib/data/types";
import { Check, ArrowRight, Zap } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  suggestions: PricingSuggestion[];
  onApply: (id: string) => void;
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
              {suggestions.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <td className="py-4 pr-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-500">
                        ${item.currentPrice.toFixed(2)}
                      </span>
                      <ArrowRight size={14} />
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        ${item.suggestedPrice.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pl-3 text-right">
                    <button
                      onClick={() => onApply(item.id)}
                      className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      Apply
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {suggestions.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No pricing suggestions. All items optimized!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
