"use client";
import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  initialCrops,
  initialOrders,
  initialShipments,
} from "@/lib/data/farmerMockData";
import { Crop, Order, Shipment } from "@/lib/data/types";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Import the new components
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import StatsGrid from "@/components/dashboard/farmer/StatsGrid";
import PendingOrders from "@/components/dashboard/farmer/PendingOrders";
import CropInventory from "@/components/dashboard/farmer/CropInventory";
import DemandForecasts from "@/components/dashboard/farmer/DemandForecasts";
import AlertsCard from "@/components/dashboard/farmer/AlertsCard";
import ShipmentsCard from "@/components/dashboard/farmer/ShipmentsCard";
import PerformanceCard from "@/components/dashboard/farmer/PerformanceCard";
import MapCard from "@/components/dashboard/farmer/MapCard";
import AddCropModal from "@/components/dashboard/farmer/AddCropModal";
import { FormattedTime } from "@/components/dashboard/FormattedTime"; // Still needed for alerts

export default function FarmerDashboard() {
  // --- STATE ---
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", quantityKg: 0, pricePerKg: 0 });
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- HOOKS ---
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- MEMOS (Derived Data) ---
  const upcomingHarvests = useMemo(
    () => crops.filter((c) => c.status === "growing"),
    [crops]
  );

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.currentPrice * o.quantity, 0),
    [orders]
  );

  const alerts = useMemo(() => {
    // ... (alert logic remains identical)
    const harvestReminders = upcomingHarvests.map((c) => ({
      id: c.id,
      type: "reminder" as const,
      title: "Harvest reminder",
      message: `${c.name} (Field ${c.id.slice(0, 2)}) tomorrow 6:00 AM`,
    }));
    const heatAdvisories = crops
      .filter((c) => c.name.includes("Spinach"))
      .map((c) => ({
        id: c.id,
        type: "advisory" as const,
        title: "Heat advisory",
        message: `${c.name} sensitive 12-3 PM`,
      }));

    const shipmentAlerts = shipments
      .filter((s) => s.status === "delayed" || s.temperatureC > 6)
      .map((s) => ({
        id: s.id,
        type: "risk" as const,
        title:
          s.status === "delayed"
            ? `Shipment ${s.id} Delayed`
            : `Temp. Alert ${s.id}`,
        message:
          s.status === "delayed"
            ? `ETA:`
            : `Temp at ${s.temperatureC}°C for ${s.destination}`,
        eta: s.status === "delayed" ? s.eta : undefined,
      }));

    return [
      {
        id: "overproduction-kale",
        type: "risk" as const,
        title: "Overproduction risk for Kale",
        message: "High risk for next week.",
      },
      ...shipmentAlerts,
      ...harvestReminders,
      ...heatAdvisories,
    ];
  }, [upcomingHarvests, crops, shipments]);

  const performanceMetrics = useMemo(() => {
    return {
      wasteReduction: -22,
      revenueUplift: 12.4,
      fulfillmentRate: 97.8,
    };
  }, []);

  const allCropsChartData = useMemo(
    () => crops.map((c) => ({ name: c.name, kg: c.quantityKg })),
    [crops]
  );

  const statusChartData = useMemo(
    () => [
      {
        name: "Ready",
        kg: crops
          .filter((c) => c.status === "ready")
          .reduce((s, c) => s + c.quantityKg, 0),
      },
      {
        name: "Growing",
        kg: crops
          .filter((c) => c.status === "growing")
          .reduce((s, c) => s + c.quantityKg, 0),
      },
    ],
    [crops]
  );

  // --- EVENT HANDLERS ---
  const addCrop = () => {
    if (!form.name || form.quantityKg <= 0) return;
    const newCrop: Crop = {
      id: uuidv4(),
      name: form.name,
      quantityKg: form.quantityKg,
      harvestDate: new Date().toISOString(),
      pricePerKg: form.pricePerKg || 1,
      status: "growing",
    };
    setCrops((prev) => [newCrop, ...prev]);
    setForm({ name: "", quantityKg: 0, pricePerKg: 0 });
    setIsModalOpen(false);
  };

  const deleteCrop = (id: string) =>
    setCrops((prev) => prev.filter((p) => p.id !== id));

  const approveOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o))
    );
  };

  const cancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))
    );
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
        />

        <motion.main
          animate={{
            marginLeft: isDesktop ? (isShrunk ? "88px" : "240px") : "0px",
          }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            onNewPlanClick={() => setIsModalOpen(true)}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* --- RESPONSIVE CONTENT AREA --- */}
          <div className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-y-hidden">
            {/* --- Main Column (Left + Mid) --- */}
            <div className="lg:col-span-2 space-y-8 lg:overflow-y-auto lg:pr-2">
              <StatsGrid
                totalRevenue={totalRevenue}
                pendingOrdersCount={pendingOrders.length}
                upcomingHarvestsCount={upcomingHarvests.length}
                alertsCount={alerts.length}
                urgentAlertsCount={
                  alerts.filter((a) => a.type === "risk").length
                }
              />

              <PendingOrders
                orders={pendingOrders}
                onApprove={approveOrder}
                onCancel={cancelOrder}
              />

              <CropInventory crops={crops} onDelete={deleteCrop} />

              <DemandForecasts
                allCropsData={allCropsChartData}
                statusData={statusChartData}
              />
            </div>

            {/* --- Right Column --- */}
            <div className="lg:col-span-1 space-y-8 lg:overflow-y-auto lg:pr-2">
              <AlertsCard alerts={alerts} />
              <ShipmentsCard shipments={shipments} />
              <PerformanceCard metrics={performanceMetrics} />
              <MapCard />
            </div>
          </div>
        </motion.main>
      </div>

      {/* --- MODAL --- */}
      <AddCropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={addCrop}
      />
    </DashboardLayout>
  );
}
