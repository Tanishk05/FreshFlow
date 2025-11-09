// src/components/dashboard/distributor/OrderBook.tsx

"use client";
import React, { useState } from "react";
import { User, Store, Warehouse, DollarSign } from "lucide-react";

// Mock Data for available jobs
const initialOrderBookJobs = [
  {
    id: "job-001",
    description: "150kg Tomatoes, 80kg Spinach",
    pickupName: "Riya Patel Farms",
    pickupIcon: User,
    dropoffName: "Sam Chen's Retail",
    dropoffIcon: Store,
    payout: 120.0,
  },
  {
    id: "job-002",
    description: "500kg Organic Carrots",
    pickupName: "Green Valley Organics",
    pickupIcon: User,
    dropoffName: "Distributor Warehouse (Hold)",
    dropoffIcon: Warehouse,
    payout: 250.0,
  },
  {
    id: "job-003",
    description: "300kg Kale",
    pickupName: "Mountain View Produce",
    pickupIcon: User,
    dropoffName: "FreshMart Downtown",
    dropoffIcon: Store,
    payout: 180.0,
  },
];

export default function OrderBook() {
  const [jobs, setJobs] = useState(initialOrderBookJobs);

  const acceptJob = (id: string) => {
    // In a real app, this would trigger an API call.
    // For now, we'll just remove it from the "new jobs" list.
    setJobs((prev) => prev.filter((job) => job.id !== id));
    console.log(`Accepted job ${id}`);
  };

  return (
    // `id` allows the sidebar link to scroll here
    <section id="order-book" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Order Book (New Jobs)
      </h2>
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {job.description}
                </h3>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <p className="flex items-center gap-1.5">
                    <job.pickupIcon size={14} className="text-blue-500" />
                    <span className="font-medium">Pickup:</span>{" "}
                    {job.pickupName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <job.dropoffIcon size={14} className="text-green-500" />
                    <span className="font-medium">Dropoff:</span>{" "}
                    {job.dropoffName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <span className="flex items-center text-xl font-bold text-green-600 dark:text-green-400">
                  <DollarSign size={20} />
                  {job.payout.toFixed(2)}
                </span>
                <button
                  onClick={() => acceptJob(job.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Accept Job
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No new jobs in the order book.
          </p>
        )}
      </div>
    </section>
  );
}
