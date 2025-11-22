"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PackageCheck,
  Calendar,
  IndianRupee,
  TrendingUp,
  User,
  Package,
  MapPin,
} from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";

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
};

export default function DeliveryHistoryNew({ orders }: Props) {
  // Calculate total delivery fee revenue
  const totalDeliveryFeeRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
  }, [orders]);

  // Calculate average delivery fee
  const averageDeliveryFee = useMemo(() => {
    if (orders.length === 0) return 0;
    return totalDeliveryFeeRevenue / orders.length;
  }, [orders.length, totalDeliveryFeeRevenue]);

  return (
    <ModernCard
      title="Delivery History"
      icon={<PackageCheck className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      {/* Revenue Summary */}
      {orders.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                Total Revenue
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              ₹{totalDeliveryFeeRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-500 mt-1">
              From {orders.length} deliveries
            </div>
          </div>

          <div className="p-4 rounded-lg bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Avg Fee
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ₹{averageDeliveryFee.toFixed(2)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Per delivery
            </div>
          </div>
        </div>
      )}

      {/* Delivery List */}
      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageCheck className="w-12 h-12" />}
          title="No Deliveries Yet"
          description="Completed deliveries will appear here."
        />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <PackageCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {order.quantity} {order.unit} {order.produceName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : new Date(order.updatedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    +₹{(order.deliveryFee || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Delivery Fee
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Farmer:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.farmerName || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Retailer:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.retailerName || "Unknown"}
                    </span>
                  </div>
                </div>

                {order.destination && (
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Destination:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {order.destination}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <IndianRupee className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Order Value:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Distance:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {order.distance} km
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </ModernCard>
  );
}
