import React, { useEffect } from "react";
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

import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export default function PendingOrders({ orders, onApprove, onCancel }: Props) {
  const [liveOrders, setLiveOrders] = React.useState(orders);

  useEffect(() => {
    setLiveOrders(orders); // Sync with prop changes
  }, [orders]);

  useEffect(() => {
    let isMounted = true;
    let socketInstance: Socket | null = null;

    const initSocket = async () => {
      try {
        socketInstance = await getSocket();
        if (!isMounted || !socketInstance) return;

        // Verify socketInstance has the 'on' method
        if (typeof socketInstance.on !== "function") {
          console.error("Socket instance is not valid");
          return;
        }

        socketInstance.on(
          "farmer-order-update",
          (update: { type: string; order: OrderFromDB }) => {
            if (!isMounted) return;
            setLiveOrders((prev) => {
              if (update.type === "add") {
                if (!prev.some((o) => o._id === update.order._id)) {
                  return [update.order, ...prev];
                }
                return prev;
              } else if (update.type === "update") {
                return prev.map((o) =>
                  o._id === update.order._id ? { ...o, ...update.order } : o
                );
              } else if (update.type === "remove") {
                return prev.filter((o) => o._id !== update.order._id);
              }
              return prev;
            });
          }
        );
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketInstance && typeof socketInstance.off === "function") {
        socketInstance.off("farmer-order-update");
      }
    };
  }, []);

  return (
    <ModernCard
      title="Pending Orders"
      icon={<Clock className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {liveOrders.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All caught up!"
          description="No pending orders at the moment. New orders will appear here."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {liveOrders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 2, scale: 1.01 }}
                className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-700/60 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                          {order.produceName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {order.quantity} {order.unit} × ₹{order.pricePerUnit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        Total Amount
                      </span>
                      <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCancel(order._id)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
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
