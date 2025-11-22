// src/components/dashboard/farmer/FarmerMarketplace.tsx

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Package, ShoppingCart, TrendingUp, Star } from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import ActionButton from "@/components/dashboard/shared/ActionButton";

// Mock Data for Marketplace
const initialMarketplaceItems = [
  {
    id: "mkt-1",
    name: "Organic Fertilizer",
    description: "NPK 5-5-5, 50kg bag",
    price: 25.0,
    icon: Leaf,
    rating: 4.5,
    popular: true,
  },
  {
    id: "mkt-2",
    name: "Heirloom Tomato Seeds",
    description: "Approx. 500 seeds",
    price: 15.0,
    icon: Package,
    rating: 4.8,
    popular: true,
  },
  {
    id: "mkt-3",
    name: "Pest Control (Organic)",
    description: "Neem Oil, 1L bottle",
    price: 22.5,
    icon: Leaf,
    rating: 4.3,
    popular: false,
  },
  {
    id: "mkt-4",
    name: "Cover Crop Mix",
    description: "Winter Rye & Vetch, 20kg",
    price: 30.0,
    icon: Package,
    rating: 4.6,
    popular: false,
  },
];

export default function FarmerMarketplace() {
  const [items] = useState(initialMarketplaceItems);

  return (
    <ModernCard
      title="Marketplace Essentials"
      icon={<ShoppingCart className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-900 dark:text-green-300">
            Featured farming essentials for this season
          </span>
        </div>
      </motion.div>

      {/* Marketplace Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((item, idx) => {
          const IconComponent = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="relative p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              {/* Popular Badge */}
              {item.popular && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Popular
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 p-3 rounded-lg bg-linear-to-br from-green-400 to-emerald-500 text-white shadow-lg">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.rating}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (120+ reviews)
                    </span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        per unit
                      </div>
                    </div>
                    <ActionButton
                      variant="success"
                      size="sm"
                      icon={<ShoppingCart className="w-4 h-4" />}
                      onClick={() => {
                        console.log("Add to cart:", item.id);
                      }}
                    >
                      Buy Now
                    </ActionButton>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 w-full py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
        onClick={() => {
          window.location.href = "/marketplace/farmer";
        }}
      >
        Browse Full Marketplace →
      </motion.button>
    </ModernCard>
  );
}
