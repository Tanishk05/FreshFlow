"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout"; // Assuming this exists
import Sidebar from "@/components/dashboard/Sidebar"; // Assuming this exists
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Assuming this exists
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

// IMPORT SHARED & RETAILER COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import AISavingsCard from "@/components/dashboard/shared/AISavingsCard";
import RetailerStatsGrid from "@/components/dashboard/retailer/RetailerStatsGrid";
import DynamicPricingSuggestions from "@/components/dashboard/retailer/DynamicPricingSuggestions";
import StoreInventory from "@/components/dashboard/retailer/StoreInventory";
import IncomingDeliveries from "@/components/dashboard/retailer/IncomingDeliveries";
import ConsumerDemandForecast from "@/components/dashboard/retailer/ConsumerDemandForecast";
import RetailerOrderTracking from "@/components/dashboard/retailer/RetailerOrderTracking";

// 🤖 AI-Powered Components
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getMyStoreInventory,
  markItemAsSpoiled,
  getInventoryStats,
} from "@/actions/storeInventoryActions";
import {
  getDynamicPricingSuggestions,
  applyPricingSuggestion,
  PricingSuggestion,
} from "@/actions/dynamicPricingActions";
import { getMyRetailerOrders } from "@/actions/orderActions";
import { calculateRetailerAISavings } from "@/actions/aiSavingsActions";
import {
  downloadCSV,
  prepareDataForExport,
  getDateString,
} from "@/lib/exportUtils";

// --- ADDED: Import the new component ---
import AlertsPanel from "@/components/ui/AlertsPanel";

type AISavings = {
  total: number;
  fromSpoilageReduction: number;
  fromDynamicPricing?: number;
};

type AISavingsMetadata = {
  deliveredOrdersCount?: number;
  totalGoodsValue?: number;
  monthStart?: string;
  monthEnd?: string;
};

type StoreItem = {
  _id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number;
  status: "fresh" | "expiring" | "spoiled";
};

type RetailerOrder = {
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
  deliveryDate?: Date;
  farmerName?: string;
  notes?: string;
};

type PurchaseOrder = {
  id: string;
  distributorName: string;
  itemCount: number;
  status: "pending" | "shipped" | "delivered";
  eta: string;
  liveTemperature: number;
};

type InventoryStats = {
  expiringSoonCount: number;
  lowStockCount: number;
  spoiledCount: number;
  totalItems: number;
  totalValue: number;
};

export default function RetailerDashboard() {
  const { data: session } = useSession();

  // --- STATE ---
  const [inventory, setInventory] = useState<StoreItem[]>([]);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    expiringSoonCount: 0,
    lowStockCount: 0,
    spoiledCount: 0,
    totalItems: 0,
    totalValue: 0,
  });
  const [purchaseOrders] = useState<PurchaseOrder[]>([]);
  const [pricingSuggestions, setPricingSuggestions] = useState<
    PricingSuggestion[]
  >([]);
  const [_isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [myOrders, setMyOrders] = useState<RetailerOrder[]>([]);
  const [aiSavings, setAiSavings] = useState<AISavings>({
    total: 0,
    fromSpoilageReduction: 0,
    fromDynamicPricing: 0,
  });
  const [aiSavingsMetadata, setAiSavingsMetadata] = useState<AISavingsMetadata>(
    {}
  );
  const [isLoadingSavings, setIsLoadingSavings] = useState(true);

  // Sidebar & Responsive State
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const result = await getMyStoreInventory();
        if (result.success && result.data) {
          setInventory(result.data as StoreItem[]);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  // Fetch pricing suggestions
  useEffect(() => {
    const fetchPricingSuggestions = async () => {
      try {
        const result = await getDynamicPricingSuggestions();
        if (result.success && result.data) {
          setPricingSuggestions(result.data);
        }
      } catch (error) {
        console.error("Error fetching pricing suggestions:", error);
      }
    };

    fetchPricingSuggestions();
  }, [inventory]); // Refetch when inventory changes

  // Fetch inventory stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getInventoryStats();
        if (result.success && result.data) {
          setInventoryStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching inventory stats:", error);
      }
    };

    fetchStats();
  }, [inventory]); // Refetch stats when inventory changes

  // Fetch alerts data
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alertsData = await getMyAlerts();
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
  }, []);

  // Fetch retailer orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getMyRetailerOrders();
        if (result.success && result.data) {
          setMyOrders(result.data as RetailerOrder[]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // --- MEMOS (Derived Data) ---
  const incomingDeliveries = useMemo(
    () => purchaseOrders.filter((po) => po.status === "shipped"),
    [purchaseOrders]
  );

  // Calculate alert count for header badge
  const alertCount = useMemo(() => {
    return alerts.filter((a) => a.type === "critical" || a.type === "warning")
      .length;
  }, [alerts]);

  // Fetch AI Savings
  useEffect(() => {
    const fetchAISavings = async () => {
      if (!session?.user?.id) {
        setIsLoadingSavings(false);
        return;
      }

      try {
        const savingsResult = await calculateRetailerAISavings(session.user.id);
        if (savingsResult.success) {
          setAiSavings(savingsResult.savings);
          setAiSavingsMetadata(savingsResult.metadata || {});
        }
      } catch (error) {
        console.error("Error fetching AI savings:", error);
      } finally {
        setIsLoadingSavings(false);
      }
    };

    fetchAISavings();
  }, [session?.user?.id]);

  const handleExport = () => {
    // Prepare comprehensive retailer dashboard data for export
    const exportData = prepareDataForExport([
      ...inventory.map((item) => ({
        type: "Inventory",
        itemId: item._id,
        name: item.name,
        stock: item.stock,
        reorderPoint: item.reorderPoint,
        shelfLifeDays: item.shelfLifeDays,
        status: item.status,
      })),
      ...pricingSuggestions.map((suggestion) => ({
        type: "Pricing Suggestion",
        suggestionId: suggestion.id,
        itemName: suggestion.itemName,
        currentPrice: suggestion.currentPrice,
        suggestedPrice: suggestion.suggestedPrice,
        reason: suggestion.reason,
      })),
      ...myOrders.map((order) => ({
        type: "Order",
        orderId: order._id,
        produceName: order.produceName,
        quantity: order.quantity,
        unit: order.unit,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        farmerName: order.farmerName,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
      })),
    ]);

    const filename = `retailer-dashboard-${getDateString()}`;
    downloadCSV(exportData, filename);

    console.log("Retailer dashboard data exported successfully");
  };

  // --- EVENT HANDLERS ---
  const applyPricingSuggestionHandler = async (
    id: string,
    newPrice: number
  ) => {
    const result = await applyPricingSuggestion(id, newPrice);
    if (result.success) {
      // Remove the applied suggestion from the list
      setPricingSuggestions((prev) => prev.filter((s) => s.id !== id));

      // Refresh inventory to show updated price
      const inventoryResult = await getMyStoreInventory();
      if (inventoryResult.success && inventoryResult.data) {
        setInventory(inventoryResult.data as StoreItem[]);
      }

      // Refresh stats
      const statsResult = await getInventoryStats();
      if (statsResult.success && statsResult.data) {
        setInventoryStats(statsResult.data);
      }
    }
  };

  const markAsSpoiled = async (id: string) => {
    const result = await markItemAsSpoiled(id);
    if (result.success) {
      // Refresh inventory
      const inventoryResult = await getMyStoreInventory();
      if (inventoryResult.success && inventoryResult.data) {
        setInventory(inventoryResult.data as StoreItem[]);
      }
      // Refresh stats
      const statsResult = await getInventoryStats();
      if (statsResult.success && statsResult.data) {
        setInventoryStats(statsResult.data);
      }
    }
  };

  // const createPurchaseOrder = (formData: any) => {
  //   console.log("New PO created:", formData);
  //   setIsModalOpen(false);
  // };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          role="retailer"
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
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            title="Retailer Overview"
            newButtonText="New PO"
            onNewPlanClick={() => setIsModalOpen(true)}
            onExportClick={handleExport}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
            alertCount={alertCount}
          />

          <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto">
            {/* Hero Section - Smart Retail Operations */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border border-purple-200 dark:border-purple-800">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <h2 className="text-3xl font-bold bg-linear-to-r from-purple-700 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                        Smart Retail Operations
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        AI-driven pricing & inventory management
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 flex items-center gap-2"
                      >
                        <span>🛒</span> View Inventory
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Section 1: Stats Overview */}
            <div className="mb-6">
              <RetailerStatsGrid
                expiringSoonCount={inventoryStats.expiringSoonCount}
                lowStockCount={inventoryStats.lowStockCount}
                incomingDeliveriesCount={incomingDeliveries.length}
              />
            </div>

            {/* Priority Section 2: AI Insights + Market Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AIInsightsCard
                role="retailer"
                dashboardData={{
                  stats: {
                    inventoryCount: inventory.length,
                    lowStockCount: inventoryStats.lowStockCount,
                    expiringSoonCount: inventoryStats.expiringSoonCount,
                    pricingSuggestionsCount: pricingSuggestions.length,
                  },
                  recentActivity: [
                    `${inventory.length} item${
                      inventory.length !== 1 ? "s" : ""
                    } in inventory`,
                    `${pricingSuggestions.length} pricing suggestion${
                      pricingSuggestions.length !== 1 ? "s" : ""
                    }`,
                    `${myOrders.length} order${
                      myOrders.length !== 1 ? "s" : ""
                    } from farmers`,
                    `${incomingDeliveries.length} incoming deliver${
                      incomingDeliveries.length !== 1 ? "ies" : "y"
                    }`,
                  ],
                  inventory: inventory,
                  orders: myOrders,
                  performance: {
                    wastePercentage:
                      inventoryStats.spoiledCount > 0
                        ? Math.round(
                            (inventoryStats.spoiledCount /
                              inventoryStats.totalItems) *
                              100
                          )
                        : 0,
                    totalRevenue: aiSavings.total,
                    savingsFromPricing: aiSavings.fromDynamicPricing || 0,
                  },
                }}
              />

              <MarketIntelligenceCard
                userRole="retailer"
                userProducts={inventory.slice(0, 5).map((item) => item.name)}
              />
            </div>

            {/* Priority Section 3: AI Pricing + Deliveries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DynamicPricingSuggestions
                suggestions={pricingSuggestions}
                onApply={applyPricingSuggestionHandler}
              />
              <IncomingDeliveries deliveries={incomingDeliveries} />
            </div>

            {/* Secondary Section: Inventory + Demand Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <StoreInventory
                inventory={inventory}
                onMarkSpoiled={markAsSpoiled}
              />
              <ConsumerDemandForecast />
            </div>

            {/* Tertiary Section: Order Tracking + AI Savings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RetailerOrderTracking orders={myOrders} />
              <AISavingsCard
                savings={aiSavings}
                isLoading={isLoadingSavings}
                metadata={aiSavingsMetadata}
              />
            </div>
          </div>
        </motion.main>
      </div>

      {/* <NewPurchaseOrderModal
        isOpen={_isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createPurchaseOrder}
      /> */}
      <AlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
      />
      {/* tiny usage to avoid unused variable warning */}
      {_isModalOpen && null}
      {/* Assuming Modal component exists */}
    </DashboardLayout>
  );
}
