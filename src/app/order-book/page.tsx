"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import OrderBook from "@/components/dashboard/distributor/OrderBook";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function OrderBookPage() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") ||
    "distributor";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showOnlyPayoutAbove, setShowOnlyPayoutAbove] = useState<number | null>(
    null
  );

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          role={role}
          isShrunk={isShrunk}
          setIsShrunk={setIsShrunk}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <motion.main
          animate={{
            marginLeft: isDesktop ? (isShrunk ? "88px" : "240px") : "0px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <DashboardHeader
            onNewPlanClick={() => {}}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            title="Order Book"
            showNewPlan={false}
            showExport={false}
            showAlerts={false}
          />
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Order Book</h1>
                  <p className="text-sm text-gray-500">
                    New logistics jobs available to accept.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min payout"
                    value={showOnlyPayoutAbove ?? ""}
                    onChange={(e) =>
                      setShowOnlyPayoutAbove(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="px-3 py-2 border rounded-lg"
                  />
                  <Link
                    href="/dashboard/distributor"
                    className="text-sm text-gray-500 underline"
                  >
                    Back to dashboard
                  </Link>
                </div>
              </div>

              {/* The existing OrderBook component now fetches from database with real-time updates. */}
              <OrderBook minPayout={showOnlyPayoutAbove} />
            </div>
          </div>
        </motion.main>
      </div>
    </DashboardLayout>
  );
}
