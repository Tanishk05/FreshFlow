"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getMyProduce } from "@/actions/produceActions";
import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getOrdersByStatus,
  approveOrder as approveOrderAction,
  cancelOrder as cancelOrderAction,
  getMyOrders,
} from "@/actions/orderActions";
import { getMyShipments } from "@/actions/shipmentActions";
import { useRouter } from "next/navigation";
import {
  downloadCSV,
  prepareDataForExport,
  getDateString,
} from "@/lib/exportUtils";

// Import the new components
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import StatsGrid from "@/components/dashboard/farmer/StatsGrid";
import PendingOrders from "@/components/dashboard/farmer/PendingOrders";
import CropInventory from "@/components/dashboard/farmer/CropInventory";
import DemandForecasts from "@/components/dashboard/farmer/DemandForecasts";
import ShipmentsCard from "@/components/dashboard/farmer/ShipmentsCard";
import PerformanceCard from "@/components/dashboard/farmer/PerformanceCard";
import MapCard from "@/components/dashboard/farmer/MapCard";
import FarmerOrderTracking from "@/components/dashboard/farmer/FarmerOrderTracking";

// 🤖 AI-Powered Components
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

// --- ADDED: Import the new component ---
import AlertsPanel from "@/components/ui/AlertsPanel";

// --- REMOVED: Icons (Leaf, Package) are no longer needed here ---
// --- REMOVED: initialMarketplaceItems is no longer needed here ---

type Produce = {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  image: string;
  isVisible: boolean;
  isAvailable: boolean;
  harvestDate: string;
  shelfLifeDays: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type OrderFromDB = {
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
  retailerName?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  notes?: string;
};

type ShipmentFromDB = {
  _id: string;
  origin: string;
  destination: string;
  status: "in-transit" | "delivered" | "delayed";
  temperatureC: number;
  eta: Date;
};

export default function FarmerDashboard() {
  // --- STATE ---
  const [orders, setOrders] = useState<OrderFromDB[]>([]);
  const [trackedOrders, setTrackedOrders] = useState<OrderFromDB[]>([]);
  const [shipments, setShipments] = useState<ShipmentFromDB[]>([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [produce, setProduce] = useState<Produce[]>([]);
  const [produceLoading, setProduceLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // --- HOOKS ---
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch produce data
  useEffect(() => {
    const fetchProduce = async () => {
      setProduceLoading(true);
      const result = await getMyProduce();
      if (result.success && result.data) {
        setProduce(result.data as Produce[]);
      }
      setProduceLoading(false);
    };

    fetchProduce();
  }, []);

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

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getOrdersByStatus("pending");
        if (result.success && result.data) {
          setOrders(result.data as OrderFromDB[]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Fetch shipments data
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const result = await getMyShipments();
        if (result.success && result.data) {
          setShipments(result.data as ShipmentFromDB[]);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
      }
    };

    fetchShipments();
  }, []);

  // Fetch tracked orders (approved and completed)
  useEffect(() => {
    const fetchTrackedOrders = async () => {
      try {
        const result = await getMyOrders();
        if (result.success && result.data) {
          const allOrders = result.data as OrderFromDB[];
          // Filter to show only approved and completed orders
          const tracked = allOrders.filter(
            (o) => o.status === "approved" || o.status === "completed"
          );
          setTrackedOrders(tracked);
        }
      } catch (error) {
        console.error("Error fetching tracked orders:", error);
      }
    };

    fetchTrackedOrders();
  }, []);

  // --- MEMOS (Derived Data) ---
  // Calculate upcoming harvests from produce (items harvested recently or ready for harvest)
  const upcomingHarvests = useMemo(() => {
    const now = new Date();
    return produce.filter((p) => {
      const harvestDate = new Date(p.harvestDate);
      const daysSinceHarvest = Math.floor(
        (now.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Consider items harvested in last 3 days or ready for harvest
      return daysSinceHarvest <= 3 && p.isAvailable;
    });
  }, [produce]);

  const pendingOrders = useMemo(() => orders, [orders]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.totalPrice, 0),
    [orders]
  );

  const performanceMetrics = useMemo(() => {
    return {
      wasteReduction: -22,
      revenueUplift: 12.4,
      fulfillmentRate: 97.8,
    };
  }, []);

  // Convert produce to chart format (quantity in kg)
  const allCropsChartData = useMemo(() => {
    return produce.map((p) => ({
      name: p.name,
      kg:
        p.unit === "kg"
          ? p.quantity
          : p.unit === "tons"
          ? p.quantity * 1000
          : p.quantity * 50, // rough conversion
    }));
  }, [produce]);

  // Status data based on availability
  const statusChartData = useMemo(() => {
    const availableKg = produce
      .filter((p) => p.isAvailable)
      .reduce((sum, p) => {
        const kg =
          p.unit === "kg"
            ? p.quantity
            : p.unit === "tons"
            ? p.quantity * 1000
            : p.quantity * 50;
        return sum + kg;
      }, 0);

    const unavailableKg = produce
      .filter((p) => !p.isAvailable)
      .reduce((sum, p) => {
        const kg =
          p.unit === "kg"
            ? p.quantity
            : p.unit === "tons"
            ? p.quantity * 1000
            : p.quantity * 50;
        return sum + kg;
      }, 0);

    return [
      { name: "Available", kg: availableKg },
      { name: "Out of Stock", kg: unavailableKg },
    ];
  }, [produce]);

  const handleExport = () => {
    // Prepare comprehensive farmer dashboard data for export
    const exportData = prepareDataForExport([
      ...produce.map((item) => ({
        type: "Produce",
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        isAvailable: item.isAvailable,
        isVisible: item.isVisible,
        harvestDate: item.harvestDate,
        shelfLifeDays: item.shelfLifeDays,
      })),
      ...orders.map((order) => ({
        type: "Order",
        orderId: order._id,
        produceName: order.produceName,
        quantity: order.quantity,
        unit: order.unit,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        retailerName: order.retailerName,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
      })),
      ...shipments.map((shipment) => ({
        type: "Shipment",
        shipmentId: shipment._id,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        temperatureC: shipment.temperatureC,
        eta: shipment.eta,
      })),
    ]);

    const filename = `farmer-dashboard-${getDateString()}`;
    downloadCSV(exportData, filename);

    console.log("Farmer dashboard data exported successfully");
  };

  // --- EVENT HANDLERS ---
  const approveOrder = async (id: string) => {
    const result = await approveOrderAction(id);
    if (result.success) {
      // Refresh orders
      const ordersResult = await getOrdersByStatus("pending");
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data as OrderFromDB[]);
      }
      // Refresh produce
      const produceResult = await getMyProduce();
      if (produceResult.success && produceResult.data) {
        setProduce(produceResult.data as Produce[]);
      }
    }
  };

  const cancelOrder = async (id: string) => {
    const result = await cancelOrderAction(id);
    if (result.success) {
      // Refresh orders
      const ordersResult = await getOrdersByStatus("pending");
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data as OrderFromDB[]);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          role="farmer"
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
            onNewPlanClick={() => router.push("/my-produce")}
            onExportClick={handleExport}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
            alertCount={
              alerts.filter(
                (a) => a.type === "critical" || a.type === "warning"
              ).length
            }
          />

          {/* --- RESPONSIVE CONTENT AREA --- */}
          <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto">
            {/* Hero Section - AI + Agriculture Blend */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <h2 className="text-3xl font-bold bg-linear-to-r from-green-700 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                        Farm Intelligence Hub
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        AI-powered insights for smarter farming
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/my-produce")}
                        className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 flex items-center gap-2"
                      >
                        <span>🌱</span> Add Crop
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Section 1: Stats Overview */}
            <div className="mb-6">
              <StatsGrid
                totalRevenue={totalRevenue}
                pendingOrdersCount={pendingOrders.length}
                upcomingHarvestsCount={upcomingHarvests.length}
              />
            </div>

            {/* Priority Section 2: AI Insights + Market Intelligence Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 🤖 AI-Powered Personalized Insights */}
              <AIInsightsCard
                role="farmer"
                dashboardData={{
                  stats: {
                    totalCrops: produce.length,
                    totalRevenue: totalRevenue,
                    activeOrders: orders.length,
                    upcomingHarvests: upcomingHarvests.length,
                  },
                  recentActivity: [
                    `Managing ${produce.length} crop${
                      produce.length !== 1 ? "s" : ""
                    }`,
                    `${pendingOrders.length} pending order${
                      pendingOrders.length !== 1 ? "s" : ""
                    }`,
                    `${shipments.length} active shipment${
                      shipments.length !== 1 ? "s" : ""
                    }`,
                    `${upcomingHarvests.length} upcoming harvest${
                      upcomingHarvests.length !== 1 ? "s" : ""
                    }`,
                  ],
                  inventory: produce,
                  orders: orders,
                  performance: {
                    totalRevenue: totalRevenue,
                    ordersCompleted: trackedOrders.filter(
                      (o) => o.status === "completed"
                    ).length,
                    activeShipments: shipments.length,
                  },
                }}
              />

              {/* 🤖 AI-Powered Market Intelligence */}
              <MarketIntelligenceCard
                userRole="farmer"
                userProducts={produce.slice(0, 5).map((p) => p.name)}
              />
            </div>

            {/* Priority Section 3: Active Orders + Shipments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PendingOrders
                orders={pendingOrders}
                onApprove={approveOrder}
                onCancel={cancelOrder}
              />
              <ShipmentsCard shipments={shipments} />
            </div>

            {/* Secondary Section: Inventory + Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
              <div className="xl:col-span-2">
                <CropInventory produce={produce} loading={produceLoading} />
              </div>
              <div className="space-y-6">
                <PerformanceCard metrics={performanceMetrics} />
                <MapCard />
              </div>
            </div>

            {/* Tertiary Section: Analytics + Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemandForecasts
                allCropsData={allCropsChartData}
                statusData={statusChartData}
              />
              <FarmerOrderTracking orders={trackedOrders} />
            </div>
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

// --- REMOVED: The FarmerMarketplace function is now in its own file ---
