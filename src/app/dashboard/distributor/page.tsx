"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// IMPORT SHARED & DISTRIBUTOR COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import DistributorStatsGrid from "@/components/dashboard/distributor/DistributorStatsGrid";
import FleetManagement from "@/components/dashboard/distributor/FleetManagement";
import WarehouseInventoryComponent from "@/components/dashboard/distributor/WarehouseInventory";
import ShipmentTrackingNew from "@/components/dashboard/distributor/ShipmentTrackingNew";
import DeliveryHistoryNew from "@/components/dashboard/distributor/DeliveryHistoryNew";
import TruckLoadManagementNew from "@/components/dashboard/distributor/TruckLoadManagementNew";
import EarningsOverview from "@/components/dashboard/distributor/EarningsOverview";
import RecentDeliveries from "@/components/dashboard/distributor/RecentDeliveries";

import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getMyWarehouseInventory,
  getWarehouseStats,
} from "@/actions/warehouseActions";
import {
  getDistributorOrdersByStatus,
  markOrderAsInTransit,
  markOrderAsDelivered,
  assignMultipleOrdersToTruck,
} from "@/actions/orderActions";
import { getMyFleet } from "@/actions/fleetActions";
import {
  getDistributorEarnings,
  DeliveryEarnings,
} from "@/actions/earningsActions";
import { WarehouseInventory } from "@/models/WarehouseInventory";
import { FleetSerialized } from "@/models/Fleet";
import {
  downloadCSV,
  prepareDataForExport,
  getDateString,
} from "@/lib/exportUtils";

// --- ADDED: Import the new component ---
import AlertsPanel from "@/components/ui/AlertsPanel";

// Type for enriched order data from farmer orders
type DistributorOrder = {
  _id: string;
  farmerId: string;
  retailerId?: string;
  distributorId?: string;
  produceId: string;
  produceName: string;
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  totalPrice: number;
  deliveryFee?: number;
  destination?: string;
  deliveryAddress?: string;
  distance?: number;
  status: string;
  orderDate: Date;
  deliveryDate?: Date;
  estimatedDelivery?: Date;
  assignedTruckId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  farmerName?: string;
  retailerName?: string;
};

export default function DistributorDashboard() {
  // --- STATE ---
  const [warehouseStock, setWarehouseStock] = useState<WarehouseInventory[]>(
    []
  );
  const [retailerOrders, setRetailerOrders] = useState<DistributorOrder[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<DistributorOrder[]>([]);
  const [pickedUpOrders, setPickedUpOrders] = useState<DistributorOrder[]>([]);
  const [inTransitOrders, setInTransitOrders] = useState<DistributorOrder[]>(
    []
  );
  const [deliveredOrders, setDeliveredOrders] = useState<DistributorOrder[]>(
    []
  );
  const [fleet, setFleet] = useState<FleetSerialized[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [warehouseCapacity, setWarehouseCapacity] = useState(0);
  const [earnings, setEarnings] = useState<DeliveryEarnings | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Sidebar & Responsive State
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          alertsData,
          warehouseData,
          assignedOrdersResult,
          pickedUpOrdersResult,
          inTransitOrdersResult,
          deliveredOrdersResult,
          fleetData,
          statsData,
          earningsData,
        ] = await Promise.all([
          getMyAlerts(),
          getMyWarehouseInventory(),
          getDistributorOrdersByStatus("assigned"),
          getDistributorOrdersByStatus("picked-up"),
          getDistributorOrdersByStatus("in-transit"),
          getDistributorOrdersByStatus("delivered"),
          getMyFleet(),
          getWarehouseStats(),
          getDistributorEarnings(),
        ]);

        setAlerts(alertsData);
        setWarehouseStock(warehouseData);
        setRetailerOrders([]); // Not using pending orders in new flow
        setAssignedOrders(
          assignedOrdersResult.success && assignedOrdersResult.data
            ? (assignedOrdersResult.data as DistributorOrder[])
            : []
        );
        setPickedUpOrders(
          pickedUpOrdersResult.success && pickedUpOrdersResult.data
            ? (pickedUpOrdersResult.data as DistributorOrder[])
            : []
        );
        setInTransitOrders(
          inTransitOrdersResult.success && inTransitOrdersResult.data
            ? (inTransitOrdersResult.data as DistributorOrder[])
            : []
        );
        setDeliveredOrders(
          deliveredOrdersResult.success && deliveredOrdersResult.data
            ? (deliveredOrdersResult.data as DistributorOrder[])
            : []
        );
        setFleet(fleetData);
        setWarehouseCapacity(statsData.capacityPercentage);
        if (earningsData.success && earningsData.data) {
          setEarnings(earningsData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- MEMOS (Derived Data) ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // --- EVENT HANDLERS ---
  const startDelivery = async (orderId: string) => {
    try {
      // Find the order to get truck info
      const order = pickedUpOrders.find((o) => o._id === orderId);
      if (!order?.assignedTruckId) {
        alert("Order has no assigned truck");
        return;
      }

      // Update order status to in-transit (delivery started)
      const result = await markOrderAsInTransit(orderId);

      if (!result.success) {
        alert(result.error || "Failed to start delivery");
        return;
      }

      // Refresh picked-up orders, in-transit orders, and fleet
      const [pickedUpOrdersResult, inTransitOrdersResult, fleetData] =
        await Promise.all([
          getDistributorOrdersByStatus("picked-up"),
          getDistributorOrdersByStatus("in-transit"),
          getMyFleet(),
        ]);

      setPickedUpOrders(
        pickedUpOrdersResult.success && pickedUpOrdersResult.data
          ? (pickedUpOrdersResult.data as DistributorOrder[])
          : []
      );
      setInTransitOrders(
        inTransitOrdersResult.success && inTransitOrdersResult.data
          ? (inTransitOrdersResult.data as DistributorOrder[])
          : []
      );
      setFleet(fleetData);

      console.log(`Order ${orderId} is now in transit`);
    } catch (error) {
      console.error("Error starting delivery:", error);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      // Update order status to delivered
      const result = await markOrderAsDelivered(orderId);

      if (!result.success) {
        alert(result.error || "Failed to mark as delivered");
        return;
      }

      // Refresh in-transit orders, delivered orders, fleet, and earnings
      const [
        inTransitOrdersResult,
        deliveredOrdersResult,
        fleetData,
        earningsData,
      ] = await Promise.all([
        getDistributorOrdersByStatus("in-transit"),
        getDistributorOrdersByStatus("delivered"),
        getMyFleet(),
        getDistributorEarnings(),
      ]);

      setInTransitOrders(
        inTransitOrdersResult.success && inTransitOrdersResult.data
          ? (inTransitOrdersResult.data as DistributorOrder[])
          : []
      );
      setDeliveredOrders(
        deliveredOrdersResult.success && deliveredOrdersResult.data
          ? (deliveredOrdersResult.data as DistributorOrder[])
          : []
      );
      setFleet(fleetData);
      if (earningsData.success && earningsData.data) {
        setEarnings(earningsData.data);
      }

      alert("Order marked as delivered successfully! 🎉");
      console.log(`Order ${orderId} has been delivered`);
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to mark as delivered. Please try again.");
    }
  };

  const handleAssignMultipleOrders = async (
    truckId: string,
    orderIds: string[]
  ) => {
    try {
      const result = await assignMultipleOrdersToTruck(truckId, orderIds);

      if (!result.success) {
        alert(result.error || "Failed to assign orders");
        return;
      }

      alert(result.message || "Orders assigned successfully!");

      // Refresh assigned orders and fleet
      const [assignedOrdersResult, fleetData] = await Promise.all([
        getDistributorOrdersByStatus("assigned"),
        getMyFleet(),
      ]);

      setAssignedOrders(
        assignedOrdersResult.success && assignedOrdersResult.data
          ? (assignedOrdersResult.data as DistributorOrder[])
          : []
      );
      setFleet(fleetData);
    } catch (error) {
      console.error("Error assigning orders:", error);
      alert("Failed to assign orders. Please try again.");
    }
  };

  const handleExport = () => {
    // Prepare comprehensive dashboard data for export
    const exportData = prepareDataForExport([
      ...assignedOrders.map((order) => ({
        type: "Assigned Order",
        orderId: order._id,
        produce: order.produceName,
        quantity: `${order.quantity} ${order.unit}`,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        farmer: order.farmerName,
        retailer: order.retailerName,
        assignedTruckId: order.assignedTruckId,
        orderDate: order.orderDate,
      })),
      ...inTransitOrders.map((order) => ({
        type: "In Transit Order",
        orderId: order._id,
        produce: order.produceName,
        quantity: `${order.quantity} ${order.unit}`,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        farmer: order.farmerName,
        retailer: order.retailerName,
        assignedTruckId: order.assignedTruckId,
        orderDate: order.orderDate,
      })),
      ...deliveredOrders.map((order) => ({
        type: "Delivered Order",
        orderId: order._id,
        produce: order.produceName,
        quantity: `${order.quantity} ${order.unit}`,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        farmer: order.farmerName,
        retailer: order.retailerName,
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
            hideMobileMenuButton
            alertCount={alertCount}
          />

          <div className="flex-1 min-h-0 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Priority Section 1: Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-3"
                    >
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </div>
              ) : (
                <DistributorStatsGrid
                  pendingOrdersCount={assignedOrders.length}
                  trucksOnRoadCount={trucksOnRoad.length}
                  warehouseCapacity={warehouseCapacity}
                />
              )}
            </motion.div>

            {/* Earnings Overview */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              earnings && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-8"
                >
                  <EarningsOverview earnings={earnings} />
                </motion.div>
              )
            )}

            {/* Priority Section: Fleet Management + Warehouse Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {isLoading ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <FleetManagement fleet={fleet} />
                  <WarehouseInventoryComponent stock={warehouseStock} />
                </>
              )}
            </motion.div>

            {/* Shipment Tracking + Recent Deliveries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {isLoading ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ShipmentTrackingNew
                    orders={[...pickedUpOrders, ...inTransitOrders]}
                    onMarkDelivered={markAsDelivered}
                    onStartDelivery={startDelivery}
                  />
                  {earnings && earnings.recentDeliveries.length > 0 && (
                    <RecentDeliveries deliveries={earnings.recentDeliveries} />
                  )}
                </>
              )}
            </motion.div>

            {/* Delivery History (Full) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ) : (
                <DeliveryHistoryNew orders={deliveredOrders} />
              )}
            </motion.div>

            {/* Truck Load Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ) : (
                <TruckLoadManagementNew
                  trucks={fleet.filter((t) => t.status === "available")}
                  assignedOrders={assignedOrders}
                  onAssignOrders={handleAssignMultipleOrders}
                />
              )}
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
        role="distributor"
        onAlertsClick={() => setIsAlertsOpen(true)}
        alertCount={alertCount}
      />
    </DashboardLayout>
  );
}
