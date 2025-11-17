"use client";
import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Leaf, Package, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const initialMarketplaceItems = [
  {
    id: "mkt-1",
    name: "Organic Fertilizer",
    description: "NPK 5-5-5, 50kg bag",
    price: 25.0,
    icon: Leaf,
  },
  {
    id: "mkt-2",
    name: "Heirloom Tomato Seeds",
    description: "Approx. 500 seeds",
    price: 15.0,
    icon: Package,
  },
  {
    id: "mkt-3",
    name: "Pest Control (Organic)",
    description: "Neem Oil, 1L bottle",
    price: 22.5,
    icon: Leaf,
  },
  {
    id: "mkt-4",
    name: "Cover Crop Mix",
    description: "Winter Rye & Vetch, 20kg",
    price: 30.0,
    icon: Package,
  },
];

export default function FarmerMarketplacePage() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") || "farmer";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [items] = useState(initialMarketplaceItems);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const total = useMemo(
    () =>
      cart.reduce((sum, id) => {
        const it = items.find((i) => i.id === id);
        return sum + (it ? it.price : 0);
      }, 0),
    [cart, items]
  );

  const filtered = useMemo(
    () =>
      items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  const addToCart = (id: string) =>
    setCart((c) => (c.includes(id) ? c : [...c, id]));

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
            title="Farmer Marketplace"
            showNewPlan={false}
            showExport={false}
            showAlerts={false}
          />
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-linear-to-r from-green-600 to-emerald-500 text-white shadow">
                  <ShoppingCart size={14} /> Beta Marketplace
                </div>
                <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      Farmer Marketplace
                    </h1>
                    <p className="text-sm text-gray-500">
                      Buy essentials, seeds and inputs to power your next
                      season.
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
                        placeholder="Search items..."
                        className="w-64 pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <Link
                      href="/dashboard/farmer"
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Back
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filtered.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-start gap-4 border border-transparent hover:border-green-200 dark:hover:border-green-900/40 transition"
                    >
                      <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                        >
                          Add
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cart */}
                <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 h-fit">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Cart</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {cart.length} items
                    </span>
                  </div>
                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-3">
                      No items selected.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {cart.map((id) => {
                        const it = items.find((i) => i.id === id)!;
                        return (
                          <li
                            key={id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {it.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                ${it.price.toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setCart((c) => c.filter((x) => x !== id))
                              }
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Estimated total</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <button className="mt-3 w-full px-4 py-2 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-lg shadow">
                      Proceed to order
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </DashboardLayout>
  );
}
