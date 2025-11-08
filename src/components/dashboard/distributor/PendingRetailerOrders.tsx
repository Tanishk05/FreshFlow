"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RetailerOrder } from "@/lib/data/types";
import { Check } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  orders: RetailerOrder[];
  onAssign: (id: string) => void;
};

export default function PendingRetailerOrders({ orders, onAssign }: Props) {
  return (
    <motion.section
      id="orders"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Pending Retailer Orders
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  layout
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <td className="py-4 pr-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {order.retailerName}
                    </p>
                    <p className="text-xs text-gray-500">{order.destination}</p>
                  </td>
                  <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                    {order.itemCount} items
                  </td>
                  <td className="py-4 pl-3 text-right">
                    <button
                      onClick={() => onAssign(order.id)}
                      className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      Assign
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No pending orders to route.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
