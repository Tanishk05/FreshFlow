"use client";
import React from "react";
import { motion } from "framer-motion";
import { Map, MapPin, Navigation, Locate } from "lucide-react";
import ModernCard from "@/components/dashboard/shared/ModernCard";
import ActionButton from "@/components/dashboard/shared/ActionButton";

export default function MapCard() {
  return (
    <ModernCard
      title="Fields Map"
      icon={<Map className="w-5 h-5" />}
      gradient="green"
      glassEffect
    >
      {/* Map Placeholder with Enhanced Visual */}
      <div className="relative w-full h-64 bg-linear-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg overflow-hidden border border-green-200 dark:border-green-800/50">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Field Markers */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-2 bg-green-400 rounded-full blur-md opacity-50"
            />
            <div className="relative p-2 bg-green-500 rounded-full shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white shadow-md">
              Field A
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute -inset-2 bg-emerald-400 rounded-full blur-md opacity-50"
            />
            <div className="relative p-2 bg-emerald-500 rounded-full shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white shadow-md">
              Field B
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="absolute -inset-2 bg-green-400 rounded-full blur-md opacity-50"
            />
            <div className="relative p-2 bg-green-600 rounded-full shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white shadow-md">
              Field C
            </span>
          </div>
        </motion.div>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Map className="w-12 h-12 text-green-600/30 dark:text-green-400/30 mx-auto mb-2" />
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Interactive Map View
            </p>
          </div>
        </div>
      </div>

      {/* Field Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            3
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Active Fields
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            12.5
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total Acres
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            85%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Utilization
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <ActionButton
          variant="success"
          size="sm"
          icon={<Navigation className="w-4 h-4" />}
          fullWidth
          onClick={() => {
            console.log("Plan route");
          }}
        >
          Plan Route
        </ActionButton>
        <ActionButton
          variant="outline"
          size="sm"
          icon={<Locate className="w-4 h-4" />}
          onClick={() => {
            console.log("View on map");
          }}
        >
          Locate
        </ActionButton>
      </div>
    </ModernCard>
  );
}
