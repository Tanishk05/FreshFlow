"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import MobileBottomNav from "../../../../components/dashboard/MobileBottomNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EnhancedStatCard from "@/components/dashboard/shared/EnhancedStatCard";
import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getMyOrders,
  approveOrder as approveOrderAction,
  cancelOrder as cancelOrderAction,
} from "@/actions/orderActions";
import AlertsPanel from "@/components/ui/AlertsPanel";

type Order = {
  _id: string;
  farmerId: string;
  retailerId: string;
  produceId: string;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status:
    | "pending"
    | "approved"
    | "picked-up"
    | "in-transit"
    | "delivered"
    | "rejected"
    | "cancelled";
  orderDate: Date;
  estimatedTime?: number;
  estimatedTimeText?: string;
  retailerName?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  notes?: string;
};

export default function FarmerOrdersPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch alerts
        const alertsData = await getMyAlerts();
        setAlerts(alertsData);

        // Fetch orders
        const ordersResult = await getMyOrders();
        if (ordersResult.success && "data" in ordersResult) {
          setOrders(ordersResult.data as Order[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveOrder = async (orderId: string) => {
    try {
      const result = await approveOrderAction(orderId);
      if (result.success) {
        // Refresh orders
        const ordersResult = await getMyOrders();
        if (ordersResult.success && "data" in ordersResult) {
          setOrders(ordersResult.data as Order[]);
        }
      }
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const result = await cancelOrderAction(orderId);
      if (result.success) {
        // Refresh orders
        const ordersResult = await getMyOrders();
        if (ordersResult.success && "data" in ordersResult) {
          setOrders(ordersResult.data as Order[]);
        }
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const statuses = ["all", "pending", "approved", "completed", "cancelled"];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      selectedStatus === "all" || o.status === selectedStatus;
    const matchesSearch =
      o.produceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.retailerName &&
        o.retailerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.deliveryAddress &&
        o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    completed: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "approved":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "picked-up":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "in-transit":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "completed":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            role="farmer"
            isShrunk={isShrunk}
            setIsShrunk={setIsShrunk}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
          />
        </div>

        <motion.main
          animate={{
            marginLeft: isDesktop ? (isShrunk ? "88px" : "240px") : "0px",
          }}
          transition={{ type: "tween", duration: 0.3 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <DashboardHeader
            title="Order Management"
            onNewPlanClick={() => {}}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
            onExportClick={() => console.log("Export orders")}
            showNewPlan={false}
            showExport={true}
            showAlerts={true}
            hideMobileMenuButton
            alertCount={
              alerts.filter(
                (a) => a.type === "critical" || a.type === "warning"
              ).length
            }
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 bg-gray-50/50 dark:bg-slate-950/50 custom-scrollbar">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedStatCard
                title="Total Orders"
                value={stats.total}
                icon="📦"
                color="green"
                trend={{ value: 8, isPositive: true }}
                subtitle="All time"
                delay={0}
              />
              <EnhancedStatCard
                title="Pending"
                value={stats.pending}
                icon="⏳"
                color="orange"
                subtitle="Awaiting confirmation"
                delay={0.1}
              />
              <EnhancedStatCard
                title="Approved"
                value={stats.approved}
                icon="✅"
                color="blue"
                subtitle="Confirmed orders"
                delay={0.2}
              />
              <EnhancedStatCard
                title="Total Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                icon="💵"
                color="cyan"
                trend={{ value: 12, isPositive: true }}
                subtitle="From orders"
                delay={0.3}
              />
            </div>

            {/* Filters */}
            <ModernCard
              title="Filter & Search"
              icon={<span className="text-2xl">🔍</span>}
              gradient="green"
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedStatus === status
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Orders List */}
            <ModernCard
              title="Recent Orders"
              icon={<span className="text-2xl">📋</span>}
              gradient="green"
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading orders...
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📦</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    No orders found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order, idx) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {order.produceName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.retailerName || "Unknown Retailer"}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.replace("-", " ").toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Quantity
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {order.quantity} {order.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Price/Unit
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ${order.pricePerUnit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Total Amount
                              </p>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                ${order.totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Order Date
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                            {order.estimatedTimeText && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Est. Delivery Time
                                </p>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                  {order.estimatedTimeText}
                                </p>
                              </div>
                            )}
                          </div>

                          {order.deliveryAddress && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Delivery Address
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {order.deliveryAddress}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveOrder(order._id)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ModernCard>
          </div>
        </motion.main>
      </div>

      <AlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
      />
      <MobileBottomNav
        role="farmer"
        onAlertsClick={() => setIsAlertsOpen(true)}
        alertCount={
          alerts.filter((a) => a.type === "critical" || a.type === "warning")
            .length
        }
      />
    </DashboardLayout>
  );
}
