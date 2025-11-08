import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crop } from "@/lib/data/farmerMockData";
import { Trash2 } from "lucide-react";
import { FormattedDate } from "@/components/dashboard/FormattedDate";
import { StatusDot } from "@/components/dashboard/ui/StatusDot";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  crops: Crop[];
  onDelete: (id: string) => void;
};

export default function CropInventory({ crops, onDelete }: Props) {
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
          <button className="px-3 py-1 rounded-lg text-sm bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300">
            View All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence>
              {crops.map((c) => (
                <motion.tr
                  key={c.id}
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
                    <div className="flex items-center">
                      <StatusDot status={c.status} />
                      <div>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {c.name}
                        </span>
                        <span className="text-gray-500 ml-2 text-xs">
                          Field {c.id.slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                    {c.status !== "sold" ? `${c.quantityKg} kg` : "-"}
                  </td>
                  <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                    <FormattedDate dateString={c.harvestDate} />
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "ready"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : c.status === "growing"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {c.status === "ready"
                        ? "Ready"
                        : c.status === "growing"
                        ? "Growing"
                        : "Sold"}
                    </span>
                  </td>
                  <td className="py-4 pl-3 text-right">
                    <button
                      onClick={() => onDelete(c.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                      aria-label="Delete crop"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
