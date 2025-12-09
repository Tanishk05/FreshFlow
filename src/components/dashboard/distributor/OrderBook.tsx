"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  Truck,
  X,
} from "lucide-react";
import {
  getAvailableOrdersForDistributor,
  acceptOrderAsDistributor,
} from "@/actions/orderActions";
import { getMyFleet } from "@/actions/fleetActions";
import { FleetSerialized } from "@/models/Fleet";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import LoadingSpinner from "@/components/dashboard/shared/LoadingSpinner";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import ActionButton from "@/components/dashboard/shared/ActionButton";
import { getSocket } from "@/lib/socket";

type OrderWithDetails = {
  _id: string;
  farmerId: string;
  retailerId?: string;
  distributorId?: string;
  produceId: string;
  produceName: string;
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  orderDate: Date;
  deliveryDate?: Date;
  assignedTruckId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  farmerName?: string;
  retailerName?: string;
};

type OrderBookProps = {
  minPayout?: number | null;
};

export default function OrderBook({ minPayout }: OrderBookProps) {
  const [jobs, setJobs] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTrucks, setAvailableTrucks] = useState<FleetSerialized[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTrucks();
    // WebSocket: Listen for new/updated orders in real time
    let isMounted = true;
    let socketInstance: Awaited<ReturnType<typeof getSocket>> | null = null;

    const initSocket = async () => {
      try {
        socketInstance = await getSocket();
        if (!isMounted) return;

        socketInstance.on(
          "order-book-update",
          (update: { type: string; order: OrderWithDetails }) => {
            if (!isMounted) return;
            setJobs((prev) => {
              if (update.type === "add") {
                // Add new order if not present
                if (!prev.some((job) => job._id === update.order._id)) {
                  return [update.order, ...prev];
                }
                return prev;
              } else if (update.type === "update") {
                // Update order if present
                return prev.map((job) =>
                  job._id === update.order._id
                    ? { ...job, ...update.order }
                    : job
                );
              } else if (update.type === "remove") {
                // Remove order if present
                return prev.filter((job) => job._id !== update.order._id);
              }
              return prev;
            });
          }
        );
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.off("order-book-update");
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getAvailableOrdersForDistributor();
      if (result.success && result.data) {
        setJobs(result.data as OrderWithDetails[]);
      } else {
        console.error("Error fetching orders:", result.error);
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucks = async () => {
    try {
      const fleet = await getMyFleet();
      setAvailableTrucks(fleet.filter((t) => t.status === "available"));
    } catch (error) {
      console.error("Error fetching trucks:", error);
    }
  };

  // Filter jobs by minimum payout (using total price)
  const filteredJobs = minPayout
    ? jobs.filter((job) => job.totalPrice >= minPayout)
    : jobs;

  const openTruckSelection = (orderId: string) => {
    if (availableTrucks.length === 0) {
      alert(
        "No available trucks. Please add trucks or wait for one to become available."
      );
      return;
    }
    setSelectedOrderId(orderId);
    setSelectedTruckId(availableTrucks[0]._id || "");
  };

  const acceptJob = async () => {
    if (!selectedOrderId || !selectedTruckId) return;

    try {
      setAccepting(true);
      const result = await acceptOrderAsDistributor(
        selectedOrderId,
        selectedTruckId
      );

      if (result.success) {
        // Remove from list
        setJobs((prev) => prev.filter((job) => job._id !== selectedOrderId));

        // Refresh trucks
        await fetchTrucks();

        const truck = availableTrucks.find((t) => t._id === selectedTruckId);
        alert(
          `Job accepted! Assigned to truck ${
            truck?.truckNumber || ""
          }. Check Pending Deliveries.`
        );

        setSelectedOrderId(null);
        setSelectedTruckId("");
      } else {
        alert(result.error || "Failed to accept job. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting job:", error);
      alert("Failed to accept job. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <ModernCard
      title="Order Book"
      icon={<Package className="w-5 h-5" />}
      gradient="blue"
      glassEffect
    >
      {loading ? (
        <LoadingSpinner
          size="lg"
          color="blue"
          text="Loading available jobs..."
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title={minPayout ? "No Jobs Match Filter" : "No New Jobs"}
          description={
            minPayout
              ? `No jobs found with delivery fee above ₹${minPayout}. Try lowering the filter.`
              : "No new jobs in the order book. Check back later for new opportunities!"
          }
        />
      ) : (
        <>
          {/* Summary Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {filteredJobs.length} available{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"} in your area
              </span>
            </div>
          </motion.div>

          {/* Jobs List */}
          <div className="space-y-3">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {job.quantity} {job.unit} {job.produceName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <Store className="w-4 h-4" />
                        <span>{job.retailerName || "Unknown Retailer"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Price Badge */}
                  <div className="text-right">
                    <div className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <div className="text-xs text-green-700 dark:text-green-300">
                        Order Value
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{job.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Farmer
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {job.farmerName || "Unknown Farmer"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded bg-cyan-50 dark:bg-cyan-900/20">
                    <Package className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Quantity
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.quantity} {job.unit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Price/Unit
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{job.pricePerUnit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div className="mb-3 p-2 rounded bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Date: {new Date(job.orderDate).toLocaleString()}
                </div>

                {/* Notes */}
                {job.notes && (
                  <div className="mb-3 p-2 rounded bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                    <strong>Notes:</strong> {job.notes}
                  </div>
                )}

                {/* Action Button */}
                <ActionButton
                  variant="success"
                  size="sm"
                  fullWidth
                  onClick={() => openTruckSelection(job._id || "")}
                >
                  Accept Job
                </ActionButton>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Truck Selection Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrderId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Select Truck
                </h3>
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Trucks ({availableTrucks.length})
                </label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableTrucks.map((truck) => (
                    <option key={truck._id} value={truck._id}>
                      {truck.truckNumber} - {truck.driver} (
                      {truck.availableCapacityKg}kg available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptJob}
                  disabled={accepting || !selectedTruckId}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                >
                  {accepting ? "Accepting..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModernCard>
  );
}
