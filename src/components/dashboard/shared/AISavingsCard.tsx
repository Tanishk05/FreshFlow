"use client";
import React from "react";
import { motion } from "framer-motion";
import { Zap, PackageX, Fuel, TrendingUp } from "lucide-react";
import { AISavings } from "@/lib/data/types";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  savings: AISavings;
  isLoading?: boolean;
  metadata?: {
    deliveredOrdersCount?: number;
    completedOrdersCount?: number;
    totalRevenue?: number;
    monthStart?: string;
    monthEnd?: string;
  };
};

export default function AISavingsCard({
  savings,
  isLoading = false,
  metadata,
}: Props) {
  // Format currency in INR
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get month name
  const getMonthName = () => {
    if (metadata?.monthStart) {
      const date = new Date(metadata.monthStart);
      return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
    }
    return new Date().toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Value Delivered</h3>
        <Zap size={20} className="animate-pulse" />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-sm opacity-90">Calculating savings...</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <p className="text-sm opacity-90">
              Total Savings ({getMonthName()})
            </p>
            <p className="text-4xl font-bold mt-1">
              {formatCurrency(savings.total)}
            </p>
            {metadata &&
              (metadata.deliveredOrdersCount ||
                metadata.completedOrdersCount) && (
                <p className="text-xs opacity-80 mt-1">
                  Based on{" "}
                  {metadata.deliveredOrdersCount ||
                    metadata.completedOrdersCount}{" "}
                  orders
                </p>
              )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <PackageX size={16} />
                <span className="font-medium text-sm">Spoilage Prevention</span>
              </div>
              <span className="font-bold text-sm">
                {formatCurrency(savings.fromSpoilageReduction)}
              </span>
            </div>

            {savings.fromDynamicPricing !== undefined &&
              savings.fromDynamicPricing > 0 && (
                <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span className="font-medium text-sm">
                      Smart Pricing Lift
                    </span>
                  </div>
                  <span className="font-bold text-sm">
                    {formatCurrency(savings.fromDynamicPricing)}
                  </span>
                </div>
              )}

            {savings.fromFuelReduction !== undefined &&
              savings.fromFuelReduction > 0 && (
                <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Fuel size={16} />
                    <span className="font-medium text-sm">
                      Route Optimization
                    </span>
                  </div>
                  <span className="font-bold text-sm">
                    {formatCurrency(savings.fromFuelReduction)}
                  </span>
                </div>
              )}
          </div>

          <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-center opacity-90">
              💡 <span className="font-semibold">Gain-Sharing Model:</span> Your
              AI-driven savings power our success-based pricing
            </p>
          </div>
        </>
      )}
    </motion.section>
  );
}
