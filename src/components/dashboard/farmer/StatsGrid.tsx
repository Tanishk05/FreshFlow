import React from "react";
import EnhancedStatCard from "../shared/EnhancedStatCard";

type Props = {
  totalRevenue: number;
  pendingOrdersCount: number;
  upcomingHarvestsCount: number;
};

export default function StatsGrid({
  totalRevenue,
  pendingOrdersCount,
  upcomingHarvestsCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <EnhancedStatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon="💰"
        color="green"
        trend={{ value: 5, isPositive: true }}
        subtitle="This month"
        delay={0}
      />
      <EnhancedStatCard
        title="Pending Orders"
        value={pendingOrdersCount}
        icon="📦"
        color="blue"
        subtitle="Active orders"
        delay={0.1}
      />
      <EnhancedStatCard
        title="Upcoming Harvests"
        value={upcomingHarvestsCount}
        icon="🌾"
        color="orange"
        trend={
          upcomingHarvestsCount > 0
            ? { value: 10, isPositive: true }
            : undefined
        }
        subtitle="Next 30 days"
        delay={0.2}
      />
    </div>
  );
}
