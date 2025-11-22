"use client";
import React from "react";
import EnhancedStatCard from "../shared/EnhancedStatCard";

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <EnhancedStatCard
        title="Pending Orders"
        value={pendingOrdersCount}
        icon="📦"
        color="orange"
        subtitle="To be routed"
        delay={0}
      />
      <EnhancedStatCard
        title="Trucks on Road"
        value={trucksOnRoadCount}
        icon="🚚"
        color="blue"
        trend={{ value: 8, isPositive: true }}
        subtitle="Live tracking"
        delay={0.1}
      />
      <EnhancedStatCard
        title="Warehouse"
        value={`${warehouseCapacity}%`}
        icon="🏭"
        color="green"
        trend={{ value: 5, isPositive: false }}
        subtitle="Capacity"
        delay={0.2}
      />
    </div>
  );
}
