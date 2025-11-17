"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArchiveX } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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

const ShelfLifeDot = ({ days }: { days: number }) => (
  <span
    className={`w-3 h-3 rounded-full mr-2 shrink-0 ${
      days <= 2 ? "bg-red-500" : days <= 4 ? "bg-yellow-500" : "bg-green-500"
    }`}
  ></span>
);

export default function StoreInventory({ inventory, onMarkSpoiled }: Props) {
  return (
    <motion.section
      id="inventory"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Store Inventory
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence>
              {inventory
                .filter((item) => item.status !== "spoiled")
                .map((item) => (
                  <motion.tr
                    key={item._id}
                    layout
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <td className="py-4 pr-3">
                      <div className="flex items-center">
                        <ShelfLifeDot days={item.shelfLifeDays} />
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      {item.stock} units
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      {item.shelfLifeDays} days left
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <button
                        onClick={() => onMarkSpoiled(item._id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                        aria-label="Mark as spoiled"
                      >
                        <ArchiveX size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
            </AnimatePresence>
            {inventory.filter((item) => item.status !== "spoiled").length ===
              0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No inventory items. Add items from the marketplace or purchase
                  orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
