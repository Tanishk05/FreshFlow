"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EnhancedStatCard from "@/components/dashboard/shared/EnhancedStatCard";
import { getMyAlerts, Alert } from "@/actions/alertActions";
import { getMyRetailerOrders } from "@/actions/retailerOrderActions";
import {
  RetailerOrderSerialized,
  RetailerOrderStatus,
} from "@/models/RetailerOrder";
import AlertsPanel from "@/components/ui/AlertsPanel";

export default function DistributorOrdersPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<RetailerOrderSerialized[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch alerts
        const alertsData = await getMyAlerts();
        setAlerts(alertsData);

        // Fetch retailer orders (distributor view)
        const ordersData = await getMyRetailerOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statuses: RetailerOrderStatus[] = [
    "pending",
    "assigned",
    "in-transit",
    "delivered",
    "cancelled",
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch =
      (order._id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inTransit: orders.filter((o) => o.status === "in-transit").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "assigned":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "in-transit":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            role="distributor"
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
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Distribution Orders
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage delivery assignments and tracking
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>📋</span>
                <span>New Order</span>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 bg-linear-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-cyan-950/20">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedStatCard
                title="Total Orders"
                value={stats.total}
                icon="📦"
                color="blue"
                trend={{ value: 10, isPositive: true }}
                subtitle="Active"
                delay={0}
              />
              <EnhancedStatCard
                title="Pending"
                value={stats.pending}
                icon="⏳"
                color="orange"
                subtitle="Awaiting assignment"
                delay={0.1}
              />
              <EnhancedStatCard
                title="In Transit"
                value={stats.inTransit}
                icon="🚚"
                color="purple"
                subtitle="Being delivered"
                delay={0.2}
              />
              <EnhancedStatCard
                title="Delivered"
                value={stats.delivered}
                icon="✅"
                color="green"
                subtitle="Completed"
                delay={0.3}
              />
            </div>

            {/* Filters */}
            <ModernCard
              title="Filter & Search"
              icon={<span className="text-2xl">🔍</span>}
              gradient="blue"
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedStatus === status
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
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
              title="Active Orders"
              icon={<span className="text-2xl">📋</span>}
              gradient="blue"
            >
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      📦 No orders found
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Order #{order._id?.substring(0, 8) || "N/A"}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.orderDate).toLocaleDateString()}
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

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Items
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Total Weight
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {order.totalWeightKg} kg
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Truck
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {order.assignedTruckId || "Unassigned"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Order Items:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                >
                                  {item.name} × {item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              📍
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {order.deliveryAddress}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors">
                            Track
                          </button>
                          {order.status === "pending" && (
                            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ModernCard>
          </div>
        </motion.main>
        <MobileBottomNav
          role="distributor"
          onAlertsClick={() => setIsAlertsOpen(true)}
          alertCount={
            alerts.filter((a) => a.type === "critical" || a.type === "warning")
              .length
          }
        />
      </div>

      <AlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
      />
    </DashboardLayout>
  );
}
