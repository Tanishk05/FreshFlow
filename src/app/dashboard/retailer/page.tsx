"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout"; // Assuming this exists
import Sidebar from "@/components/dashboard/Sidebar"; // Assuming this exists
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Assuming this exists
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// IMPORT SHARED & RETAILER COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import RetailerStatsGrid from "@/components/dashboard/retailer/RetailerStatsGrid";
import StoreInventory from "@/components/dashboard/retailer/StoreInventory";
import IncomingDeliveries from "@/components/dashboard/retailer/IncomingDeliveries";
import RetailerOrderTracking from "@/components/dashboard/retailer/RetailerOrderTracking";

import { getMyAlerts, Alert } from "@/actions/alertActions";
import {
  getMyStoreInventory,
  markItemAsSpoiled,
  getInventoryStats,
} from "@/actions/storeInventoryActions";
import { getMyRetailerOrders } from "@/actions/orderActions";
import {
  downloadCSV,
  prepareDataForExport,
  getDateString,
} from "@/lib/exportUtils";

// --- ADDED: Import the new component ---
import AlertsPanel from "@/components/ui/AlertsPanel";

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
  const router = useRouter();
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
  const [_isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [myOrders, setMyOrders] = useState<RetailerOrder[]>([]);

  // Sidebar & Responsive State
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleNewOrder = () => {
    router.push("/marketplace/retailer");
  };

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
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            title="Retailer Overview"
            newButtonText="New PO"
            onNewPlanClick={handleNewOrder}
            onExportClick={handleExport}
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
              <RetailerStatsGrid
                expiringSoonCount={inventoryStats.expiringSoonCount}
                lowStockCount={inventoryStats.lowStockCount}
                incomingDeliveriesCount={incomingDeliveries.length}
              />
            </motion.div>

            {/* Priority Section 2: Operations - Incoming Deliveries + Store Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <IncomingDeliveries deliveries={incomingDeliveries} />
              <StoreInventory
                inventory={inventory}
                onMarkSpoiled={markAsSpoiled}
              />
            </motion.div>

            {/* Priority Section 3: Order Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <RetailerOrderTracking orders={myOrders} />
            </motion.div>
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

      {/* Mobile Bottom Navigation */}
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
