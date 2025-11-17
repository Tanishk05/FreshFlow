# 🎯 Quick Integration Guide: Adding AI to Dashboards

This guide shows you how to quickly add the AI components to your existing dashboards.

## 🚀 Step-by-Step Integration

### 1. Farmer Dashboard Integration

**File:** `src/app/dashboard/farmer/page.tsx`

```tsx
// Add these imports at the top
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

// Inside your component, add these components:
export default function FarmerDashboard() {
  return (
    <DashboardLayout>
      {/* Existing components */}
      <StatsGrid stats={stats} />
      <CropInventory crops={crops} />

      {/* 🤖 ADD AI FEATURES HERE */}
      <AIInsightsCard
        role="farmer"
        dashboardData={{
          stats: {
            totalCrops: crops.length,
            totalRevenue: stats.totalRevenue,
            activeOrders: orders.length,
          },
          recentActivity: [
            "Harvested tomatoes",
            "Listed onions for sale",
            "Delivered to Store #123",
          ],
          inventory: crops,
          orders: orders,
          performance: {
            wastePercentage: 8,
            onTimeDelivery: 95,
          },
        }}
      />

      <MarketIntelligenceCard
        role="farmer"
        userProducts={["tomatoes", "onions", "spinach", "potatoes"]}
      />
    </DashboardLayout>
  );
}
```

---

### 2. Distributor Dashboard Integration

**File:** `src/app/dashboard/distributor/page.tsx`

```tsx
// Add these imports at the top
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

// Inside your component:
export default function DistributorDashboard() {
  return (
    <DashboardLayout>
      {/* Existing components */}
      <DistributorStatsGrid stats={stats} />
      <FleetManagement fleet={fleet} />
      <WarehouseInventory inventory={inventory} />

      {/* 🤖 ADD AI FEATURES HERE */}
      <AIInsightsCard
        role="distributor"
        dashboardData={{
          stats: {
            totalTrucks: fleet.length,
            activeDeliveries: orders.filter((o) => o.status === "in-transit")
              .length,
            totalRevenue: stats.revenue,
          },
          recentActivity: [
            "Completed delivery to Store #45",
            "Optimized route for Order #1234",
            "Scheduled truck maintenance",
          ],
          inventory: inventory,
          orders: orders,
          performance: {
            onTimeDeliveryRate: 98,
            fuelEfficiency: 12.5,
            averageDeliveryTime: 4.2,
          },
        }}
      />

      <MarketIntelligenceCard
        role="distributor"
        userProducts={[]} // Distributors handle all products
      />
    </DashboardLayout>
  );
}
```

---

### 3. Retailer Dashboard Integration (Already Has AI Pricing!)

**File:** `src/app/dashboard/retailer/page.tsx`

```tsx
// Add these imports at the top
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

// Inside your component:
export default function RetailerDashboard() {
  return (
    <DashboardLayout>
      {/* Existing components */}
      <RetailerStatsGrid stats={stats} />
      <StoreInventory inventory={inventory} />

      {/* ✅ ALREADY INTEGRATED: Dynamic Pricing */}
      <DynamicPricingSuggestions
        suggestions={pricingSuggestions}
        onApply={handleApplyPricing}
      />

      {/* 🤖 ADD THESE AI FEATURES */}
      <AIInsightsCard
        role="retailer"
        dashboardData={{
          stats: {
            inventoryCount: inventory.length,
            lowStockCount: inventoryStats.lowStockCount,
            totalSales: stats.totalSales,
          },
          recentActivity: [
            "Applied dynamic pricing on 4 items",
            "Restocked tomatoes and onions",
            "Completed 12 customer orders",
          ],
          inventory: inventory,
          orders: myOrders,
          performance: {
            wastePercentage: 6,
            salesGrowth: 24,
            customerSatisfaction: 92,
          },
        }}
      />

      <MarketIntelligenceCard
        role="retailer"
        userProducts={inventory.map((item) => item.name)}
      />
    </DashboardLayout>
  );
}
```

---

## 🎨 Layout Suggestions

### Option A: Full Width (Recommended)

```tsx
<div className="space-y-6">
  <StatsGrid />

  {/* AI Section */}
  <div className="grid grid-cols-1 gap-6">
    <AIInsightsCard role={role} dashboardData={data} />
    <MarketIntelligenceCard role={role} userProducts={products} />
  </div>

  <OtherComponents />
</div>
```

### Option B: Two Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left Column */}
  <div className="space-y-6">
    <StatsGrid />
    <AIInsightsCard role={role} dashboardData={data} />
  </div>

  {/* Right Column */}
  <div className="space-y-6">
    <MarketIntelligenceCard role={role} userProducts={products} />
    <OtherComponents />
  </div>
</div>
```

### Option C: Tabs (For Mobile-Friendly)

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
    <TabsTrigger value="market">Market Intel</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <StatsGrid />
    <OtherComponents />
  </TabsContent>

  <TabsContent value="ai-insights">
    <AIInsightsCard role={role} dashboardData={data} />
  </TabsContent>

  <TabsContent value="market">
    <MarketIntelligenceCard role={role} userProducts={products} />
  </TabsContent>
</Tabs>
```

---

## 🔧 Customization Options

### 1. Customize Dashboard Data

```tsx
const dashboardData = {
  stats: {
    // Add any relevant metrics
    totalRevenue: 125000,
    activeUsers: 45,
    conversionRate: 23.5,
  },
  recentActivity: [
    // Last 5-10 activities
    "Action 1",
    "Action 2",
  ],
  inventory: yourInventoryArray,
  orders: yourOrdersArray,
  performance: {
    // Key performance indicators
    wastePercentage: 8,
    onTimeRate: 95,
  },
};
```

### 2. Filter Products for Market Intelligence

```tsx
// For Farmer: Show only their crops
<MarketIntelligenceCard
  role="farmer"
  userProducts={crops.map(c => c.name)}
/>

// For Retailer: Show inventory items
<MarketIntelligenceCard
  role="retailer"
  userProducts={inventory.slice(0, 5).map(i => i.name)}
/>

// For Distributor: Show all or empty array
<MarketIntelligenceCard
  role="distributor"
  userProducts={[]}
/>
```

### 3. Conditional Rendering

```tsx
// Only show if user has data
{
  crops.length > 0 && <AIInsightsCard role="farmer" dashboardData={data} />;
}

// Show loading state
{
  isLoading ? (
    <div>Loading AI insights...</div>
  ) : (
    <AIInsightsCard role="farmer" dashboardData={data} />
  );
}

// Show only if AI is configured
{
  isGeminiConfigured() && <AIInsightsCard role="farmer" dashboardData={data} />;
}
```

---

## 📊 Example: Complete Integration

**File:** `src/app/dashboard/farmer/page.tsx`

```tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Dashboard components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import StatsGrid from "@/components/dashboard/farmer/StatsGrid";
import CropInventory from "@/components/dashboard/farmer/CropInventory";

// 🤖 AI Components
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

export default function FarmerDashboard() {
  const { data: session } = useSession();
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});

  // Fetch data...
  useEffect(() => {
    // Your data fetching logic
  }, []);

  // Prepare AI dashboard data
  const aiDashboardData = {
    stats: {
      totalCrops: crops.length,
      totalRevenue: stats.totalRevenue || 0,
      activeOrders: orders.filter((o) => o.status === "pending").length,
    },
    recentActivity: [
      `Harvested ${crops.filter((c) => c.status === "ready").length} crops`,
      `${orders.length} active orders`,
      `Revenue: ₹${stats.totalRevenue || 0}`,
    ],
    inventory: crops,
    orders: orders,
    performance: {
      wastePercentage: stats.wastePercentage || 0,
      onTimeDelivery: stats.onTimeDelivery || 0,
    },
  };

  const userProducts = crops.slice(0, 5).map((c) => c.name);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Farmer Dashboard"
        subtitle={`Welcome back, ${session?.user?.name || "Farmer"}!`}
        showExport
        onExportClick={handleExport}
      />

      <div className="space-y-6">
        {/* Existing Dashboard Components */}
        <StatsGrid stats={stats} />
        <CropInventory crops={crops} onAddCrop={handleAddCrop} />

        {/* 🤖 AI-Powered Features */}
        <div className="grid grid-cols-1 gap-6">
          <AIInsightsCard role="farmer" dashboardData={aiDashboardData} />

          <MarketIntelligenceCard role="farmer" userProducts={userProducts} />
        </div>

        {/* More components... */}
      </div>
    </DashboardLayout>
  );
}
```

---

## ✅ Checklist

Before deploying, make sure:

- [ ] Gemini API key added to `.env.local`
- [ ] AI components imported correctly
- [ ] Dashboard data prepared with stats, activity, etc.
- [ ] User products list defined (for market intelligence)
- [ ] Layout looks good on desktop and mobile
- [ ] Tested with and without API key (fallback mode)
- [ ] No console errors
- [ ] Loading states work properly

---

## 🎉 You're Done!

Your dashboard now has:

- ✅ Personalized AI insights
- ✅ Market intelligence alerts
- ✅ Dynamic pricing (retailers)
- ✅ All with intelligent fallbacks

**Need help?** Check:

- [AI_FEATURES_README.md](./AI_FEATURES_README.md) - Detailed guide
- [AI_INTEGRATION_STRATEGY.md](./AI_INTEGRATION_STRATEGY.md) - Full strategy

🚀 **Happy coding!**
