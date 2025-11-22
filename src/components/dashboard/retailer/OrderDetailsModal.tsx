"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ClipboardList,
  User,
  Truck,
  Calendar,
  Hash,
  Info,
  MapPin,
  IndianRupee,
} from "lucide-react";

type RetailOrder = {
  _id: string;
  farmerId: string;
  retailerId: string;
  produceId: string;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  orderDate: Date;
  farmerName?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  notes?: string;
};

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RetailOrder | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  if (!order) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          text: "Awaiting farmer approval.",
        };
      case "approved":
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          text: "Order approved. Awaiting pickup.",
        };
      case "completed":
        return {
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          text: "Order successfully completed.",
        };
      case "cancelled":
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          text: "Order has been cancelled.",
        };
      case "rejected":
        return {
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          text: "Order was rejected by the farmer.",
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          text: "Status unknown.",
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.produceName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${statusInfo.bgColor}`}
              >
                <Info className={`w-5 h-5 ${statusInfo.color}`} />
                <p className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Quantity
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.quantity} {order.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Price / Unit
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {order.pricePerUnit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        Total Price
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" />
                        {order.totalPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        Order ID:
                      </span>
                      <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                        {order._id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        Farmer:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.farmerName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        Order Date:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {order.deliveryAddress && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-500" />
                    Delivery Information
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Address
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>
                    {order.deliveryDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Estimated Delivery
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg italic">
                    &quot;{order.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
