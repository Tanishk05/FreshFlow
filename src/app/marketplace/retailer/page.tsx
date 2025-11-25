"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sprout, Search, ShoppingCart, Loader2, User } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  getMarketplaceProduce,
  MarketplaceProduce,
} from "@/actions/marketplaceActions";
import { createOrder } from "@/actions/orderActions";

// Emoji mapping for produce categories
const emojiMap: Record<string, string> = {
  vegetable: "🥬",
  fruit: "🍎",
  grain: "🌾",
  herb: "🌿",
};

export default function RetailerProcurementPage() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") ||
    "retailer";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [produce, setProduce] = useState<MarketplaceProduce[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [poItems, setPoItems] = useState<{ id: string; qty: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch marketplace produce on component mount
  useEffect(() => {
    async function fetchProduce() {
      try {
        setLoading(true);
        const data = await getMarketplaceProduce();
        setProduce(data);
      } catch (error) {
        console.error("Error fetching produce:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduce();
  }, []);

  const filtered = useMemo(
    () =>
      produce.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [produce, query]
  );

  const addToPO = (id: string) => {
    setPoItems((prev) => {
      const exists = prev.find((p) => p.id === id);
      if (exists)
        return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 10 } : p));
      return [...prev, { id, qty: 10 }];
    });
  };

  const decrementPO = (id: string) => {
    setPoItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, p.qty - 10) } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const removeFromPO = (id: string) => {
    setPoItems((prev) => prev.filter((p) => p.id !== id));
  };

  const totals = useMemo(() => {
    const totalQty = poItems.reduce((s, p) => s + p.qty, 0);
    const totalCost = poItems.reduce((s, p) => {
      const prod = produce.find((x) => x._id === p.id);
      return s + (prod ? prod.pricePerUnit * p.qty : 0);
    }, 0);
    return { totalQty, totalCost };
  }, [poItems, produce]);

  const handleSubmitPO = async () => {
    if (poItems.length === 0) return;

    setSubmitting(true);
    try {
      // Create orders for each item in the PO
      const orderPromises = poItems.map((item) =>
        createOrder({
          produceId: item.id,
          quantity: item.qty,
        })
      );

      const results = await Promise.all(orderPromises);

      // Check if all orders were successful
      const failedOrders = results.filter((r) => !r.success);
      if (failedOrders.length > 0) {
        alert(
          `Failed to create ${failedOrders.length} order(s). Please try again.`
        );
      } else {
        alert(
          `Successfully created ${poItems.length} order(s)! Check your dashboard for order status.`
        );
        // Clear the PO items after successful submission
        setPoItems([]);
        // Refresh produce list to get updated quantities
        const data = await getMarketplaceProduce();
        setProduce(data);
      }
    } catch (error) {
      console.error("Error submitting PO:", error);
      alert("Failed to submit purchase order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            role={role}
            isShrunk={isShrunk}
            setIsShrunk={setIsShrunk}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </div>

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
            title="Retailer Procurement"
            showNewPlan={false}
            showExport={false}
            showAlerts={false}
            hideMobileMenuButton
          />
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 custom-scrollbar">
            <div className="p-6 md:p-8 pb-20 md:pb-8">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200/50 dark:border-emerald-800/50">
                  <ShoppingCart size={14} /> Live Offers
                </div>
                <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      Buy Produce
                    </h1>
                    <p className="text-sm text-gray-500">
                      Purchase directly from verified farms.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search produce..."
                        className="w-64 pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <Link
                      href="/dashboard/retailer"
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Back
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Offers */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {loading ? (
                    <div className="col-span-2 flex items-center justify-center py-12">
                      <Loader2
                        className="animate-spin text-emerald-600"
                        size={32}
                      />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                      <Sprout
                        size={48}
                        className="text-gray-300 dark:text-gray-600 mb-3"
                      />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        No produce available
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {query
                          ? "Try adjusting your search query"
                          : "Check back later for fresh produce from farmers"}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filtered.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          whileHover={{ y: -4 }}
                          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-start gap-4 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/40 transition"
                        >
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-3xl">
                            {emojiMap[item.category] || "🌱"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                              <User size={14} /> {item.farmerName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {item.quantity} {item.unit} available
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-white">
                              ₹{item.pricePerUnit.toFixed(2)}/{item.unit}
                            </div>
                            <button
                              onClick={() => addToPO(item._id)}
                              className="mt-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg shadow hover:bg-emerald-700 transition"
                            >
                              Add 10{item.unit}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Draft PO */}
                <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 h-fit sticky top-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Draft Purchase Order</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {poItems.length} items
                    </span>
                  </div>
                  {poItems.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      No items in PO.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {poItems.map((p) => {
                        const prod = produce.find((x) => x._id === p.id);
                        if (!prod) return null;
                        return (
                          <li
                            key={p.id}
                            className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate text-gray-900 dark:text-white">
                                {prod.name}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                ₹{prod.pricePerUnit.toFixed(2)}/{prod.unit}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decrementPO(p.id)}
                                className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              >
                                -
                              </button>
                              <span className="text-sm w-14 text-center font-medium">
                                {p.qty} {prod.unit}
                              </span>
                              <button
                                onClick={() => addToPO(p.id)}
                                className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromPO(p.id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Total quantity
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {totals.totalQty} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Estimated cost
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{totals.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleSubmitPO}
                      disabled={poItems.length === 0 || submitting}
                      className="mt-3 w-full px-4 py-2 bg-linear-to-r from-emerald-600 to-green-500 text-white rounded-lg shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Submitting...
                        </>
                      ) : (
                        "Submit PO"
                      )}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
      <MobileBottomNav role={role} />
    </DashboardLayout>
  );
}
