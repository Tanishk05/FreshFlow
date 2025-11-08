import React from "react";
import { motion } from "framer-motion";
import SmallStat from "@/components/dashboard/SmallStat";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  totalRevenue: number;
  pendingOrdersCount: number;
  upcomingHarvestsCount: number;
  alertsCount: number;
  urgentAlertsCount: number;
};

export default function StatsGrid({
  totalRevenue,
  pendingOrdersCount,
  upcomingHarvestsCount,
  alertsCount,
  urgentAlertsCount,
}: Props) {
  return (
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
        value={pendingOrdersCount}
        sublabel="Awaiting approval"
      />
      <SmallStat
        label="Upcoming Harvests"
        value={upcomingHarvestsCount}
        sublabel="Next 14 days"
      />
      <SmallStat
        label="Alerts"
        value={alertsCount}
        sublabel={`${urgentAlertsCount} urgent`}
      />
    </motion.div>
  );
}
