"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FleetSerialized } from "@/models/Fleet";
import {
  Thermometer,
  Truck,
  Plus,
  X,
  MapPin,
  Phone,
  User,
  Package,
} from "lucide-react";
import { addTruck } from "@/actions/fleetActions";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import ActionButton from "@/components/dashboard/shared/ActionButton";

type Props = {
  fleet: FleetSerialized[];
};

const StatusChip = ({ status }: { status: FleetSerialized["status"] }) => {
  const statusConfig = {
    "on-route": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      label: "On Route",
    },
    maintenance: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      label: "Maintenance",
    },
    offline: {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-700 dark:text-gray-300",
      label: "Offline",
    },
    available: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      label: "Available",
    },
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default function FleetManagement({ fleet }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    truckNumber: "",
    driver: "",
    driverContact: "",
    capacity: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTruck({
        truckNumber: formData.truckNumber,
        driver: formData.driver,
        driverContact: formData.driverContact,
        capacityKg: Number(formData.capacity),
      });
      // Reset form and close
      setFormData({
        truckNumber: "",
        driver: "",
        driverContact: "",
        capacity: "",
      });
      setShowAddForm(false);
      // Refresh the page to show new truck
      window.location.reload();
    } catch (error) {
      console.error("Error adding truck:", error);
      alert("Failed to add truck. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.truckNumber.trim() &&
    formData.driver.trim() &&
    formData.driverContact.trim() &&
    Number(formData.capacity) > 0;

  return (
    <ModernCard
      title="Fleet Management"
      icon={<Truck className="w-5 h-5" />}
      gradient="blue"
      glassEffect={false}
    >
      {/* Add Truck Button */}
      <div className="mb-4">
        <ActionButton
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
          icon={
            showAddForm ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
          onClick={() => setShowAddForm(!showAddForm)}
          fullWidth
        >
          {showAddForm ? "Cancel" : "Add New Truck"}
        </ActionButton>
      </div>

      {/* Add Truck Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Truck className="w-4 h-4" />
                    Truck Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.truckNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, truckNumber: e.target.value })
                    }
                    placeholder="e.g., TN-01-AB-1234"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driver}
                    onChange={(e) =>
                      setFormData({ ...formData, driver: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Driver Contact *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.driverContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driverContact: e.target.value,
                      })
                    }
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Package className="w-4 h-4" />
                    Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <ActionButton
                  type="submit"
                  variant="success"
                  disabled={isSubmitting || !isFormValid}
                  icon={<Plus className="w-4 h-4" />}
                >
                  {isSubmitting ? "Adding..." : "Add Truck"}
                </ActionButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fleet List */}
      {fleet.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-12 h-12" />}
          title="No Trucks in Fleet"
          description="Add your first truck to start managing your fleet operations."
          action={{
            label: "Add First Truck",
            onClick: () => setShowAddForm(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {fleet.map((truck, idx) => {
            const isHot = (truck.temperatureC ?? 0) > 4;

            return (
              <motion.div
                key={truck._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isHot
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Truck Icon */}
                  <div
                    className={`p-2 rounded-lg ${
                      truck.status === "on-route"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : truck.status === "maintenance"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <Truck
                      className={`w-5 h-5 ${
                        truck.status === "on-route"
                          ? "text-blue-600 dark:text-blue-400"
                          : truck.status === "maintenance"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {truck.truckNumber}
                        </h4>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <User className="w-4 h-4" />
                          <span>{truck.driver}</span>
                        </div>
                      </div>
                      <StatusChip status={truck.status} />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {truck.status === "on-route" && truck.destination && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            To: {truck.destination}
                          </span>
                        </div>
                      )}

                      {truck.temperatureC !== undefined && (
                        <div className="flex items-center gap-2">
                          <Thermometer
                            className={`w-4 h-4 ${
                              isHot
                                ? "text-red-600 dark:text-red-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isHot
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {truck.temperatureC.toFixed(1)}°C
                            {isHot && " ⚠️"}
                          </span>
                        </div>
                      )}
                    </div>

                    {truck.status === "maintenance" && (
                      <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900/20 text-xs text-yellow-800 dark:text-yellow-300">
                        Under maintenance - unavailable for routes
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Fleet Summary */}
      {fleet.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 grid grid-cols-3 gap-2"
        >
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {fleet.filter((t) => t.status === "available").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Available
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {fleet.filter((t) => t.status === "on-route").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              On Route
            </div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {fleet.filter((t) => t.status === "maintenance").length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Maintenance
            </div>
          </div>
        </motion.div>
      )}
    </ModernCard>
  );
}
