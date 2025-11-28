"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronDown,
  Navigation,
  IndianRupee,
  PackageCheck,
  User,
} from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import ActionButton from "@/components/dashboard/shared/ActionButton";
import { getSocket } from "@/lib/socket";

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

type Props = {
  orders: DistributorOrder[];
  onMarkDelivered: (orderId: string) => void;
  onStartDelivery?: (orderId: string) => void;
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
    case "picked-up":
      return {
        icon: Package,
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-900/30",
        label: "Picked Up - Ready to Ship",
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
        label: status,
      };
  }
};

export default function ShipmentTrackingNew({
  orders,
  onMarkDelivered,
  onStartDelivery,
}: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<DistributorOrder[]>(orders);

  useEffect(() => {
    setLiveOrders(orders);
  }, [orders]);

  useEffect(() => {
    const socket = getSocket();
    // Listen for order status updates
    socket.on(
      "order-status-update",
      (update: {
        orderId: string;
        status: string;
        updatedFields?: Partial<DistributorOrder>;
      }) => {
        setLiveOrders((prev) =>
          prev.map((order) =>
            order._id === update.orderId
              ? { ...order, status: update.status, ...update.updatedFields }
              : order
          )
        );
      }
    );
    return () => {
      socket.off("order-status-update");
    };
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter picked-up and in-transit orders for this component
  const activeOrders = liveOrders.filter(
    (o) => o.status === "picked-up" || o.status === "in-transit"
  );

  return (
    <ModernCard
      title="Shipment Tracking"
      icon={<Navigation className="w-5 h-5" />}
      gradient="orange"
      glassEffect
    >
      {activeOrders.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-12 h-12" />}
          title="No Active Shipments"
          description="All orders have been delivered or are awaiting pickup."
        />
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order, idx) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrder === order._id;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(order._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {order.quantity} {order.unit} {order.produceName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {order.destination || order.deliveryAddress || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Delivery Fee
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{(order.deliveryFee || 0).toFixed(2)}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 space-y-4">
                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Farmer
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.farmerName || "Unknown"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded bg-cyan-50 dark:bg-cyan-900/20">
                            <Package className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Retailer
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.retailerName || "Unknown"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20">
                            <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Order Value
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                ₹{order.totalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {order.distance && (
                            <div className="flex items-center gap-2 p-2 rounded bg-purple-50 dark:bg-purple-900/20">
                              <Navigation className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Distance
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {order.distance} km
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Delivery Address
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.deliveryAddress}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <div className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                              Notes
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.notes}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {order.status === "picked-up" && onStartDelivery && (
                          <ActionButton
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => onStartDelivery(order._id)}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Start Delivery
                          </ActionButton>
                        )}

                        {order.status === "in-transit" && (
                          <ActionButton
                            variant="success"
                            size="sm"
                            fullWidth
                            onClick={() => onMarkDelivered(order._id)}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </ActionButton>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </ModernCard>
  );
}
