"use client";
import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";

// IMPORT DISTRIBUTOR-SPECIFIC DATA
import {
  initialWarehouseStock,
  initialRetailerOrders,
  initialFleet,
  initialLogisticsAlerts,
} from "@/lib/data/distributorMockData";
import {
  AISavings,
  WarehouseItem,
  RetailerOrder,
  Truck,
  LogisticsAlert,
} from "@/lib/data/types";

// IMPORT SHARED & DISTRIBUTOR COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import AISavingsCard from "@/components/dashboard/shared/AISavingsCard";
import DistributorStatsGrid from "@/components/dashboard/distributor/DistributorStatsGrid";
import PendingRetailerOrders from "@/components/dashboard/distributor/PendingRetailerOrders";
import FleetManagement from "@/components/dashboard/distributor/FleetManagement";
import LogisticsAlerts from "@/components/dashboard/distributor/LogisticsAlerts";
import WarehouseInventory from "@/components/dashboard/distributor/WarehouseInventory";
// import NewRouteModal from "@/components/dashboard/distributor/NewRouteModal";

// --- ADDED: Import the new component ---
import OrderBook from "@/components/dashboard/distributor/OrderBook";

export default function DistributorDashboard() {
  // --- STATE ---
  const [warehouseStock, setWarehouseStock] = useState<WarehouseItem[]>(
    initialWarehouseStock
  );
  const [retailerOrders, setRetailerOrders] = useState<RetailerOrder[]>(
    initialRetailerOrders
  );
  const [fleet, setFleet] = useState<Truck[]>(initialFleet);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>(
    initialLogisticsAlerts
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar & Responsive State
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- MEMOS (Derived Data) ---
  const pendingOrders = useMemo(
    () => retailerOrders.filter((o) => o.status === "pending"),
    [retailerOrders]
  );

  const trucksOnRoad = useMemo(
    () => fleet.filter((t) => t.status === "en-route"),
    [fleet]
  );

  const warehouseCapacity = 92.5; // Example static value

  // --- AI SAVINGS (FOR GAIN-SHARING MODEL) ---
  const aiSavings = useMemo((): AISavings => {
    return {
      total: 8200.0,
      fromSpoilageReduction: 6100.0,
      fromFuelReduction: 2100.0,
    };
  }, []);

  // --- EVENT HANDLERS ---
  const assignToRoute = (orderId: string) => {
    console.log(`Assigning order ${orderId} to a route...`);
    setRetailerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "assigned" } : o))
    );
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
            onNewPlanClick={() => setIsModalOpen(true)}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          <div className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-y-hidden">
            {/* --- Main Column --- */}
            <div className="lg:col-span-2 space-y-8 lg:overflow-y-auto lg:pr-2">
              <DistributorStatsGrid
                pendingOrdersCount={pendingOrders.length}
                trucksOnRoadCount={trucksOnRoad.length}
                warehouseCapacity={warehouseCapacity}
              />

              <PendingRetailerOrders
                orders={pendingOrders}
                onAssign={assignToRoute}
              />

              <WarehouseInventory stock={warehouseStock} />

              {/* --- ADDED: The new component is rendered here --- */}
              <OrderBook />
            </div>

            {/* --- Right Column --- */}
            <div className="lg:col-span-1 space-y-8 lg:overflow-y-auto lg:pr-2">
              <AISavingsCard savings={aiSavings} />

              <LogisticsAlerts alerts={alerts} />

              <FleetManagement fleet={fleet} />
            </div>
          </div>
        </motion.main>
      </div>

      {/* <NewRouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createNewRoute}
      /> */}
      {/* Assuming Modal component exists */}
    </DashboardLayout>
  );
}
