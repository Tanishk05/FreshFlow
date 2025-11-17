// src/components/dashboard/retailer/BuyProduce.tsx

"use client";
import React, { useState, useEffect } from "react";
import { User, Loader2, Sprout } from "lucide-react";
import {
  getMarketplaceProduce,
  MarketplaceProduce,
} from "@/actions/marketplaceActions";
import Link from "next/link";

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
        // Show only first 4 items
        setProduce(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching produce:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduce();
  }, []);

  if (loading) {
    return (
      <section id="procurement" className="scroll-mt-20">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Buy Produce (From Farmers)
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      </section>
    );
  }

  return (
    // `id` allows the sidebar link to scroll here
    <section id="procurement" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Buy Produce (From Farmers)
        </h2>
        <Link
          href="/marketplace/retailer"
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View All
        </Link>
      </div>
      {produce.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <Sprout
            size={48}
            className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No produce available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check back later for fresh produce from farmers
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {produce.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg p-3 h-12 w-12 flex items-center justify-center text-2xl">
                  {emojiMap[item.category] || "🌱"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <User size={14} /> {item.farmerName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{item.pricePerUnit.toFixed(2)}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{item.unit}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} {item.unit} available
                  </p>
                </div>
                <Link
                  href="/marketplace/retailer"
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors text-center"
                >
                  Create PO
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
