"use client";
import React, { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Sidebar from "../components/Sidebar";
import SmallStat from "../components/SmallStat";
import Modal from "../components/Modal";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { FormattedDate } from "../components/FormattedDate";
import { FormattedTime } from "../components/FormattedTime";
import {
  initialCrops,
  Crop,
  initialOrders,
  Order,
  initialShipments,
  Shipment,
} from "../data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Brush,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  Download,
  Bell,
  AlertTriangle,
  Droplet,
  Menu,
  Check,
  X as XIcon,
  Ship,
  Clock,
  Thermometer,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // <-- 1. IMPORT THE HOOK

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Updated StatusDot to include "sold"
const StatusDot = ({ status }: { status: "ready" | "growing" | "sold" }) => (
  <span
    className={`w-3 h-3 rounded-full mr-2 shrink-0 ${
      status === "ready"
        ? "bg-green-500"
        : status === "growing"
        ? "bg-yellow-500"
        : "bg-gray-400"
    }`}
  ></span>
);

export default function FarmerDashboard() {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", quantityKg: 0, pricePerKg: 0 });

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- 2. USE THE HOOK ---
  // 768px is the default 'md' breakpoint in Tailwind
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- Dynamic Data Memos ---
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
    const harvestReminders = upcomingHarvests.map((c) => ({
      id: c.id,
      type: "reminder",
      title: "Harvest reminder",
      message: `${c.name} (Field ${c.id.slice(0, 2)}) tomorrow 6:00 AM`,
    }));
    const heatAdvisories = crops
      .filter((c) => c.name.includes("Spinach"))
      .map((c) => ({
        id: c.id,
        type: "advisory",
        title: "Heat advisory",
        message: `${c.name} sensitive 12-3 PM`,
      }));

    const shipmentAlerts = shipments
      .filter((s) => s.status === "delayed" || s.temperatureC > 6)
      .map((s) => ({
        id: s.id,
        type: "risk",
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
        type: "risk",
        title: "Overproduction risk for Kale",
        message: "High risk for next week.",
      },
      ...shipmentAlerts,
      ...harvestReminders,
      ...heatAdvisories,
    ];
  }, [upcomingHarvests, crops, shipments]);

  const performanceMetrics = useMemo(() => {
    const wasteReduction = -22;
    const revenueUplift = 12.4;
    const fulfillmentRate = 97.8;
    return { wasteReduction, revenueUplift, fulfillmentRate };
  }, []);

  const sampleData = useMemo(
    () => crops.map((c) => ({ name: c.name, kg: c.quantityKg })),
    [crops]
  );
  // --- End Dynamic Data ---

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

        {/* --- 3. UPDATE THE MAIN ELEMENT --- */}
        <motion.main
          animate={{
            // Only apply margin-left if we are on a desktop screen
            marginLeft: isDesktop ? (isShrunk ? "88px" : "240px") : "0px",
          }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          // Removed the `md:ml-0` class as it's no longer needed
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          {/* Mobile-only header (fixed) */}
          <motion.header
            variants={itemVariants}
            className="flex md:hidden justify-between items-center p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-950"
          >
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Overview
            </h1>
            <ThemeSwitcher />
          </motion.header>

          {/* Desktop-only header (fixed) */}
          <motion.header
            variants={itemVariants}
            className="hidden md:flex justify-between items-center p-8 pb-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Overview
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Week 45
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Emerald Mode
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                New Plan
              </motion.button>
              <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <Bell size={20} />
              </button>
            </div>
          </motion.header>

          {/* --- RESPONSIVE CONTENT AREA --- */}
          <div className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-y-hidden">
            {/* --- Main Column (Left + Mid) --- */}
            <div className="lg:col-span-2 space-y-8 lg:overflow-y-auto lg:pr-2">
              {/* --- 2x2 Stats Grid --- */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <SmallStat
                  label="Total Revenue"
                  value={`$${totalRevenue.toLocaleString()}`}
                  change={{ value: "Completed", isPositive: true }}
                />
                <SmallStat
                  label="Pending Orders"
                  value={pendingOrders.length}
                  sublabel="Awaiting approval"
                />
                <SmallStat
                  label="Upcoming Harvests"
                  value={upcomingHarvests.length}
                  sublabel="Next 14 days"
                />
                <SmallStat
                  label="Alerts"
                  value={alerts.length}
                  sublabel={`${
                    alerts.filter((a) => a.type === "risk").length
                  } urgent`}
                />
              </motion.div>

              {/* --- Pending Orders Section --- */}
              <motion.section
                id="orders"
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <AnimatePresence>
                        {pendingOrders.map((order) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            layout
                            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <td className="py-4 pr-3">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-yellow-500 mr-3 shrink-0" />
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {order.item}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                              {order.quantity} kg
                            </td>
                            <td className="py-4 px-3 text-green-600 dark:text-green-400 font-medium">
                              $
                              {(order.currentPrice * order.quantity).toFixed(2)}
                            </td>
                            <td className="py-4 pl-3 text-right flex gap-2 justify-end">
                              <button
                                onClick={() => cancelOrder(order.id)}
                                className="p-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                                aria-label="Cancel order"
                              >
                                <XIcon size={16} />
                              </button>
                              <button
                                onClick={() => approveOrder(order.id)}
                                className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5"
                              >
                                <Check size={16} />
                                Approve
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {pendingOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-gray-500"
                          >
                            No pending orders.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.section>

              {/* --- Crop Inventory (Harvests) --- */}
              <motion.section
                id="manage"
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Crop Inventory
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg text-sm bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                      View All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <AnimatePresence>
                        {crops.map((c) => (
                          <motion.tr
                            key={c.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              x: -20,
                              transition: { duration: 0.2 },
                            }}
                            layout
                            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <td className="py-4 pr-3">
                              <div className="flex items-center">
                                <StatusDot status={c.status} />
                                <div>
                                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                                    {c.name}
                                  </span>
                                  <span className="text-gray-500 ml-2 text-xs">
                                    Field {c.id.slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                              {c.status !== "sold" ? `${c.quantityKg} kg` : "-"}
                            </td>
                            <td className="py-4 px-3 text-gray-600 dark:text-gray-300">
                              <FormattedDate dateString={c.harvestDate} />
                            </td>
                            <td className="py-4 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  c.status === "ready"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : c.status === "growing"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {c.status === "ready"
                                  ? "Ready"
                                  : c.status === "growing"
                                  ? "Growing"
                                  : "Sold"}
                              </span>
                            </td>
                            <td className="py-4 pl-3 text-right">
                              <button
                                onClick={() => deleteCrop(c.id)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                aria-label="Delete crop"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.section>

              {/* --- Demand Forecasts --- */}
              <motion.section
                id="analytics"
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Demand Forecasts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      All Crops (Drag to Zoom)
                    </h4>
                    <div className="w-full h-72 mt-2">
                      <ResponsiveContainer>
                        <BarChart data={sampleData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-gray-200 dark:stroke-gray-700"
                          />
                          <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                          <YAxis tick={{ fill: "#6b7280" }} />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(4px)",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="kg"
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                          />
                          <Brush
                            dataKey="name"
                            height={30}
                            stroke="#22c55e"
                            fill="rgba(34, 197, 94, 0.1)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      By Status (Mock)
                    </h4>
                    <div className="w-full h-72 mt-2">
                      <ResponsiveContainer>
                        <BarChart
                          data={[
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
                          ]}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-gray-200 dark:stroke-gray-700"
                          />
                          <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                          <YAxis tick={{ fill: "#6b7280" }} />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(4px)",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="kg"
                            fill="#f97316"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* --- Right Column (Alerts, Performance, Shipments) --- */}
            <div className="lg:col-span-1 space-y-8 lg:overflow-y-auto lg:pr-2">
              {/* --- DYNAMIC Alerts Card --- */}
              <motion.section
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Alerts & Notifications
                  </h3>
                  <button className="text-sm text-gray-500 hover:text-gray-900">
                    Manage
                  </button>
                </div>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        alert.type === "risk"
                          ? "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
                          : ""
                      }`}
                    >
                      {alert.type === "risk" && (
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-1" />
                      )}
                      {alert.type === "reminder" && (
                        <Bell className="text-gray-500 shrink-0 mt-1" />
                      )}
                      {alert.type === "advisory" && (
                        <Droplet className="text-blue-500 shrink-0 mt-1" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            alert.type === "risk"
                              ? "text-yellow-800 dark:text-yellow-200"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.message}{" "}
                          {"eta" in alert && alert.eta && (
                            <FormattedTime dateString={alert.eta} />
                          )}
                        </p>
                        {alert.type === "risk" && !alert.id.startsWith("s") && (
                          <button className="mt-2 px-3 py-1 rounded-lg text-sm bg-yellow-600 text-white hover:bg-yellow-700">
                            Adjust Plan
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* --- Live Shipments Card --- */}
              <motion.section
                id="shipments"
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Shipments
                  </h3>
                  <button className="text-sm text-gray-500 hover:text-gray-900">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {shipments.map((shipment) => {
                    const isDelayed = shipment.status === "delayed";
                    const isHot = shipment.temperatureC > 6;
                    return (
                      <div
                        key={shipment.id}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          isDelayed || isHot
                            ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        {isDelayed || isHot ? (
                          <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-1" />
                        ) : (
                          <Ship className="text-blue-500 shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isDelayed || isHot
                                ? "text-red-800 dark:text-red-200"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {shipment.destination}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Shipment {shipment.id}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Thermometer
                              size={14}
                              className={
                                isHot ? "text-red-500" : "text-gray-500"
                              }
                            />
                            <span
                              className={`text-sm ${
                                isHot
                                  ? "text-red-500 font-medium"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {shipment.temperatureC}°C
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            isDelayed
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* --- DYNAMIC Performance Card --- */}
              <motion.section
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Metrics
                  </h3>
                  <button className="text-sm text-gray-500 hover:text-gray-900">
                    This Month
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Waste Reduction
                      </p>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                        {performanceMetrics.wasteReduction > 0 ? "+" : ""}
                        {performanceMetrics.wasteReduction}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Target 20% / Achieved {performanceMetrics.wasteReduction}%
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Revenue Uplift
                      </p>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        On Track
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      +{performanceMetrics.revenueUplift}% vs AI estimate
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Fulfillment Rate
                      </p>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                        Stable
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {performanceMetrics.fulfillmentRate}% orders met
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* --- Fields Map Card (Static) --- */}
              <motion.section
                variants={itemVariants}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Fields Map
                  </h3>
                  <button className="text-sm text-green-600 hover:text-green-800">
                    Plan Route
                  </button>
                </div>
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">[Map Placeholder]</p>
                </div>
              </motion.section>
            </div>
          </div>
        </motion.main>
      </div>

      {/* --- ADD NEW PLAN MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Harvest Plan"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Crop Name
            </label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="e.g., Tomatoes"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity (kg)
            </label>
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="0"
              value={form.quantityKg}
              onChange={(e) =>
                setForm((s) => ({ ...s, quantityKg: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Price / kg ($)
            </label>
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="0"
              value={form.pricePerKg}
              onChange={(e) =>
                setForm((s) => ({ ...s, pricePerKg: Number(e.target.value) }))
              }
            />
          </div>
          <motion.button
            onClick={addCrop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-green-600 text-white shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Harvest
          </motion.button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
