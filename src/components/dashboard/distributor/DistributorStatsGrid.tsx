"use client";
import React from "react";
import { motion } from "framer-motion";
import SmallStat from "@/components/dashboard/SmallStat"; // Assuming this exists
import { Package, Truck, Warehouse } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  pendingOrdersCount: number;
  trucksOnRoadCount: number;
  warehouseCapacity: number;
};

export default function DistributorStatsGrid({
  pendingOrdersCount,
  trucksOnRoadCount,
  warehouseCapacity,
}: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <SmallStat
        label="Pending Orders"
        value={pendingOrdersCount}
        sublabel="To be routed"
        icon={<Package className="text-yellow-500" />}
      />
      <SmallStat
        label="Trucks on Road"
        value={trucksOnRoadCount}
        sublabel="Live tracking"
        icon={<Truck className="text-blue-500" />}
      />
      <SmallStat
        label="Warehouse"
        value={`${warehouseCapacity}%`}
        sublabel="Capacity full"
        icon={<Warehouse className="text-green-500" />}
      />
    </motion.div>
  );
}
