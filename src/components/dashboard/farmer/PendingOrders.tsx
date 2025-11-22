import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X as XIcon } from "lucide-react";
import ModernCard from "../shared/ModernCard";
import EmptyState from "../shared/EmptyState";
import ActionButton from "../shared/ActionButton";

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
    <ModernCard
      title="Pending Orders"
      icon={<Clock className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {orders.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All caught up!"
          description="No pending orders at the moment. New orders will appear here."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {order.produceName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.quantity} {order.unit} × ₹{order.pricePerUnit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onCancel(order._id)}
                      className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      aria-label="Cancel order"
                    >
                      <XIcon size={18} />
                    </motion.button>
                    <ActionButton
                      onClick={() => onApprove(order._id)}
                      gradient="green"
                      size="sm"
                      icon={<Check size={16} />}
                    >
                      Approve
                    </ActionButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ModernCard>
  );
}
