"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PurchaseOrder } from "@/lib/data/types";
import { Thermometer, Clock, Truck, Package, MapPin } from "lucide-react";
import { FormattedTime } from "@/components/dashboard/FormattedTime";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import ActionButton from "@/components/dashboard/shared/ActionButton";

type Props = {
  deliveries: PurchaseOrder[];
};

import { getSocket } from "@/lib/socket";

const IncomingDeliveries: React.FC<Props> = ({ deliveries }) => {
  const [liveDeliveries, setLiveDeliveries] = useState<PurchaseOrder[]>(deliveries);

  useEffect(() => {
    setLiveDeliveries(deliveries);
  }, [deliveries]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("retailer-delivery-update", (update: { type: string; delivery: PurchaseOrder }) => {
      setLiveDeliveries((prev: PurchaseOrder[]) => {
        if (update.type === "add") {
          if (!prev.some((d: PurchaseOrder) => d.id === update.delivery.id)) {
            return [update.delivery, ...prev];
          }
          return prev;
        } else if (update.type === "update") {
          return prev.map((d: PurchaseOrder) => (d.id === update.delivery.id ? { ...d, ...update.delivery } : d));
        } else if (update.type === "remove") {
          return prev.filter((d: PurchaseOrder) => d.id !== update.delivery.id);
        }
        return prev;
      });
    });
    return () => {
      socket.off("retailer-delivery-update");
    };
  }, []);
  // Check if any delivery has temperature issues
  const hasTemperatureAlerts = liveDeliveries.some((d: PurchaseOrder) => d.liveTemperature > 4);

  return (
    <ModernCard
      title="Incoming Deliveries"
      icon={<Truck className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {liveDeliveries.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-12 h-12" />}
          title="No Incoming Deliveries"
          description="You don't have any deliveries scheduled at the moment."
          action={{
            label: "Browse Marketplace",
            onClick: () => {
              window.location.href = "/dashboard/retailer/marketplace";
            },
          }}
        />
      ) : (
        <>
          {/* Alert Banner */}
          {hasTemperatureAlerts && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
            >
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Temperature Alert: Some deliveries are running hot
                </span>
              </div>
            </motion.div>
          )}

          {/* Deliveries List */}
          <div className="space-y-3">
            {liveDeliveries.slice(0, 5).map((delivery: PurchaseOrder, idx: number) => {
              const isHot = delivery.liveTemperature > 4;

              return (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`relative p-4 rounded-lg border transition-all ${
                    isHot
                      ? "bg-red-50/50 dark:bg-red-900/10 border-red-300 dark:border-red-800"
                      : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  } hover:shadow-md`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isHot && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full"
                      >
                        ⚠️ Hot
                      </motion.span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {delivery.distributorName}
                      </h4>

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{delivery.itemCount} items</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Order #{delivery.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Temperature */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded ${
                              isHot
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-blue-100 dark:bg-blue-900/30"
                            }`}
                          >
                            <Thermometer
                              className={`w-4 h-4 ${
                                isHot
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Temperature
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                isHot
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {delivery.liveTemperature.toFixed(1)}°C
                            </div>
                          </div>
                        </div>

                        {/* ETA */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ETA
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              <FormattedTime dateString={delivery.eta} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 flex items-center gap-2">
                        <ActionButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Track delivery
                            console.log("Track delivery:", delivery.id);
                          }}
                        >
                          Track Delivery
                        </ActionButton>
                        {isHot && (
                          <ActionButton
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              // Report temperature issue
                              console.log(
                                "Report temperature issue:",
                                delivery.id
                              );
                            }}
                          >
                            Report Issue
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Link */}
          {liveDeliveries.length > 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              onClick={() => {
                window.location.href = "/dashboard/retailer/deliveries";
              }}
            >
              View All {liveDeliveries.length} Deliveries →
            </motion.button>
          )}
        </>
      )}
    </ModernCard>
  );
};

export default IncomingDeliveries;
