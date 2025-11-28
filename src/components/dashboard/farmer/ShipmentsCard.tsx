import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Ship, Thermometer } from "lucide-react";
import ModernCard from "../shared/ModernCard";
import EmptyState from "../shared/EmptyState";

type ShipmentFromDB = {
  _id: string;
  origin: string;
  destination: string;
  status: "in-transit" | "delivered" | "delayed";
  temperatureC: number;
  eta: Date;
};

type Props = {
  shipments: ShipmentFromDB[];
};

import { getSocket } from "@/lib/socket";

export default function ShipmentsCard({ shipments }: Props) {
  const [liveShipments, setLiveShipments] = useState(shipments);

  useEffect(() => {
    setLiveShipments(shipments); // Sync with prop changes
  }, [shipments]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("farmer-shipment-update", (update: { type: string; shipment: ShipmentFromDB }) => {
      setLiveShipments((prev) => {
        if (update.type === "add") {
          if (!prev.some((s) => s._id === update.shipment._id)) {
            return [update.shipment, ...prev];
          }
          return prev;
        } else if (update.type === "update") {
          return prev.map((s) => (s._id === update.shipment._id ? { ...s, ...update.shipment } : s));
        } else if (update.type === "remove") {
          return prev.filter((s) => s._id !== update.shipment._id);
        }
        return prev;
      });
    });
    return () => {
      socket.off("farmer-shipment-update");
    };
  }, []);
    <ModernCard
      title="Live Shipments"
      icon={<Ship className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
      headerAction={
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
          View All
        </button>
      }
    >
      {liveShipments.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No active shipments"
          description="Your shipments will appear here when orders are being delivered"
        />
      ) : (
        <div className="space-y-3">
          {liveShipments.map((shipment, idx) => {
            const isDelayed = shipment.status === "delayed";
            const isHot = shipment.temperatureC > 6;
            const hasAlert = isDelayed || isHot;

            return (
              <motion.div
                key={shipment._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                className={`relative p-4 rounded-2xl backdrop-blur-sm border transition-all ${
                  hasAlert
                    ? "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-white/60 dark:bg-gray-800/60 border-white/30 dark:border-gray-700/30 hover:shadow-md"
                }`}
              >
                {/* Alert Badge */}
                {hasAlert && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                      !
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      hasAlert
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    {hasAlert ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <Ship className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4
                          className={`font-bold ${
                            hasAlert
                              ? "text-red-800 dark:text-red-200"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {shipment.destination}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📍 {shipment.origin} → {shipment.destination}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          shipment.status === "delivered"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : shipment.status === "delayed"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {shipment.status}
                      </span>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                          isHot
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Thermometer
                          size={16}
                          className={isHot ? "text-red-500" : "text-gray-500"}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            isHot
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {shipment.temperatureC}°C
                        </span>
                      </div>

                      {isHot && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          ⚠️ Temperature Alert
                        </span>
                      )}
                    </div>

                    {/* ETA */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ETA: {new Date(shipment.eta).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </ModernCard>
}
