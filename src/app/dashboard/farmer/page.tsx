"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
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
import { getFarmerPerformanceMetrics } from "@/actions/performanceActions";
import { useRouter } from "next/navigation";
import {
  downloadCSV,
  prepareDataForExport,
  getDateString,
} from "@/lib/exportUtils";

// Import the new components
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import PendingOrders from "@/components/dashboard/farmer/PendingOrders";
import CropInventory from "@/components/dashboard/farmer/CropInventory";
import DemandForecasts from "@/components/dashboard/farmer/DemandForecasts";
import ShipmentsCard from "@/components/dashboard/farmer/ShipmentsCard";
import PerformanceCard from "@/components/dashboard/farmer/PerformanceCard";
import FarmerOrderTracking from "@/components/dashboard/farmer/FarmerOrderTracking";

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
  status:
    | "pending"
    | "approved"
    | "assigned"
    | "picked-up"
    | "in-transit"
    | "delivered"
    | "rejected"
    | "cancelled";
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
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalRevenue: number;
    revenueGrowth: number;
    fulfillmentRate: number;
    averageOrderValue: number;
    totalOrders: number;
    deliveredOrders: number;
    activeListings: number;
    totalQuantitySold: number;
    topSellingProduce: string;
  } | null>(null);

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
          // Filter to show approved, assigned, picked-up, in-transit, and delivered orders
          const tracked = allOrders.filter(
            (o) =>
              o.status === "approved" ||
              o.status === "assigned" ||
              o.status === "picked-up" ||
              o.status === "in-transit" ||
              o.status === "delivered"
          );
          setTrackedOrders(tracked);
        }
      } catch (error) {
        console.error("Error fetching tracked orders:", error);
      }
    };

    fetchTrackedOrders();
  }, []);

  // Fetch performance metrics
  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const result = await getFarmerPerformanceMetrics();
        if (result.success && result.data) {
          setPerformanceMetrics(result.data);
        }
      } catch (error) {
        console.error("Error fetching performance metrics:", error);
      }
    };

    fetchPerformanceMetrics();
  }, []);

  // --- MEMOS (Derived Data) ---
  const pendingOrders = useMemo(() => orders, [orders]);

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
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            onNewPlanClick={() => router.push("/my-produce")}
            onExportClick={handleExport}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onAlertsClick={() => setIsAlertsOpen(true)}
            hideMobileMenuButton
            alertCount={
              alerts.filter(
                (a) => a.type === "critical" || a.type === "warning"
              ).length
            }
          />

          {/* --- RESPONSIVE CONTENT AREA --- */}
          <div className="flex-1 min-h-0 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 custom-scrollbar">
            {/* Priority Section 1: Order Tracking + Pending Orders (Most Important) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <FarmerOrderTracking orders={trackedOrders} />
              <PendingOrders
                orders={pendingOrders}
                onApprove={approveOrder}
                onCancel={cancelOrder}
              />
            </motion.div>

            {/* Priority Section 2: Live Shipments + Active Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 gap-6 mb-8"
            >
              <ShipmentsCard shipments={shipments} />
            </motion.div>

            {/* Secondary Section: Inventory + Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8"
            >
              <div className="xl:col-span-2">
                <CropInventory produce={produce} loading={produceLoading} />
              </div>
              <div>
                {performanceMetrics && (
                  <PerformanceCard metrics={performanceMetrics} />
                )}
              </div>
            </motion.div>

            {/* Tertiary Section: Demand Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 gap-6 mb-8"
            >
              <DemandForecasts
                allCropsData={allCropsChartData}
                statusData={statusChartData}
              />
            </motion.div>
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

// --- REMOVED: The FarmerMarketplace function is now in its own file ---
