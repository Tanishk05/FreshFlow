"use client";
import React from "react";
import { motion } from "framer-motion";
import { WarehouseInventory } from "@/models/WarehouseInventory";
import { Thermometer, Package, Calendar, Hash } from "lucide-react";
import { FormattedDate } from "@/components/dashboard/FormattedDate";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";

type Props = {
  stock: WarehouseInventory[];
};

export default function WarehouseInventoryComponent({ stock }: Props) {
  return (
    <ModernCard
      title="Warehouse Inventory"
      icon={<Package className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {stock.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No Inventory"
          description="Your warehouse is currently empty. Stock will appear here once received."
        />
      ) : (
        <>
          {/* Inventory Cards */}
          <div className="space-y-3">
            {stock.slice(0, 8).map((item, idx) => {
              const isColdStorage = item.tempZone === "Cold (2-4°C)";

              return (
                <motion.div
                  key={item._id?.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        isColdStorage
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-cyan-100 dark:bg-cyan-900/30"
                      }`}
                    >
                      {isColdStorage ? (
                        <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <Hash className="w-3 h-3" />
                            <span>Lot {item.lotNumber}</span>
                          </div>
                        </div>

                        {/* Temperature Zone Badge */}
                        <span
                          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                            isColdStorage
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {isColdStorage && <Thermometer className="w-3 h-3" />}
                          {item.tempZone}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Quantity
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {item.quantity} Pallets
                            </div>
                          </div>
                        </div>

                        {/* Received Date */}
                        <div className="flex items-center gap-2 p-2 rounded bg-cyan-50 dark:bg-cyan-900/20">
                          <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Received
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              <FormattedDate
                                dateString={item.receivedDate.toISOString()}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Link */}
          {stock.length > 8 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              onClick={() => {
                window.location.href = "/dashboard/distributor/warehouse";
              }}
            >
              View All {stock.length} Items →
            </motion.button>
          )}

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stock.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Pallets
              </div>
            </div>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center">
              <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                {
                  stock.filter((item) => item.tempZone === "Cold (2-4°C)")
                    .length
                }
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Cold Storage
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stock.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Unique Items
              </div>
            </div>
          </motion.div>
        </>
      )}
    </ModernCard>
  );
}
