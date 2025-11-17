// src/components/dashboard/distributor/OrderBook.tsx

"use client";
import React, { useState, useEffect } from "react";
import { Store, Package, MapPin } from "lucide-react";
import { RetailerOrderSerialized } from "@/models/RetailerOrder";
import {
  getRetailerOrdersByStatus,
  assignOrderToTruck,
} from "@/actions/retailerOrderActions";
import { getMyFleet } from "@/actions/fleetActions";

type OrderWithDetails = RetailerOrderSerialized & {
  retailerName?: string;
};

type OrderBookProps = {
  minPayout?: number | null;
};

export default function OrderBook({ minPayout }: OrderBookProps) {
  const [jobs, setJobs] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orders = await getRetailerOrdersByStatus("pending");
      setJobs(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs by minimum payout (using delivery fee, not produce cost)
  const filteredJobs = minPayout
    ? jobs.filter((job) => (job.deliveryFee || 0) >= minPayout)
    : jobs;

  const acceptJob = async (orderId: string) => {
    try {
      // Get available trucks
      const fleet = await getMyFleet();
      const availableTrucks = fleet.filter((t) => t.status === "available");

      if (availableTrucks.length === 0) {
        alert(
          "No available trucks to assign. Please add trucks or wait for one to become available."
        );
        return;
      }

      // Assign to first available truck
      const truck = availableTrucks[0];
      await assignOrderToTruck(orderId, truck._id || "");

      // Remove from list
      setJobs((prev) => prev.filter((job) => job._id !== orderId));

      alert(
        `Job accepted! Assigned to truck ${truck.truckNumber}. Check Pending Deliveries.`
      );

      console.log(
        `Accepted job ${orderId} and assigned to truck ${truck.truckNumber}`
      );
    } catch (error) {
      console.error("Error accepting job:", error);
      alert("Failed to accept job. Please try again.");
    }
  };

  if (loading) {
    return (
      <section id="order-book" className="scroll-mt-20">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Order Book (New Jobs)
        </h2>
        <div className="text-center py-8 text-gray-500">
          Loading available jobs...
        </div>
      </section>
    );
  }

  return (
    // `id` allows the sidebar link to scroll here
    <section id="order-book" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Order Book (New Jobs)
      </h2>
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {job.items
                    .map((item) => `${item.quantity}kg ${item.name}`)
                    .join(", ")}
                </h3>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1 sm:space-y-0">
                  <p className="flex items-center gap-1.5">
                    <Store size={14} className="text-blue-500" />
                    <span className="font-medium">Retailer:</span>{" "}
                    {job.retailerName || "Unknown"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-green-500" />
                    <span className="font-medium">Destination:</span>{" "}
                    {job.destination}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Package size={14} className="text-orange-500" />
                    <span className="font-medium">Items:</span>{" "}
                    {job.items.length}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Order Date: {new Date(job.orderDate).toLocaleDateString()}
                  {job.distance && (
                    <span className="ml-2">• Distance: {job.distance} km</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Delivery Fee
                  </p>
                  <span className="flex items-center text-xl font-bold text-green-600 dark:text-green-400">
                    ₹{(job.deliveryFee || 0).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Produce: ₹{job.totalAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => acceptJob(job._id || "")}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Accept Job
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {minPayout
              ? `No jobs found with payout above ₹${minPayout}. Try lowering the filter.`
              : "No new jobs in the order book. Check back later!"}
          </p>
        )}
      </div>
    </section>
  );
}
