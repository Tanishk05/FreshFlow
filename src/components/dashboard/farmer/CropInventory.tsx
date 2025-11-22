"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedDate } from "@/components/dashboard/FormattedDate";
import { useRouter } from "next/navigation";
import ModernCard from "../shared/ModernCard";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";

type Produce = {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  image: string;
  isVisible: boolean;
  isAvailable: boolean;
  harvestDate: string;
  shelfLifeDays: number;
};

type Props = {
  produce?: Produce[];
  loading?: boolean;
};

export default function CropInventory({
  produce = [],
  loading = false,
}: Props) {
  const router = useRouter();

  return (
    <ModernCard
      title="Crop Inventory"
      icon={<span className="text-2xl">🌾</span>}
      gradient="blue"
      glassEffect={false}
      headerAction={
        <button
          onClick={() => router.push("/my-produce")}
          className="px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-md"
        >
          View All
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" color="green" text="Loading crops..." />
        </div>
      ) : produce.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No crops yet"
          description="Start by adding your first produce to the inventory"
          action={{
            label: "Add Produce",
            onClick: () => router.push("/my-produce"),
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Crop
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Quantity
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Harvest Date
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {produce.slice(0, 5).map((item, idx) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.image}</span>
                        <div>
                          <div className="text-gray-900 dark:text-gray-100 font-semibold">
                            {item.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs capitalize">
                            {item.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-gray-600 dark:text-gray-300">
                      <FormattedDate dateString={item.harvestDate} />
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          item.isAvailable
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {item.isAvailable ? "✓ Available" : "○ Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        ₹{item.pricePerUnit}
                      </div>
                      <div className="text-xs text-gray-500">
                        per {item.unit}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {produce.length > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <button
                onClick={() => router.push("/my-produce")}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm transition-colors"
              >
                + View {produce.length - 5} more crops
              </button>
            </motion.div>
          )}
        </div>
      )}
    </ModernCard>
  );
}
