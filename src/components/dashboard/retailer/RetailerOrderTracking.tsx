"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Type for orders coming from farmer (Order model)
type FarmerOrderTracking = {
  _id: string;
  retailerId: string;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  orderDate: Date;
  deliveryDate?: Date;
  retailerName?: string;
  notes?: string;
};

type Props = {
  orders: FarmerOrderTracking[];
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        color: "text-yellow-500",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "Pending Approval",
      };
    case "approved":
      return {
        icon: CheckCircle2,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        label: "Approved",
      };
    case "in-transit":
      return {
        icon: Truck,
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        label: "In Transit",
      };
    case "completed":
      return {
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/30",
        label: "Delivered",
      };
    case "cancelled":
    case "rejected":
      return {
        icon: Package,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
        label: "Cancelled",
      };
    default:
      return {
        icon: Package,
        color: "text-gray-500",
        bg: "bg-gray-100 dark:bg-gray-900/30",
        label: status,
      };
  }
};

export default function RetailerOrderTracking({ orders }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter out rejected/cancelled orders or show all based on needs
  const activeOrders = orders.filter(
    (o) => o.status !== "rejected" && o.status !== "cancelled"
  );

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        My Orders Tracking
      </h3>
      <div className="space-y-3">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p>No active orders.</p>
          </div>
        ) : (
          activeOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const Icon = statusInfo.icon;
            const isExpanded = expandedOrder === order._id;

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
                      <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
                        <Icon className={`${statusInfo.color}`} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.produceName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.quantity} {order.unit} • ₹
                          {order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
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
                      <div className="p-4 space-y-4">
                        {/* Order Details */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Order Details:
                          </p>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">
                                {order.quantity} {order.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per {order.unit}:</span>
                              <span className="font-medium">
                                ₹{order.pricePerUnit.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold">
                              <span>Total Amount:</span>
                              <span className="text-green-600 dark:text-green-400">
                                ₹{order.totalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Date */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Order Date:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.orderDate).toLocaleString()}
                          </p>
                        </div>

                        {/* Notes if any */}
                        {order.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Notes:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Tracking Timeline */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Order Progress:
                          </p>
                          <div className="space-y-3">
                            {/* Order Placed */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                  <CheckCircle2
                                    size={16}
                                    className="text-white"
                                  />
                                </div>
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <div className="pb-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Order Placed
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.orderDate).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Farmer Approval */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "approved" ||
                                    order.status === "completed"
                                      ? "bg-green-500"
                                      : order.status === "pending"
                                      ? "bg-yellow-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "approved" ||
                                  order.status === "completed" ? (
                                    <CheckCircle2
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : order.status === "pending" ? (
                                    <Clock size={16} className="text-white" />
                                  ) : (
                                    <Clock
                                      size={16}
                                      className="text-gray-500"
                                    />
                                  )}
                                </div>
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <div className="pb-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Farmer Approval
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status === "approved" ||
                                  order.status === "completed"
                                    ? "Order approved by farmer"
                                    : order.status === "pending"
                                    ? "Waiting for farmer approval"
                                    : "Not yet approved"}
                                </p>
                              </div>
                            </div>

                            {/* Out for Delivery */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "completed"
                                      ? "bg-orange-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "completed" ? (
                                    <Truck size={16} className="text-white" />
                                  ) : (
                                    <Clock
                                      size={16}
                                      className="text-gray-500"
                                    />
                                  )}
                                </div>
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <div className="pb-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Out for Delivery
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status === "completed"
                                    ? "Delivered to your location"
                                    : "Awaiting dispatch"}
                                </p>
                              </div>
                            </div>

                            {/* Delivered */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "completed"
                                      ? "bg-green-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "completed" ? (
                                    <CheckCircle2
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : (
                                    <Package
                                      size={16}
                                      className="text-gray-500"
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Delivered
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status === "completed"
                                    ? order.deliveryDate
                                      ? `Delivered on ${new Date(
                                          order.deliveryDate
                                        ).toLocaleString()}`
                                      : "Delivered successfully"
                                    : "Awaiting delivery"}
                                </p>
                              </div>
                            </div>
                          </div>
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
