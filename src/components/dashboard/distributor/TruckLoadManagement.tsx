"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { FleetSerialized } from "@/models/Fleet";
import { RetailerOrderSerialized } from "@/models/RetailerOrder";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type TruckLoadProps = {
  trucks: FleetSerialized[];
  pendingOrders: RetailerOrderSerialized[];
  onAssignOrders: (truckId: string, orderIds: string[]) => void;
  onGetSuggestions: () => void;
};

export default function TruckLoadManagement({
  trucks,
  pendingOrders,
  onAssignOrders,
  onGetSuggestions,
}: TruckLoadProps) {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Calculate load percentage for visualization
  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500 bg-red-100 dark:bg-red-900/20";
    if (percentage >= 70)
      return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-green-500 bg-green-100 dark:bg-green-900/20";
  };

  // Calculate total weight of selected orders
  const selectedWeight = pendingOrders
    .filter((order) => selectedOrders.includes(order._id!))
    .reduce((sum, order) => sum + order.totalWeightKg, 0);

  // Check if selected orders can fit in selected truck
  const canFitInTruck = () => {
    if (!selectedTruck) return false;
    const truck = trucks.find((t) => t._id === selectedTruck);
    if (!truck) return false;
    const available = truck.capacityKg - truck.currentLoadKg;
    return selectedWeight <= available;
  };

  const handleAssign = () => {
    if (selectedTruck && selectedOrders.length > 0 && canFitInTruck()) {
      onAssignOrders(selectedTruck, selectedOrders);
      setSelectedOrders([]);
      setSelectedTruck(null);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Truck Load Management
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Optimize deliveries by assigning multiple orders to trucks
          </p>
        </div>
        <button
          onClick={onGetSuggestions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <TrendingUp size={16} />
          AI Suggestions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Truck List */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Available Trucks
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trucks.map((truck) => {
              const loadPercentage =
                (truck.currentLoadKg / truck.capacityKg) * 100;
              const availableKg = truck.capacityKg - truck.currentLoadKg;
              const isSelected = selectedTruck === truck._id;

              return (
                <motion.div
                  key={truck._id}
                  layout
                  onClick={() => setSelectedTruck(truck._id!)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {truck.truckNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {truck.driver}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getLoadColor(
                        loadPercentage
                      )}`}
                    >
                      {loadPercentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Load bar */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          loadPercentage >= 90
                            ? "bg-red-500"
                            : loadPercentage >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      {truck.currentLoadKg.toFixed(0)} /{" "}
                      {truck.capacityKg.toFixed(0)} kg
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {availableKg.toFixed(0)} kg available
                    </span>
                  </div>

                  {truck.assignedOrderIds &&
                    truck.assignedOrderIds.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <Package size={12} className="inline mr-1" />
                          {truck.assignedOrderIds.length} order(s) assigned
                        </p>
                      </div>
                    )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Pending Orders */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Pending Orders ({pendingOrders.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {pendingOrders.map((order) => {
                const isSelected = selectedOrders.includes(order._id!);

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => toggleOrderSelection(order._id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.destination}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items.length} item(s)
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Package size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {order.totalWeightKg} kg
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={20} className="text-green-500" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Assignment Summary */}
          {selectedOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-3">
                {canFitInTruck() ? (
                  <CheckCircle size={20} className="text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedOrders.length} order(s) selected (
                    {selectedWeight.toFixed(0)} kg)
                  </p>
                  {selectedTruck ? (
                    canFitInTruck() ? (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Can fit in selected truck
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ✗ Exceeds truck capacity
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select a truck to assign
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedTruck || !canFitInTruck()}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Assign to Truck
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
