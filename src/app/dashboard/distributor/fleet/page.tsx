"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EnhancedStatCard from "@/components/dashboard/shared/EnhancedStatCard";
import { getMyAlerts, Alert } from "@/actions/alertActions";
import { getMyFleet } from "@/actions/fleetActions";
import { FleetSerialized } from "@/models/Fleet";
import AlertsPanel from "@/components/ui/AlertsPanel";

export default function DistributorFleetPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState<FleetSerialized[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch alerts
        const alertsData = await getMyAlerts();
        setAlerts(alertsData);

        // Fetch fleet
        const fleetData = await getMyFleet();
        setVehicles(fleetData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statuses = ["all", "available", "on-route", "maintenance", "offline"];

  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus =
      selectedStatus === "all" || v.status === selectedStatus;
    const matchesSearch =
      v.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "on-route").length,
    available: vehicles.filter((v) => v.status === "available").length,
    utilization:
      vehicles.length > 0
        ? Math.round(
            (vehicles.reduce((sum, v) => sum + v.currentLoadKg, 0) /
              vehicles.reduce((sum, v) => sum + v.capacityKg, 0)) *
              100
          )
        : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "on-route":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "maintenance":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "offline":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          role="distributor"
          isShrunk={isShrunk}
          setIsShrunk={setIsShrunk}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onAlertsClick={() => setIsAlertsOpen(true)}
        />

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
                  Fleet Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Monitor and manage your delivery fleet
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>🚚</span>
                <span>Add Vehicle</span>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-cyan-950/20">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedStatCard
                title="Total Vehicles"
                value={stats.total}
                icon="🚛"
                color="blue"
                subtitle="In fleet"
                delay={0}
              />
              <EnhancedStatCard
                title="On Route"
                value={stats.active}
                icon="🟢"
                color="green"
                trend={{ value: 5, isPositive: true }}
                subtitle="In transit"
                delay={0.1}
              />
              <EnhancedStatCard
                title="Available"
                value={stats.available}
                icon="✅"
                color="cyan"
                subtitle="Ready to go"
                delay={0.2}
              />
              <EnhancedStatCard
                title="Utilization"
                value={`${stats.utilization}%`}
                icon="📊"
                color="purple"
                trend={{ value: 8, isPositive: true }}
                subtitle="Fleet capacity"
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
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search vehicles or drivers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Fleet Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading fleet...
                </p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🚛</span>
                <p className="text-gray-600 dark:text-gray-400">
                  No vehicles found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVehicles.map((vehicle, idx) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-white/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {vehicle.truckNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📞 {vehicle.driverContact}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Driver */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            👤 Driver
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {vehicle.driver}
                          </span>
                        </div>

                        {/* Location */}
                        {vehicle.currentLocation && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              📍 Current Location
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white text-xs">
                              {vehicle.currentLocation}
                            </span>
                          </div>
                        )}

                        {/* Destination */}
                        {vehicle.destination && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              🎯 Destination
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white text-xs">
                              {vehicle.destination}
                            </span>
                          </div>
                        )}

                        {/* Capacity */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              📦 Load Capacity
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {vehicle.currentLoadKg} / {vehicle.capacityKg} kg
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${vehicle.loadPercentage || 0}%`,
                              }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="h-full bg-linear-to-r from-blue-500 to-cyan-500"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round(vehicle.loadPercentage || 0)}% loaded •{" "}
                            {vehicle.availableCapacityKg} kg available
                          </p>
                        </div>

                        {/* Temperature */}
                        {vehicle.temperatureC && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              🌡️ Temperature
                            </span>
                            <span
                              className={`font-semibold ${
                                vehicle.temperatureC <= 4
                                  ? "text-blue-600 dark:text-blue-400"
                                  : vehicle.temperatureC <= 10
                                  ? "text-cyan-600 dark:text-cyan-400"
                                  : "text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              {vehicle.temperatureC}°C
                            </span>
                          </div>
                        )}

                        {/* Assigned Orders */}
                        {vehicle.assignedOrderIds &&
                          vehicle.assignedOrderIds.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                📋 Assigned Orders
                              </span>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {vehicle.assignedOrderIds.length}
                              </span>
                            </div>
                          )}

                        {/* ETA */}
                        {vehicle.eta && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ⏰ ETA
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {new Date(vehicle.eta).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-6">
                        <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors">
                          Track
                        </button>
                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.main>
      </div>

      <AlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
      />
    </DashboardLayout>
  );
}
