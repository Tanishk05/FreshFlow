"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FleetSerialized } from "@/models/Fleet";
import { Thermometer, Truck, Plus, X } from "lucide-react";
import { addTruck } from "@/actions/fleetActions";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  fleet: FleetSerialized[];
};

const StatusChip = ({ status }: { status: FleetSerialized["status"] }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      status === "on-route"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : status === "maintenance"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : status === "offline"
        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
  </span>
);

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
        capacity: Number(formData.capacity),
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

  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fleet Management
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? (
            <>
              <X size={16} />
              Cancel
            </>
          ) : (
            <>
              <Plus size={16} />
              Add Truck
            </>
          )}
        </button>
      </div>

      {/* Add Truck Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Driver Contact *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.driverContact}
                  onChange={(e) =>
                    setFormData({ ...formData, driverContact: e.target.value })
                  }
                  placeholder="e.g., +91 98765 43210"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Truck"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Fleet List */}
      <div className="space-y-4">
        {fleet.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Truck size={48} className="mx-auto mb-3 opacity-50" />
            <p>No trucks in fleet.</p>
            <p className="text-sm mt-1">Add your first truck to get started!</p>
          </div>
        ) : (
          fleet.map((truck) => (
            <div
              key={truck._id}
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <Truck className="text-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {truck.truckNumber} - {truck.driver}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {truck.status === "on-route"
                    ? `To: ${truck.destination || "Unknown"}`
                    : truck.status === "maintenance"
                    ? "Under Maintenance"
                    : "At Warehouse"}
                </p>
              </div>
              {truck.temperatureC !== undefined && (
                <div className="flex items-center gap-2">
                  <Thermometer
                    size={14}
                    className={
                      truck.temperatureC > 4 ? "text-red-500" : "text-gray-500"
                    }
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {truck.temperatureC.toFixed(1)}°C
                  </span>
                </div>
              )}
              <StatusChip status={truck.status} />
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
