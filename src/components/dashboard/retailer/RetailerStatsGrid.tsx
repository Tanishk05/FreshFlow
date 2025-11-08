"use client";
import React from "react";
import { motion } from "framer-motion";
import SmallStat from "@/components/dashboard/SmallStat"; // Assuming this exists
import { PackageX, Truck, TrendingDown } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  expiringSoonCount: number;
  lowStockCount: number;
  incomingDeliveriesCount: number;
};

export default function RetailerStatsGrid({
  expiringSoonCount,
  lowStockCount,
  incomingDeliveriesCount,
}: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <SmallStat
        label="Expiring Soon"
        value={expiringSoonCount}
        sublabel="Items < 2 days"
        icon={<PackageX className="text-red-500" />}
      />
      <SmallStat
        label="Low Stock"
        value={lowStockCount}
        sublabel="Needs reorder"
        icon={<TrendingDown className="text-yellow-500" />}
      />
      <SmallStat
        label="Incoming"
        value={incomingDeliveriesCount}
        sublabel="Deliveries today"
        icon={<Truck className="text-blue-500" />}
      />
    </motion.div>
  );
}
