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
import { getMyStoreInventory } from "@/actions/storeInventoryActions";
import AlertsPanel from "@/components/ui/AlertsPanel";

type StoreItem = {
  _id: string;
  retailerId: string;
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number;
  status: "fresh" | "expiring" | "spoiled";
  purchaseDate: Date;
  expiryDate: Date;
  price: number;
  category?: string;
};

export default function RetailerInventoryPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch alerts
        const alertsData = await getMyAlerts();
        setAlerts(alertsData);

        // Fetch inventory
        const inventoryResult = await getMyStoreInventory();
        if (inventoryResult.success && inventoryResult.data) {
          setInventory(inventoryResult.data as StoreItem[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ["all", "vegetables", "fruits", "grains", "dairy"];

  const filteredInventory = inventory.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (item.category && item.category.toLowerCase() === selectedCategory);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    totalItems: inventory.length,
    fresh: inventory.filter((i) => i.status === "fresh").length,
    expiring: inventory.filter((i) => i.status === "expiring").length,
    spoiled: inventory.filter((i) => i.status === "spoiled").length,
    totalValue: inventory.reduce((sum, i) => sum + i.stock * i.price, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fresh":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "expiring":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "spoiled":
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
            role="retailer"
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
                <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Store Inventory
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your product stock levels
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>➕</span>
                <span>Add Item</span>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 bg-linear-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedStatCard
                title="Total Items"
                value={stats.totalItems}
                icon="📦"
                color="purple"
                trend={{ value: 5, isPositive: true }}
                subtitle="In inventory"
                delay={0}
              />
              <EnhancedStatCard
                title="Fresh"
                value={stats.fresh}
                icon="✅"
                color="green"
                subtitle="Good condition"
                delay={0.1}
              />
              <EnhancedStatCard
                title="Expiring"
                value={stats.expiring}
                icon="⚠️"
                color="orange"
                subtitle="Need attention"
                delay={0.2}
              />
              <EnhancedStatCard
                title="Total Value"
                value={`$${stats.totalValue.toLocaleString()}`}
                icon="💰"
                color="cyan"
                subtitle="Inventory worth"
                delay={0.3}
              />
            </div>

            {/* Filters */}
            <ModernCard
              title="Filter & Search"
              icon={<span className="text-2xl">🔍</span>}
              gradient="purple"
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedCategory === category
                          ? "bg-purple-500 text-white shadow-lg"
                          : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Inventory Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading inventory...
                </p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📦</span>
                <p className="text-gray-600 dark:text-gray-400">
                  No inventory items found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="h-32 bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <span className="text-6xl">
                        {item.category === "vegetables"
                          ? "🥬"
                          : item.category === "fruits"
                          ? "🍎"
                          : item.category === "grains"
                          ? "🌾"
                          : item.category === "dairy"
                          ? "🥛"
                          : "🛒"}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {item.category || "General"}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Stock
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.stock} units
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Price
                          </span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            ${item.price}/unit
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Shelf Life
                          </span>
                          <span
                            className={`font-semibold ${
                              item.shelfLifeDays <= 2
                                ? "text-red-600 dark:text-red-400"
                                : item.shelfLifeDays <= 5
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {item.shelfLifeDays} days
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Expires
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Reorder At
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.reorderPoint} units
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
                          Reorder
                        </button>
                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                          Edit
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
      <MobileBottomNav
        role="retailer"
        onAlertsClick={() => setIsAlertsOpen(true)}
        alertCount={
          alerts.filter((a) => a.type === "critical" || a.type === "warning")
            .length
        }
      />
    </DashboardLayout>
  );
}
