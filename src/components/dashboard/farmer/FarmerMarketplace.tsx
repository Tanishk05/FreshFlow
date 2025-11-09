// src/components/dashboard/farmer/FarmerMarketplace.tsx

"use client";
import React, { useState } from "react";
import { Leaf, Package } from "lucide-react";

// Mock Data for Marketplace
const initialMarketplaceItems = [
  {
    id: "mkt-1",
    name: "Organic Fertilizer",
    description: "NPK 5-5-5, 50kg bag",
    price: 25.0,
    icon: Leaf,
  },
  {
    id: "mkt-2",
    name: "Heirloom Tomato Seeds",
    description: "Approx. 500 seeds",
    price: 15.0,
    icon: Package,
  },
  {
    id: "mkt-3",
    name: "Pest Control (Organic)",
    description: "Neem Oil, 1L bottle",
    price: 22.5,
    icon: Leaf,
  },
  {
    id: "mkt-4",
    name: "Cover Crop Mix",
    description: "Winter Rye & Vetch, 20kg",
    price: 30.0,
    icon: Package,
  },
];

export default function FarmerMarketplace() {
  const [items] = useState(initialMarketplaceItems);

  return (
    // `id` allows the sidebar link to scroll here.
    // `scroll-mt-20` adds a top margin when scrolling to account for a sticky header.
    <section id="marketplace" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Marketplace: Essentials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex gap-4 items-center"
          >
            <div className="shrink-0 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg p-3 h-12 w-12 flex items-center justify-center">
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ${item.price.toFixed(2)}
              </span>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
