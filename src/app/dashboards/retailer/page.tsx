"use client";
import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout"; // Assuming this exists
import Sidebar from "@/components/dashboard/Sidebar"; // Assuming this exists
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Assuming this exists
import { motion } from "framer-motion";

// IMPORT RETAILER-SPECIFIC DATA
import {
  initialStoreInventory,
  initialPurchaseOrders,
  initialPricingSuggestions,
} from "@/lib/data/retailerMockData";
import {
  AISavings,
  StoreItem,
  PurchaseOrder,
  PricingSuggestion,
} from "@/lib/data/types";

// IMPORT SHARED & RETAILER COMPONENTS
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import AISavingsCard from "@/components/dashboard/shared/AISavingsCard";
import RetailerStatsGrid from "@/components/dashboard/retailer/RetailerStatsGrid";
import DynamicPricingSuggestions from "@/components/dashboard/retailer/DynamicPricingSuggestions";
import StoreInventory from "@/components/dashboard/retailer/StoreInventory";
import IncomingDeliveries from "@/components/dashboard/retailer/IncomingDeliveries";
import ConsumerDemandForecast from "@/components/dashboard/retailer/ConsumerDemandForecast";
// import NewPurchaseOrderModal from "@/components/dashboard/retailer/NewPurchaseOrderModal"; // Assuming Modal exists

export default function RetailerDashboard() {
  // --- STATE ---
  const [inventory, setInventory] = useState<StoreItem[]>(
    initialStoreInventory
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    initialPurchaseOrders
  );
  const [pricingSuggestions, setPricingSuggestions] = useState<
    PricingSuggestion[]
  >(initialPricingSuggestions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar & Responsive State
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- MEMOS (Derived Data) ---
  const expiringSoonItems = useMemo(
    () => inventory.filter((item) => item.shelfLifeDays <= 2),
    [inventory]
  );

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.stock < item.reorderPoint),
    [inventory]
  );

  const incomingDeliveries = useMemo(
    () => purchaseOrders.filter((po) => po.status === "shipped"),
    [purchaseOrders]
  );

  // --- AI SAVINGS (FOR GAIN-SHARING MODEL) ---
  const aiSavings = useMemo((): AISavings => {
    return {
      total: 1450.75,
      fromSpoilageReduction: 920.5,
      fromDynamicPricing: 530.25,
    };
  }, []);

  // --- EVENT HANDLERS ---
  const applyPricingSuggestion = (id: string) => {
    console.log(`Applying price for suggestion ${id}`);
    setPricingSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const markAsSpoiled = (id: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: 0, status: "spoiled" } : item
      )
    );
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
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          <div className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-y-hidden">
            {/* --- Main Column --- */}
            <div className="lg:col-span-2 space-y-8 lg:overflow-y-auto lg:pr-2">
              <RetailerStatsGrid
                expiringSoonCount={expiringSoonItems.length}
                lowStockCount={lowStockItems.length}
                incomingDeliveriesCount={incomingDeliveries.length}
              />

              <DynamicPricingSuggestions
                suggestions={pricingSuggestions}
                onApply={applyPricingSuggestion}
              />

              <StoreInventory
                inventory={inventory}
                onMarkSpoiled={markAsSpoiled}
              />
            </div>

            {/* --- Right Column --- */}
            <div className="lg:col-span-1 space-y-8 lg:overflow-y-auto lg:pr-2">
              <AISavingsCard savings={aiSavings} />

              <ConsumerDemandForecast />

              <IncomingDeliveries deliveries={incomingDeliveries} />
            </div>
          </div>
        </motion.main>
      </div>

      {/* <NewPurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createPurchaseOrder}
      /> */}
      {/* Assuming Modal component exists */}
    </DashboardLayout>
  );
}
