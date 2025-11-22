// src/components/dashboard/retailer/BuyProduce.tsx

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, ShoppingCart, TrendingUp, Package } from "lucide-react";
import {
  getMarketplaceProduce,
  MarketplaceProduce,
} from "@/actions/marketplaceActions";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import LoadingSpinner from "@/components/dashboard/shared/LoadingSpinner";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import ActionButton from "@/components/dashboard/shared/ActionButton";

// Emoji mapping for produce categories
const emojiMap: Record<string, string> = {
  vegetable: "🥬",
  fruit: "🍎",
  grain: "🌾",
  herb: "🌿",
};

export default function BuyProduce() {
  const [produce, setProduce] = useState<MarketplaceProduce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduce() {
      try {
        setLoading(true);
        const data = await getMarketplaceProduce();
        // Show only first 5 items
        setProduce(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching produce:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduce();
  }, []);

  return (
    <ModernCard
      title="Buy Produce"
      icon={<ShoppingCart className="w-5 h-5" />}
      gradient="purple"
      glassEffect
    >
      {loading ? (
        <LoadingSpinner
          size="lg"
          color="purple"
          text="Loading marketplace..."
        />
      ) : produce.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No Produce Available"
          description="Check back later for fresh produce from farmers"
          action={{
            label: "Browse Full Marketplace",
            onClick: () => {
              window.location.href = "/marketplace/retailer";
            },
          }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {produce.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Produce Icon */}
                  <div className="shrink-0 bg-linear-to-br from-green-400 to-emerald-500 text-white rounded-lg p-3 h-14 w-14 flex items-center justify-center text-2xl shadow-lg">
                    {emojiMap[item.category] || "🌱"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{item.farmerName}</span>
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="shrink-0 text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          ₹{item.pricePerUnit.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          per {item.unit}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} {item.unit} available
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Fresh
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <ActionButton
                      variant="success"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        window.location.href = "/marketplace/retailer";
                      }}
                    >
                      Create Purchase Order
                    </ActionButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            onClick={() => {
              window.location.href = "/marketplace/retailer";
            }}
          >
            View Full Marketplace →
          </motion.button>
        </>
      )}
    </ModernCard>
  );
}
