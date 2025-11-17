"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";

// IMPORT SHARED & DISTRIBUTOR COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import AISavingsCard from "@/components/dashboard/shared/AISavingsCard";
import DistributorStatsGrid from "@/components/dashboard/distributor/DistributorStatsGrid";
import PendingRetailerOrders from "@/components/dashboard/distributor/PendingRetailerOrders";
import FleetManagement from "@/components/dashboard/distributor/FleetManagement";
import WarehouseInventoryComponent from "@/components/dashboard/distributor/WarehouseInventory";
import ShipmentTracking from "@/components/dashboard/distributor/ShipmentTracking";
import DeliveryHistory from "@/components/dashboard/distributor/DeliveryHistory";
import TruckLoadManagement from "@/components/dashboard/distributor/TruckLoadManagement";

// 🤖 AI-Powered Components
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getMyWarehouseInventory,
  getWarehouseStats,
} from "@/actions/warehouseActions";
import {
  getRetailerOrdersByStatus,
  updateRetailerOrderStatus,
} from "@/actions/retailerOrderActions";
import { getMyFleet } from "@/actions/fleetActions";
import { calculateDistributorAISavings } from "@/actions/aiSavingsActions";
import { WarehouseInventory } from "@/models/WarehouseInventory";
import { RetailerOrderSerialized } from "@/models/RetailerOrder";
import { FleetSerialized } from "@/models/Fleet";
import { useSession } from "next-auth/react";
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
  fromFuelReduction?: number;
};

type AISavingsMetadata = {
  deliveredOrdersCount?: number;
  totalDeliveryFees?: number;
  totalGoodsValue?: number;
  monthStart?: string;
  monthEnd?: string;
};

export default function DistributorDashboard() {
  const { data: session } = useSession();

  // --- STATE ---
  const [warehouseStock, setWarehouseStock] = useState<WarehouseInventory[]>(
    []
  );
  const [retailerOrders, setRetailerOrders] = useState<
    RetailerOrderSerialized[]
  >([]);
  const [assignedOrders, setAssignedOrders] = useState<
    RetailerOrderSerialized[]
  >([]);
  const [inTransitOrders, setInTransitOrders] = useState<
    RetailerOrderSerialized[]
  >([]);
  const [deliveredOrders, setDeliveredOrders] = useState<
    RetailerOrderSerialized[]
  >([]);
  const [fleet, setFleet] = useState<FleetSerialized[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [warehouseCapacity, setWarehouseCapacity] = useState(0);
  const [aiSavings, setAiSavings] = useState<AISavings>({
    total: 0,
    fromSpoilageReduction: 0,
    fromFuelReduction: 0,
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

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          alertsData,
          warehouseData,
          pendingOrdersData,
          assignedOrdersData,
          inTransitOrdersData,
          deliveredOrdersData,
          fleetData,
          statsData,
        ] = await Promise.all([
          getMyAlerts(),
          getMyWarehouseInventory(),
          getRetailerOrdersByStatus("pending"),
          getRetailerOrdersByStatus("assigned"),
          getRetailerOrdersByStatus("in-transit"),
          getRetailerOrdersByStatus("delivered"),
          getMyFleet(),
          getWarehouseStats(),
        ]);

        setAlerts(alertsData);
        setWarehouseStock(warehouseData);
        setRetailerOrders(pendingOrdersData);
        setAssignedOrders(assignedOrdersData);
        setInTransitOrders(inTransitOrdersData);
        setDeliveredOrders(deliveredOrdersData);
        setFleet(fleetData);
        setWarehouseCapacity(statsData.capacityPercentage);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // --- MEMOS (Derived Data) ---
  const pendingOrders = useMemo(
    () => retailerOrders.filter((o) => o.status === "pending"),
    [retailerOrders]
  );

  const trucksOnRoad = useMemo(
    () => fleet.filter((t) => t.status === "on-route"),
    [fleet]
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
        const savingsResult = await calculateDistributorAISavings(
          session.user.id
        );
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

  // --- EVENT HANDLERS ---
  const assignToRoute = async (orderId: string) => {
    try {
      // Find the order to get truck info
      const order = assignedOrders.find((o) => o._id === orderId);
      if (!order?.assignedTruckId) {
        console.log("Order has no assigned truck");
        return;
      }

      // Update order status to in-transit (delivery started)
      await updateRetailerOrderStatus(orderId, "in-transit");

      // Refresh assigned orders, in-transit orders, and fleet
      const [assignedOrdersData, inTransitOrdersData, fleetData] =
        await Promise.all([
          getRetailerOrdersByStatus("assigned"),
          getRetailerOrdersByStatus("in-transit"),
          getMyFleet(),
        ]);
      setAssignedOrders(assignedOrdersData);
      setInTransitOrders(inTransitOrdersData);
      setFleet(fleetData);

      console.log(`Order ${orderId} is now in transit`);
    } catch (error) {
      console.error("Error starting delivery:", error);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      // Update order status to delivered
      await updateRetailerOrderStatus(orderId, "delivered");

      // Refresh in-transit orders, delivered orders, and fleet
      const [inTransitOrdersData, deliveredOrdersData, fleetData] =
        await Promise.all([
          getRetailerOrdersByStatus("in-transit"),
          getRetailerOrdersByStatus("delivered"),
          getMyFleet(),
        ]);
      setInTransitOrders(inTransitOrdersData);
      setDeliveredOrders(deliveredOrdersData);
      setFleet(fleetData);

      alert("Order marked as delivered successfully! 🎉");
      console.log(`Order ${orderId} has been delivered`);
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to mark as delivered. Please try again.");
    }
  };

  const handleExport = () => {
    // Prepare comprehensive dashboard data for export
    const exportData = prepareDataForExport([
      ...retailerOrders.map((order) => ({
        type: "Pending Order",
        orderId: order._id,
        destination: order.destination,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        totalWeightKg: order.totalWeightKg,
        distance: order.distance,
        orderDate: order.orderDate,
      })),
      ...assignedOrders.map((order) => ({
        type: "Assigned Order",
        orderId: order._id,
        destination: order.destination,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        totalWeightKg: order.totalWeightKg,
        distance: order.distance,
        assignedTruckId: order.assignedTruckId,
        orderDate: order.orderDate,
      })),
      ...inTransitOrders.map((order) => ({
        type: "In Transit Order",
        orderId: order._id,
        destination: order.destination,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        totalWeightKg: order.totalWeightKg,
        distance: order.distance,
        assignedTruckId: order.assignedTruckId,
        orderDate: order.orderDate,
      })),
      ...deliveredOrders.map((order) => ({
        type: "Delivered Order",
        orderId: order._id,
        destination: order.destination,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        totalWeightKg: order.totalWeightKg,
        distance: order.distance,
        deliveryDate: order.deliveryDate,
        orderDate: order.orderDate,
      })),
    ]);

    const filename = `distributor-dashboard-${getDateString()}`;
    downloadCSV(exportData, filename);

    console.log("Dashboard data exported successfully");
  };

  // const createNewRoute = (formData: any) => {
  //   console.log("New route created:", formData);
  //   setIsModalOpen(false);
  // };

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
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            title="Logistics Overview"
            newButtonText="New Route"
            onNewPlanClick={() => {}}
            onExportClick={handleExport}
            showNewPlan={false}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
            alertCount={alertCount}
          />

          <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto">
            {/* Hero Section - Logistics Command Center */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-sky-900/20 border border-blue-200 dark:border-blue-800">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <h2 className="text-3xl font-bold bg-linear-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                        Logistics Command Center
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        AI-optimized fleet management & delivery tracking
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
                      >
                        <span>🚚</span> Fleet Status
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Section 1: Stats Overview */}
            <div className="mb-6">
              <DistributorStatsGrid
                pendingOrdersCount={pendingOrders.length}
                trucksOnRoadCount={trucksOnRoad.length}
                warehouseCapacity={warehouseCapacity}
              />
            </div>

            {/* Priority Section 2: AI Insights + Market Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AIInsightsCard
                role="distributor"
                dashboardData={{
                  stats: {
                    totalTrucks: fleet.length,
                    activeDeliveries: inTransitOrders.length,
                    pendingOrders: pendingOrders.length,
                    warehouseItems: warehouseStock.length,
                  },
                  recentActivity: [
                    `${fleet.length} truck${
                      fleet.length !== 1 ? "s" : ""
                    } in fleet`,
                    `${inTransitOrders.length} active deliver${
                      inTransitOrders.length !== 1 ? "ies" : "y"
                    }`,
                    `${pendingOrders.length} pending order${
                      pendingOrders.length !== 1 ? "s" : ""
                    }`,
                    `${deliveredOrders.length} order${
                      deliveredOrders.length !== 1 ? "s" : ""
                    } delivered`,
                  ],
                  inventory: warehouseStock,
                  orders: retailerOrders,
                  performance: {
                    onTimeDeliveryRate: deliveredOrders.length > 0 ? 95 : 0,
                    activeShipments: inTransitOrders.length,
                    totalRevenue: aiSavings.total,
                  },
                }}
              />

              <MarketIntelligenceCard
                userRole="distributor"
                userProducts={[]}
              />
            </div>

            {/* Priority Section 3: Critical Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PendingRetailerOrders
                orders={pendingOrders}
                onAssign={assignToRoute}
              />
              <ShipmentTracking
                orders={inTransitOrders}
                onMarkDelivered={markAsDelivered}
              />
            </div>

            {/* Secondary Section: Fleet + AI Savings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FleetManagement fleet={fleet} />
              <AISavingsCard
                savings={aiSavings}
                isLoading={isLoadingSavings}
                metadata={aiSavingsMetadata}
              />
            </div>

            {/* Tertiary Section: Warehouse + Order Book */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <WarehouseInventoryComponent stock={warehouseStock} />
              <DeliveryHistory deliveredOrders={deliveredOrders} />
            </div>

            <TruckLoadManagement
              trucks={fleet}
              pendingOrders={retailerOrders}
              onAssignOrders={async () => {
                try {
                  // Refresh data after assignment
                  const [pendingOrdersData, assignedOrdersData, fleetData] =
                    await Promise.all([
                      getRetailerOrdersByStatus("pending"),
                      getRetailerOrdersByStatus("assigned"),
                      getMyFleet(),
                    ]);
                  setRetailerOrders(pendingOrdersData);
                  setAssignedOrders(assignedOrdersData);
                  setFleet(fleetData);
                } catch (error) {
                  console.error(
                    "Error refreshing data after assignment:",
                    error
                  );
                }
              }}
              onGetSuggestions={async () => {
                // Refresh fleet data to get latest availability
                const fleetData = await getMyFleet();
                setFleet(fleetData);
              }}
            />
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
