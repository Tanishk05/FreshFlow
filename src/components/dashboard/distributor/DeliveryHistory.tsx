"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  DollarSign,
  Truck,
} from "lucide-react";
import { RetailerOrderSerialized } from "@/models/RetailerOrder";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  deliveredOrders: RetailerOrderSerialized[];
};

export default function DeliveryHistory({ deliveredOrders }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders based on time period
  const filteredOrders = deliveredOrders.filter((order) => {
    if (filter === "all") return true;

    const deliveryDate = new Date(order.updatedAt);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (filter === "week") return daysDiff <= 7;
    if (filter === "month") return daysDiff <= 30;
    return true;
  });

  // Calculate statistics - Revenue is from delivery fees, not produce cost
  const totalDeliveries = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.deliveryFee || 0),
    0
  );

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delivery History
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalDeliveries} deliveries • ₹{totalRevenue.toFixed(2)} revenue
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("week")}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === "week"
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === "month"
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === "all"
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Delivery List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p>No deliveries found for this period.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const deliveryDate = new Date(order.updatedAt);

            return (
              <motion.div
                key={order._id}
                layout
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                  onClick={() => toggleExpand(order._id || "")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.retailerName || "Retailer"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {deliveryDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Delivery Fee
                        </p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{(order.deliveryFee || 0).toFixed(2)}
                        </p>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mt-1 inline-block">
                          Delivered
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                        {/* Delivery Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Delivery Date
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <Calendar size={14} />
                              {deliveryDate.toLocaleString()}
                            </p>
                          </div>
                          {order.assignedTruckId && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Truck ID
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <Truck size={14} />
                                {order.assignedTruckId.slice(-6)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Destination */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Delivery Address
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                            <MapPin size={14} className="text-green-500" />
                            {order.destination}
                          </p>
                        </div>

                        {/* Items */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <Package size={14} />
                            Delivered Items:
                          </p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.quantity} kg × ₹
                                    {item.pricePerUnit.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                  <DollarSign
                                    size={14}
                                    className="text-green-500"
                                  />
                                  ₹
                                  {(item.quantity * item.pricePerUnit).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Produce Cost (Farmer):
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Your Delivery Fee:
                            </p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₹{(order.deliveryFee || 0).toFixed(2)}
                            </p>
                          </div>
                          {order.distance && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                              Distance: {order.distance} km
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}
