"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Package,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  getMyProduce,
  addProduce,
  updateProduce,
  deleteProduce,
  toggleProduceVisibility,
  toggleProduceAvailability,
} from "@/actions/produceActions";

type Produce = {
  _id: string;
  name: string;
  category: "vegetable" | "fruit" | "grain" | "herb";
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  image: string;
  isVisible: boolean;
  isAvailable: boolean;
  harvestDate: string;
  shelfLifeDays: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export default function MyProducePage() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") || "farmer";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduce, setEditingProduce] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "vegetable" as Produce["category"],
    quantity: 0,
    unit: "kg" as Produce["unit"],
    pricePerUnit: 0,
    image: "🌾",
    harvestDate: new Date().toISOString().split("T")[0],
    shelfLifeDays: 7,
  });

  // Fetch produce on mount
  useEffect(() => {
    const fetchProduce = async () => {
      setLoading(true);
      setError(null);
      const result = await getMyProduce();
      if (result.success && result.data) {
        setProduceList(result.data as Produce[]);
      } else {
        setError(result.error || "Failed to load produce");
      }
      setLoading(false);
    };

    if (session?.user) {
      fetchProduce();
    }
  }, [session]);

  const filteredProduce = produceList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: produceList.length,
    available: produceList.filter((p) => p.isAvailable).length,
    totalValue: produceList.reduce(
      (sum, p) => sum + p.quantity * p.pricePerUnit,
      0
    ),
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "vegetable",
      quantity: 0,
      unit: "kg",
      pricePerUnit: 0,
      image: "🌾",
      harvestDate: new Date().toISOString().split("T")[0],
      shelfLifeDays: 7,
    });
  };

  const handleAddProduce = async () => {
    if (!formData.name || formData.quantity <= 0 || formData.pricePerUnit <= 0)
      return;

    const result = await addProduce(formData);
    if (result.success && result.data) {
      setProduceList([...produceList, result.data as Produce]);
      resetForm();
      setShowAddModal(false);
    } else {
      alert(result.error || "Failed to add produce");
    }
  };

  const handleUpdateProduce = async () => {
    if (!editingProduce) return;

    const result = await updateProduce(editingProduce._id, formData);
    if (result.success) {
      setProduceList(
        produceList.map((p) =>
          p._id === editingProduce._id
            ? {
                ...editingProduce,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      setEditingProduce(null);
      resetForm();
      setShowAddModal(false);
    } else {
      alert(result.error || "Failed to update produce");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this produce?")) return;

    const result = await deleteProduce(id);
    if (result.success) {
      setProduceList(produceList.filter((p) => p._id !== id));
    } else {
      alert(result.error || "Failed to delete produce");
    }
  };

  const toggleVisibility = async (id: string) => {
    const result = await toggleProduceVisibility(id);
    if (result.success) {
      setProduceList(
        produceList.map((p) =>
          p._id === id
            ? { ...p, isVisible: result.isVisible ?? !p.isVisible }
            : p
        )
      );
    } else {
      alert(result.error || "Failed to toggle visibility");
    }
  };

  const toggleAvailability = async (id: string) => {
    const result = await toggleProduceAvailability(id);
    if (result.success) {
      setProduceList(
        produceList.map((p) =>
          p._id === id
            ? { ...p, isAvailable: result.isAvailable ?? !p.isAvailable }
            : p
        )
      );
    } else {
      alert(result.error || "Failed to toggle availability");
    }
  };

  const openEditModal = (produce: Produce) => {
    setEditingProduce(produce);
    setFormData({
      name: produce.name,
      category: produce.category,
      quantity: produce.quantity,
      unit: produce.unit,
      pricePerUnit: produce.pricePerUnit,
      image: produce.image,
      harvestDate: produce.harvestDate,
      shelfLifeDays: produce.shelfLifeDays,
    });
    setShowAddModal(true);
  };

  const calculateFreshness = (harvestDate: string, shelfLifeDays: number) => {
    const harvest = new Date(harvestDate);
    const today = new Date();
    const daysSinceHarvest = Math.floor(
      (today.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = shelfLifeDays - daysSinceHarvest;
    const freshnessPercentage = (remainingDays / shelfLifeDays) * 100;

    let status: "fresh" | "aging" | "expired";
    let color: string;

    if (freshnessPercentage > 50) {
      status = "fresh";
      color = "bg-green-500";
    } else if (freshnessPercentage > 0) {
      status = "aging";
      color = "bg-yellow-500";
    } else {
      status = "expired";
      color = "bg-red-500";
    }

    return {
      daysSinceHarvest,
      remainingDays,
      status,
      color,
      freshnessPercentage: Math.max(0, Math.min(100, freshnessPercentage)),
    };
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
            onNewPlanClick={() => setShowAddModal(true)}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            title="My Produce"
            newButtonText="Add Produce"
            showExport={false}
            showAlerts={false}
            hideMobileMenuButton
          />

          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 custom-scrollbar">
            <div className="p-6 md:p-8 pb-20 md:pb-8">
              {/* Header with Stats */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-medium border border-blue-200/50 dark:border-blue-800/50 mb-4">
                  <Package size={14} /> Inventory Management
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-gray-200/60 dark:border-slate-700/60 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Total Items
                        </p>
                        <p className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mt-1">
                          {stats.total}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                        <Package
                          className="text-blue-600 dark:text-blue-400"
                          size={24}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-gray-200/60 dark:border-slate-700/60 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Available
                        </p>
                        <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          {stats.available}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                        <TrendingUp
                          className="text-emerald-600 dark:text-emerald-400"
                          size={24}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-gray-200/60 dark:border-slate-700/60 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Value
                        </p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          ₹{stats.totalValue.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <DollarSign
                          className="text-emerald-600 dark:text-emerald-400"
                          size={24}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search produce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && produceList.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No produce yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start by adding your first produce item
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Produce
                  </motion.button>
                </div>
              )}

              {/* Produce Grid */}
              {!loading && !error && filteredProduce.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredProduce.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                      >
                        {/* Card Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{item.image}</div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {item.name}
                                </h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 capitalize">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity & Price */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Quantity:
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Price:
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                ₹{item.pricePerUnit}/{item.unit}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-gray-700 dark:text-gray-300">
                                  Total Value:
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  ₹
                                  {(item.quantity * item.pricePerUnit).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Freshness Indicator */}
                          {(() => {
                            const freshness = calculateFreshness(
                              item.harvestDate,
                              item.shelfLifeDays
                            );
                            return (
                              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Freshness
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                                      freshness.status === "fresh"
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : freshness.status === "aging"
                                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    }`}
                                  >
                                    {freshness.status}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${freshness.color}`}
                                    style={{
                                      width: `${freshness.freshnessPercentage}%`,
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Harvested:
                                    </span>
                                    <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                      {freshness.daysSinceHarvest}d ago
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Fresh for:
                                    </span>
                                    <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                      {Math.max(0, freshness.remainingDays)}d
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Status Badges */}
                          <div className="flex gap-2 mb-4">
                            <button
                              onClick={() => toggleVisibility(item._id)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                item.isVisible
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                              }`}
                            >
                              {item.isVisible ? (
                                <Eye size={14} />
                              ) : (
                                <EyeOff size={14} />
                              )}
                              {item.isVisible ? "Visible" : "Hidden"}
                            </button>

                            <button
                              onClick={() => toggleAvailability(item._id)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                item.isAvailable
                                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.isAvailable
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {item.isAvailable ? "In Stock" : "Out of Stock"}
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditModal(item)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Edit2 size={16} />
                              <span className="text-sm font-medium">Edit</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(item._id)}
                              className="flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
      <MobileBottomNav role={role} />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              setEditingProduce(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingProduce ? "Edit Produce" : "Add New Produce"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Produce Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Organic Tomatoes"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Produce["category"],
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  >
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                    <option value="grain">Grain</option>
                    <option value="herb">Herb</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Number(e.target.value),
                        })
                      }
                      placeholder="100"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value as Produce["unit"],
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="tons">tons</option>
                      <option value="bags">bags</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerUnit: Number(e.target.value),
                      })
                    }
                    placeholder="2.50"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="🍅"
                    maxLength={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl text-center focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harvestDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shelf Life (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.shelfLifeDays || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shelfLifeDays: Number(e.target.value),
                        })
                      }
                      placeholder="7"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduce(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={
                    editingProduce ? handleUpdateProduce : handleAddProduce
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                >
                  {editingProduce ? "Update" : "Add"} Produce
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
