"use client";
import React from "react";
import EnhancedStatCard from "../shared/EnhancedStatCard";

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <EnhancedStatCard
        title="Expiring Soon"
        value={expiringSoonCount}
        icon="⏰"
        color="red"
        subtitle="< 2 days"
        delay={0}
      />
      <EnhancedStatCard
        title="Low Stock"
        value={lowStockCount}
        icon="⚠️"
        color="orange"
        subtitle="Needs reorder"
        delay={0.1}
      />
      <EnhancedStatCard
        title="Incoming"
        value={incomingDeliveriesCount}
        icon="🚚"
        color="purple"
        trend={{ value: 12, isPositive: true }}
        subtitle="Deliveries today"
        delay={0.2}
      />
    </div>
  );
}
