"use client";
import React from "react";
import { motion } from "framer-motion";
import { WarehouseItem } from "@/lib/data/types";
import { Thermometer } from "lucide-react";
import { FormattedDate } from "@/components/dashboard/FormattedDate"; // Assuming this exists

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  stock: WarehouseItem[];
};

export default function WarehouseInventory({ stock }: Props) {
  return (
    <motion.section
      id="warehouse"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Warehouse Inventory
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase">
              <th className="py-2 pr-3">Item</th>
              <th className="py-2 px-3">Quantity</th>
              <th className="py-2 px-3">Temp Zone</th>
              <th className="py-2 pl-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <td className="py-4 pr-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">Lot {item.lotNumber}</p>
                </td>
                <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                  {item.quantity} Pallets
                </td>
                <td className="py-4 px-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.tempZone === "Cold (2-4°C)"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.tempZone === "Cold (2-4°C)" && (
                      <Thermometer size={12} />
                    )}
                    {item.tempZone}
                  </span>
                </td>
                <td className="py-4 pl-3 text-gray-600 dark:text-gray-300">
                  <FormattedDate dateString={item.receivedDate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
