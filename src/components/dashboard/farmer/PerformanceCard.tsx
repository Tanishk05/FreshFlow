import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Metrics = {
  wasteReduction: number;
  revenueUplift: number;
  fulfillmentRate: number;
};

type Props = {
  metrics: Metrics;
};

export default function PerformanceCard({ metrics }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h3>
        <button className="text-sm text-gray-500 hover:text-gray-900">
          This Month
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Waste Reduction
            </p>
            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
              {metrics.wasteReduction > 0 ? "+" : ""}
              {metrics.wasteReduction}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Target 20% / Achieved {metrics.wasteReduction}%
          </p>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Revenue Uplift
            </p>
            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              On Track
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            +{metrics.revenueUplift}% vs AI estimate
          </p>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Fulfillment Rate
            </p>
            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
              Stable
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metrics.fulfillmentRate}% orders met
          </p>
        </div>
      </div>
    </motion.section>
  );
}
