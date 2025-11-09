// src/components/dashboard/retailer/BuyProduce.tsx

"use client";
import React, { useState } from "react";
import { Sprout, User } from "lucide-react";

// Mock Data for available produce from farmers
const initialAvailableProduce = [
  {
    id: "prod-1",
    farmerName: "Riya Patel Farms",
    itemName: "Heirloom Tomatoes",
    availableKg: 150,
    pricePerKg: 2.5,
    icon: Sprout,
  },
  {
    id: "prod-2",
    farmerName: "Green Valley Organics",
    itemName: "Spinach",
    availableKg: 80,
    pricePerKg: 3.0,
    icon: Sprout,
  },
  {
    id: "prod-3",
    farmerName: "Riya Patel Farms",
    itemName: "Kale",
    availableKg: 200,
    pricePerKg: 2.8,
    icon: Sprout,
  },
  {
    id: "prod-4",
    farmerName: "Mountain View Produce",
    itemName: "Carrots (Organic)",
    availableKg: 350,
    pricePerKg: 1.5,
    icon: Sprout,
  },
];

export default function BuyProduce() {
  const [produce] = useState(initialAvailableProduce);

  return (
    // `id` allows the sidebar link to scroll here
    <section id="procurement" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Buy Produce (From Farmers)
      </h2>
      <div className="space-y-4">
        {produce.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg p-3 h-12 w-12 flex items-center justify-center">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.itemName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <User size={14} /> {item.farmerName}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="text-left sm:text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${item.pricePerKg.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /kg
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.availableKg} kg available
                </p>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
                Create PO
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
