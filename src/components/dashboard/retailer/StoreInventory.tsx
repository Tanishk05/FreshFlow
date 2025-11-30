"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArchiveX, Package } from "lucide-react";
import ModernCard from "../shared/ModernCard";
import EmptyState from "../shared/EmptyState";
import { useRouter } from "next/navigation";

type StoreItem = {
  _id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number;
  status: "fresh" | "expiring" | "spoiled";
};

type Props = {
  inventory: StoreItem[];
  onMarkSpoiled: (id: string) => void;
};

const ShelfLifeBadge = ({ days }: { days: number }) => {
  const getStyle = () => {
    if (days <= 2)
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    if (days <= 4)
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStyle()}`}
    >
      {days}d
    </span>
  );
};

import { getSocket } from "@/lib/socket";

const StoreInventory: React.FC<Props> = ({ inventory, onMarkSpoiled }) => {
  const router = useRouter();
  const [liveInventory, setLiveInventory] = useState<StoreItem[]>(inventory);

  useEffect(() => {
    setLiveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("retailer-inventory-update", (update: { type: string; item: StoreItem }) => {
      setLiveInventory((prev: StoreItem[]) => {
        if (update.type === "add") {
          if (!prev.some((i: StoreItem) => i._id === update.item._id)) {
            return [update.item, ...prev];
          }
          return prev;
        } else if (update.type === "update") {
          return prev.map((i: StoreItem) => (i._id === update.item._id ? { ...i, ...update.item } : i));
        } else if (update.type === "remove") {
          return prev.filter((i: StoreItem) => i._id !== update.item._id);
        }
        return prev;
      });
    });
    return () => {
      socket.off("retailer-inventory-update");
    };
  }, []);
  const activeInventory = liveInventory.filter((item: StoreItem) => item.status !== "spoiled");

  return (
    <ModernCard
      title="Store Inventory"
      icon={<Package className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
      headerAction={
        <button
          onClick={() => router.push("/dashboard/retailer/inventory")}
          className="px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-md"
        >
          View All
        </button>
      }
    >
      {activeInventory.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No inventory items"
          description="Add items from the marketplace or create purchase orders"
          action={{
            label: "Browse Marketplace",
            onClick: () => router.push("/marketplace/retailer"),
          }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeInventory.slice(0, 5).map((item: StoreItem, idx: number) => {
              const isLowStock = item.stock <= item.reorderPoint;
              const isExpiring = item.shelfLifeDays <= 4;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`p-4 rounded-2xl backdrop-blur-sm border transition-all ${
                    isExpiring
                      ? "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : isLowStock
                      ? "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      : "bg-white/60 dark:bg-gray-800/60 border-white/30 dark:border-gray-700/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isExpiring
                              ? "bg-red-100 dark:bg-red-900/30"
                              : isLowStock
                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                              : "bg-purple-100 dark:bg-purple-900/30"
                          }`}
                        >
                          <Package
                            className={`w-5 h-5 ${
                              isExpiring
                                ? "text-red-600 dark:text-red-400"
                                : isLowStock
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-purple-600 dark:text-purple-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Stock: {item.stock} units
                            {isLowStock && (
                              <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                                • Low Stock
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Shelf Life:
                          </span>
                          <ShelfLifeBadge days={item.shelfLifeDays} />
                        </div>
                        {isExpiring && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Expiring Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onMarkSpoiled(item._id)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Mark as spoiled"
                    >
                      <ArchiveX size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {activeInventory.length > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <button
                onClick={() => router.push("/dashboard/retailer/inventory")}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
              >
                + View {activeInventory.length - 5} more items
              </button>
            </motion.div>
          )}
        </div>
      )}
    </ModernCard>
  );
};

export default StoreInventory;
