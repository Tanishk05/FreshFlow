"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedDate } from "@/components/dashboard/FormattedDate";
import { useRouter } from "next/navigation";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
    <motion.section
      id="manage"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Crop Inventory
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/my-produce")}
            className="px-3 py-1 rounded-lg text-sm bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/70 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : produce.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No produce items yet.</p>
          <button
            onClick={() => router.push("/my-produce")}
            className="mt-2 text-green-600 dark:text-green-400 hover:underline"
          >
            Add your first produce →
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <AnimatePresence>
                {produce.slice(0, 5).map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: -20,
                      transition: { duration: 0.2 },
                    }}
                    layout
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {item.name}
                          </span>
                          <span className="text-gray-500 ml-2 text-xs capitalize">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                      <FormattedDate dateString={item.harvestDate} />
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.isAvailable
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ₹{item.pricePerUnit}/{item.unit}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
