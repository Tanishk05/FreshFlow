import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X as XIcon } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type OrderFromDB = {
  _id: string;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  orderDate: Date;
};

type Props = {
  orders: OrderFromDB[];
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
};

export default function PendingOrders({ orders, onApprove, onCancel }: Props) {
  return (
    <motion.section
      id="orders"
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Pending Orders
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence>
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <td className="py-4 pr-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {order.produceName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                    {order.quantity} {order.unit}
                  </td>
                  <td className="py-4 px-3 text-green-600 dark:text-green-400 font-medium">
                    ₹{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="py-4 pl-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => onCancel(order._id)}
                      className="p-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                      aria-label="Cancel order"
                    >
                      <XIcon size={16} />
                    </button>
                    <button
                      onClick={() => onApprove(order._id)}
                      className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No pending orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
