"use client";
import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Zap, PackageX, Fuel } from "lucide-react";
import { AISavings } from "@/lib/data/types";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  savings: AISavings;
};

export default function AISavingsCard({ savings }: Props) {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Value Delivered</h3>
        <Zap size={20} />
      </div>

      <div className="text-center mb-4">
        <p className="text-sm opacity-90">Total Savings (This Month)</p>
        <p className="text-4xl font-bold">
          $
          {savings.total.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
          <div className="flex items-center gap-2">
            <PackageX size={16} />
            <span className="font-medium">Spoilage Reduction</span>
          </div>
          <span className="font-bold">
            ${savings.fromSpoilageReduction.toFixed(2)}
          </span>
        </div>

        {savings.fromDynamicPricing && (
          <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              <span className="font-medium">Dynamic Pricing Lift</span>
            </div>
            <span className="font-bold">
              ${savings.fromDynamicPricing.toFixed(2)}
            </span>
          </div>
        )}

        {savings.fromFuelReduction && (
          <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Fuel size={16} />
              <span className="font-medium">Fuel Cost Reduction</span>
            </div>
            <span className="font-bold">
              ${savings.fromFuelReduction.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-center mt-4 opacity-80">
        This card demonstrates your ROI, powering our Gain-Sharing model.
      </p>
    </motion.section>
  );
}
