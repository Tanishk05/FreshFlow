"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RetailerOrderSerialized } from "@/models/RetailerOrder";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  orders: RetailerOrderSerialized[];
  onMarkDelivered: (orderId: string) => void;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "assigned":
      return {
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        label: "Assigned to Truck",
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
    default:
      return {
        icon: Package,
        color: "text-gray-500",
        bg: "bg-gray-100 dark:bg-gray-900/30",
        label: "Pending",
      };
  }
};

export default function ShipmentTracking({ orders, onMarkDelivered }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Shipment Tracking
      </h3>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Truck size={48} className="mx-auto mb-3 opacity-50" />
            <p>No active shipments.</p>
          </div>
        ) : (
          orders.map((order) => {
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
                          {order.retailerName || "Unknown Retailer"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin size={14} />
                          {order.destination}
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
                        {/* Order Items */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Items:
                          </p>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span>
                                  {item.name} ({item.quantity} kg)
                                </span>
                                <span className="font-medium">
                                  ₹
                                  {(item.pricePerUnit * item.quantity).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Produce Cost:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-200 dark:border-gray-700">
                              <span>Your Delivery Fee:</span>
                              <span className="text-green-600 dark:text-green-400">
                                ₹{(order.deliveryFee || 0).toFixed(2)}
                              </span>
                            </div>
                            {order.distance && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                                Distance: {order.distance} km
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Delivery Address:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.deliveryAddress}
                          </p>
                        </div>

                        {/* Tracking Timeline */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Tracking Timeline:
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
                                  Order Accepted
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.orderDate).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Assigned to Truck */}
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full ${
                                    order.status === "assigned" ||
                                    order.status === "in-transit" ||
                                    order.status === "delivered"
                                      ? "bg-green-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {order.status === "assigned" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered" ? (
                                    <CheckCircle2
                                      size={16}
                                      className="text-white"
                                    />
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
                                  Assigned to Truck
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.status === "assigned" ||
                                  order.status === "in-transit" ||
                                  order.status === "delivered"
                                    ? "Truck assigned and ready"
                                    : "Waiting for assignment"}
                                </p>
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
                                  {order.status === "in-transit"
                                    ? "On the way to destination"
                                    : order.status === "delivered"
                                    ? "Completed delivery"
                                    : "Not yet dispatched"}
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
                                    ? `Delivered on ${new Date(
                                        order.updatedAt
                                      ).toLocaleString()}`
                                    : "Awaiting delivery"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === "in-transit" && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => onMarkDelivered(order._id || "")}
                              className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 size={18} />
                              Mark as Delivered
                            </button>
                          </div>
                        )}
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
