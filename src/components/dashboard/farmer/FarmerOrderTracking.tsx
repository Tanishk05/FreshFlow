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
import { markOrderAsPickedUp } from "@/actions/orderActions";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Type for orders from farmer perspective (Order model)
type OrderTracking = {
  _id: string;
  retailerId: string;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status:
    | "pending"
    | "approved"
    | "assigned"
    | "picked-up"
    | "in-transit"
    | "delivered"
    | "rejected"
    | "cancelled";
  orderDate: Date;
  deliveryDate?: Date;
  retailerName?: string;
  deliveryAddress?: string;
  notes?: string;
};

type Props = {
  orders: OrderTracking[];
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
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        label: "Awaiting Distributor",
      };
    case "assigned":
      return {
        icon: Truck,
        color: "text-indigo-500",
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        label: "Distributor Assigned",
      };
    case "picked-up":
      return {
        icon: Package,
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-900/30",
        label: "Picked Up",
      };
    case "in-transit":
      return {
        icon: Truck,
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        label: "In Transit",
      };
    case "delivered":
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

export default function FarmerOrderTracking({ orders }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [markingPickup, setMarkingPickup] = useState(false);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleMarkAsPickedUp = async (orderId: string) => {
    setMarkingPickup(true);
    try {
      const result = await markOrderAsPickedUp(orderId);
      if (result.success) {
        alert(result.message || "Order marked as picked up successfully");
        window.location.reload(); // Refresh to see updated status
      } else {
        alert(result.error || "Failed to mark order as picked up");
      }
    } catch (error) {
      console.error("Error marking as picked up:", error);
      alert("Failed to mark order as picked up");
    } finally {
      setMarkingPickup(false);
    }
  };

  // Filter to show approved, picked-up, in-transit, and delivered orders
  const trackedOrders = orders.filter(
    (o) =>
      o.status === "approved" ||
      o.status === "assigned" ||
      o.status === "picked-up" ||
      o.status === "in-transit" ||
      o.status === "delivered"
  );

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Tracking
      </h3>
      <div className="space-y-3">
        {trackedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p>No active orders to track.</p>
          </div>
        ) : (
          trackedOrders.map((order) => {
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
                          {order.retailerName || "Retailer"} • {order.quantity}{" "}
                          {order.unit}
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
                              <span>Customer:</span>
                              <span className="font-medium">
                                {order.retailerName || "Retailer"}
                              </span>
                            </div>
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

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Delivery Address:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        )}

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
                            Delivery Progress:
                          </p>
                          <div className="space-y-3">
                            {/* Order Received */}
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
                                  Order Received
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.orderDate).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Order Approved */}
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
                                  Order Approved
                                </p>
                                <p className="text-xs text-gray-500">
                                  You approved this order
                                </p>
                              </div>
                            </div>

                            {/* Distributor Assignment */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "assigned" ||
                                    order.status === "picked-up" ||
                                    order.status === "in-transit" ||
                                    order.status === "delivered"
                                      ? "bg-indigo-500"
                                      : order.status === "approved"
                                      ? "bg-yellow-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "assigned" ||
                                  order.status === "picked-up" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered" ? (
                                    <CheckCircle2
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : order.status === "approved" ? (
                                    <Clock size={16} className="text-white" />
                                  ) : (
                                    <Clock
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  )}
                                </div>
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <div className="pb-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Distributor Assignment
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status === "assigned" ||
                                  order.status === "picked-up" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered"
                                    ? "Distributor assigned to deliver"
                                    : order.status === "approved"
                                    ? "Waiting for distributor to accept"
                                    : "Awaiting approval"}
                                </p>
                              </div>
                            </div>

                            {/* Awaiting Pickup / Picked Up */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "picked-up" ||
                                    order.status === "in-transit" ||
                                    order.status === "delivered"
                                      ? "bg-purple-500"
                                      : order.status === "assigned"
                                      ? "bg-yellow-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "picked-up" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered" ? (
                                    <CheckCircle2
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : order.status === "assigned" ? (
                                    <Clock size={16} className="text-white" />
                                  ) : (
                                    <Clock
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  )}
                                </div>
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                              <div className="pb-4 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {order.status === "picked-up" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered"
                                    ? "Picked Up"
                                    : "Awaiting Pickup"}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {order.status === "picked-up" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered"
                                    ? "Distributor collected the order"
                                    : order.status === "assigned"
                                    ? "Ready for distributor to collect"
                                    : "Waiting for distributor assignment"}
                                </p>
                                {order.status === "assigned" && (
                                  <button
                                    onClick={() =>
                                      handleMarkAsPickedUp(order._id)
                                    }
                                    disabled={markingPickup}
                                    className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-xs rounded-lg font-medium transition-colors"
                                  >
                                    {markingPickup
                                      ? "Marking..."
                                      : "Mark as Picked Up"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* In Transit */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "in-transit" ||
                                    order.status === "delivered"
                                      ? "bg-orange-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "in-transit" ||
                                  order.status === "delivered" ? (
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
                                  {order.status === "in-transit" ||
                                  order.status === "delivered"
                                    ? "On the way to retailer"
                                    : "Awaiting dispatch"}
                                </p>
                              </div>
                            </div>

                            {/* Delivered */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "delivered"
                                      ? "bg-green-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "delivered" ? (
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
                                  {order.status === "delivered"
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
