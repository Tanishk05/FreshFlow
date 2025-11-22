"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Box,
  Boxes,
  MapPin,
  Weight,
} from "lucide-react";
import { FleetSerialized } from "@/models/Fleet";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import ActionButton from "@/components/dashboard/shared/ActionButton";

type DistributorOrder = {
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
  deliveryFee?: number;
  destination?: string;
  deliveryAddress?: string;
  distance?: number;
  status: string;
  orderDate: Date;
  deliveryDate?: Date;
  estimatedDelivery?: Date;
  assignedTruckId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  farmerName?: string;
  retailerName?: string;
};

type TruckLoadProps = {
  trucks: FleetSerialized[];
  assignedOrders: DistributorOrder[];
  onAssignOrders: (truckId: string, orderIds: string[]) => void;
};

export default function TruckLoadManagementNew({
  trucks,
  assignedOrders,
  onAssignOrders,
}: TruckLoadProps) {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Filter orders that don't have a truck assigned yet or can be reassigned
  const availableOrders = useMemo(() => {
    return assignedOrders.filter(
      (order) => !order.assignedTruckId || order.status === "assigned"
    );
  }, [assignedOrders]);

  // Calculate weight in kg from quantity
  const getOrderWeightKg = (order: DistributorOrder): number => {
    if (order.unit === "kg") return order.quantity;
    if (order.unit === "tons") return order.quantity * 1000;
    if (order.unit === "bags") return order.quantity * 50; // Assume 50kg per bag
    return 0;
  };

  // Calculate load percentage for visualization
  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500 bg-red-100 dark:bg-red-900/20";
    if (percentage >= 70)
      return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-green-500 bg-green-100 dark:bg-green-900/20";
  };

  // Calculate total weight of selected orders
  const selectedWeight = useMemo(() => {
    return availableOrders
      .filter((order) => selectedOrders.includes(order._id))
      .reduce((sum, order) => sum + getOrderWeightKg(order), 0);
  }, [availableOrders, selectedOrders]);

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

  // Get AI suggestions for optimal load distribution
  const getAISuggestions = () => {
    // Simple greedy algorithm: fill trucks to ~80% capacity
    const suggestions: { truckId: string; orderIds: string[] }[] = [];
    const remainingOrders = [...availableOrders];
    const sortedTrucks = [...trucks].sort(
      (a, b) => b.capacityKg - a.capacityKg
    );

    for (const truck of sortedTrucks) {
      if (truck.status !== "available") continue;

      const available = truck.capacityKg - truck.currentLoadKg;
      const targetLoad = available * 0.8; // Target 80% of available capacity
      const truckOrders: string[] = [];
      let currentLoad = 0;

      // Sort orders by weight (largest first for better packing)
      const sortedOrders = remainingOrders.sort(
        (a, b) => getOrderWeightKg(b) - getOrderWeightKg(a)
      );

      for (let i = sortedOrders.length - 1; i >= 0; i--) {
        const order = sortedOrders[i];
        const weight = getOrderWeightKg(order);

        if (currentLoad + weight <= available && currentLoad < targetLoad) {
          truckOrders.push(order._id);
          currentLoad += weight;
          remainingOrders.splice(i, 1);
        }
      }

      if (truckOrders.length > 0) {
        suggestions.push({ truckId: truck._id!, orderIds: truckOrders });
      }
    }

    // Apply first suggestion
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      setSelectedTruck(firstSuggestion.truckId);
      setSelectedOrders(firstSuggestion.orderIds);
      alert(
        `AI Suggestion: Assign ${firstSuggestion.orderIds.length} order(s) to optimize truck space!`
      );
    } else {
      alert("No optimization suggestions available at this time.");
    }
  };

  return (
    <ModernCard
      title="Truck Load Management"
      icon={<Boxes className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Optimize deliveries by assigning multiple orders to trucks
        </p>
        <ActionButton
          onClick={getAISuggestions}
          variant="primary"
          className="flex items-center gap-2 text-sm"
        >
          <TrendingUp size={16} />
          AI Suggestions
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Truck List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Truck size={16} />
              Available Trucks
            </h4>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {trucks.length} trucks
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {trucks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trucks available</p>
              </div>
            ) : (
              trucks.map((truck, idx) => {
                const loadPercentage =
                  (truck.currentLoadKg / truck.capacityKg) * 100;
                const availableKg = truck.capacityKg - truck.currentLoadKg;
                const isSelected = selectedTruck === truck._id;

                return (
                  <motion.div
                    key={truck._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                    onClick={() => setSelectedTruck(truck._id!)}
                    whileHover={{ x: 4 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-900/30"
                          }`}
                        >
                          <Truck
                            size={20}
                            className={
                              isSelected
                                ? "text-blue-600"
                                : "text-gray-700 dark:text-gray-300"
                            }
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {truck.truckNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {truck.driver}
                          </p>
                        </div>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.1 }}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${getLoadColor(
                          loadPercentage
                        )}`}
                      >
                        {loadPercentage.toFixed(0)}%
                      </motion.span>
                    </div>

                    {/* Load bar */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(loadPercentage, 100)}%`,
                          }}
                          transition={{
                            delay: idx * 0.05 + 0.2,
                            duration: 0.5,
                          }}
                          className={`h-2.5 rounded-full ${
                            loadPercentage >= 90
                              ? "bg-red-500"
                              : loadPercentage >= 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        {truck.currentLoadKg.toFixed(0)} /{" "}
                        {truck.capacityKg.toFixed(0)} kg
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {availableKg.toFixed(0)} kg free
                      </span>
                    </div>

                    {truck.assignedOrderIds &&
                      truck.assignedOrderIds.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Box size={12} />
                            {truck.assignedOrderIds.length} order(s) assigned
                          </p>
                        </div>
                      )}

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle size={20} className="text-blue-500" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Available Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Package size={16} />
              Available Orders
            </h4>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              {availableOrders.length} orders
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {availableOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders available for assignment</p>
              </div>
            ) : (
              <AnimatePresence>
                {availableOrders.map((order, idx) => {
                  const isSelected = selectedOrders.includes(order._id);
                  const weightKg = getOrderWeightKg(order);

                  return (
                    <motion.div
                      key={order._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: -4 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                        isSelected
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800/50"
                      }`}
                      onClick={() => toggleOrderSelection(order._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">
                            {order.quantity} {order.unit} {order.produceName}
                          </p>
                          {order.destination && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <MapPin size={12} />
                              {order.destination}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {order.farmerName || "Unknown"} →{" "}
                            {order.retailerName || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded ${
                                isSelected
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-gray-100 dark:bg-gray-900/30"
                              }`}
                            >
                              <Weight
                                size={14}
                                className={
                                  isSelected
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {weightKg.toFixed(0)} kg
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                          >
                            <CheckCircle size={24} className="text-green-500" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Assignment Summary */}
          {selectedOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-linear-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-3 mb-3">
                {canFitInTruck() ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <CheckCircle size={24} className="text-green-500 mt-0.5" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <AlertCircle size={24} className="text-red-500 mt-0.5" />
                  </motion.div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedOrders.length} order(s) selected
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Total weight: {selectedWeight.toFixed(0)} kg
                  </p>
                  {selectedTruck ? (
                    canFitInTruck() ? (
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Can fit in selected truck
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Exceeds truck capacity
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      → Select a truck to assign
                    </p>
                  )}
                </div>
              </div>

              <ActionButton
                onClick={handleAssign}
                disabled={!selectedTruck || !canFitInTruck()}
                className="w-full"
                variant="primary"
              >
                <CheckCircle size={18} />
                Assign to Truck
              </ActionButton>
            </motion.div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}
