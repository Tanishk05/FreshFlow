"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Package, TrendingUp, AlertCircle } from "lucide-react";

type OptimalAssignment = {
  truckId: string;
  truckNumber: string;
  driver: string;
  currentLoad: number;
  additionalLoad: number;
  newLoad: number;
  capacity: number;
  loadPercentage: number;
  orderIds: string[];
  orders: Array<{
    orderId: string;
    destination: string;
    weight: number;
    items: number;
  }>;
};

type AssignmentSummary = {
  totalOrders: number;
  assignedOrders: number;
  unassignedOrders: number;
  trucksUsed: number;
  averageLoadPercentage: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  suggestions: OptimalAssignment[];
  unassignedOrders: Array<{
    orderId: string;
    destination: string;
    weight: number;
    reason: string;
  }>;
  summary: AssignmentSummary;
  onApplySuggestions: (suggestions: OptimalAssignment[]) => void;
};

export default function OptimalAssignmentModal({
  isOpen,
  onClose,
  suggestions,
  unassignedOrders,
  summary,
  onApplySuggestions,
}: Props) {
  if (!isOpen) return null;

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Optimal Assignment
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Maximize truck utilization with smart load distribution
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.assignedOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.unassignedOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Unassigned
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.trucksUsed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trucks Used
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.averageLoadPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg Load
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Suggested Assignments */}
            {suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Suggested Assignments
                </h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.truckId}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Truck
                            size={20}
                            className="text-blue-600 dark:text-blue-400"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.truckNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.driver}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium ${getLoadColor(
                            suggestion.loadPercentage
                          )}`}
                        >
                          {suggestion.loadPercentage.toFixed(0)}% loaded
                        </span>
                      </div>

                      {/* Load visualization */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Current: {suggestion.currentLoad} kg</span>
                          <span>
                            + {suggestion.additionalLoad} kg ={" "}
                            {suggestion.newLoad} kg
                          </span>
                          <span>Capacity: {suggestion.capacity} kg</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              suggestion.loadPercentage >= 90
                                ? "bg-red-500"
                                : suggestion.loadPercentage >= 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                suggestion.loadPercentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Orders to assign */}
                      <div className="space-y-2">
                        {suggestion.orders.map((order) => (
                          <div
                            key={order.orderId}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-gray-400" />
                              <span className="text-gray-900 dark:text-white">
                                {order.destination}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                ({order.items} items)
                              </span>
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {order.weight} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unassigned Orders */}
            {unassignedOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  Unassigned Orders
                </h3>
                <div className="space-y-2">
                  {unassignedOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.destination}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {order.reason}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {order.weight} kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 && unassignedOrders.length === 0 && (
              <div className="text-center py-12">
                <Package
                  size={48}
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  No suggestions available. All orders are already assigned or
                  there are no pending orders.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Using First Fit Decreasing algorithm for optimal load distribution
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {suggestions.length > 0 && (
                <button
                  onClick={() => onApplySuggestions(suggestions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Suggestions
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
