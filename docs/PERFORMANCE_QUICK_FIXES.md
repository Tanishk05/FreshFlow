# Performance Quick Fixes - Immediate Implementation

This guide provides copy-paste ready code for the highest-impact performance optimizations.

## 1. Parallelize Dashboard Data Fetching

### Fix: Farmer Dashboard

**File**: `src/app/dashboard/farmer/page.tsx`

Replace all individual `useEffect` hooks (lines 129-243) with:

```tsx
// Replace all separate useEffects with one parallel fetch
useEffect(() => {
  const fetchAllData = async () => {
    try {
      // Set all loading states
      setIsLoadingOrders(true);
      setIsLoadingShipments(true);
      setIsLoadingTrackedOrders(true);
      setIsLoadingPerformance(true);
      setIsLoadingAlerts(true);
      setProduceLoading(true);

      // Fetch all data in parallel
      const [
        produceResult,
        alertsData,
        ordersResult,
        shipmentsResult,
        trackedOrdersResult,
        performanceResult,
      ] = await Promise.all([
        getMyProduce(),
        getMyAlerts(),
        getOrdersByStatus("pending"),
        getMyShipments(),
        getMyOrders(),
        getFarmerPerformanceMetrics(),
      ]);

      // Update all states
      if (produceResult.success && produceResult.data) {
        setProduce(produceResult.data as Produce[]);
      }
      setAlerts(alertsData);
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data as OrderFromDB[]);
      }
      if (shipmentsResult.success && shipmentsResult.data) {
        setShipments(shipmentsResult.data as ShipmentFromDB[]);
      }
      if (trackedOrdersResult.success && trackedOrdersResult.data) {
        const allOrders = trackedOrdersResult.data as OrderFromDB[];
        const tracked = allOrders.filter(
          (o) =>
            o.status === "approved" ||
            o.status === "assigned" ||
            o.status === "picked-up" ||
            o.status === "in-transit" ||
            o.status === "delivered"
        );
        setTrackedOrders(tracked);
      }
      if (performanceResult.success && performanceResult.data) {
        setPerformanceMetrics(performanceResult.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      // Clear all loading states
      setIsLoadingOrders(false);
      setIsLoadingShipments(false);
      setIsLoadingTrackedOrders(false);
      setIsLoadingPerformance(false);
      setIsLoadingAlerts(false);
      setProduceLoading(false);
    }
  };

  fetchAllData();
}, []);
```

### Fix: Distributor Dashboard

**File**: `src/app/dashboard/distributor/page.tsx`

The distributor dashboard already uses `Promise.all()` (good!), but you can optimize it further by:

1. Removing the nested try-catch
2. Adding error handling per request
3. Setting loading states more granularly

## 2. Create Shared Google Maps Provider

### Step 1: Create Provider

**New File**: `src/providers/GoogleMapsProvider.tsx`

```tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";

const GOOGLE_MAPS_LIBRARIES: Libraries = ["places", "marker"];

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError?: Error;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  }
  return context;
}
```

### Step 2: Add Provider to Root Layout

**File**: `src/app/layout.tsx`

```tsx
import { GoogleMapsProvider } from "@/providers/GoogleMapsProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthProvider>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 3: Update Components to Use Provider

**File**: `src/components/ui/GoogleLocationPicker.tsx`

```tsx
"use client";
import React from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "@/providers/GoogleMapsProvider";

// ... existing interfaces ...

export default function GoogleLocationPicker({
  lat,
  lng,
  onChange,
}: GoogleLocationPickerProps) {
  const { isLoaded } = useGoogleMaps(); // Use shared provider
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const markerRef =
    React.useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // ... rest of component stays the same ...

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  // ... rest of component ...
}
```

**File**: `src/app/profile/page.tsx`

Replace the `useJsApiLoader` call with:

```tsx
import { useGoogleMaps } from "@/providers/GoogleMapsProvider";

function ProfileContent() {
  const { isLoaded } = useGoogleMaps(); // Replace useJsApiLoader
  // ... rest of component
}
```

**File**: `src/app/complete-signup/page.tsx`

Same replacement:

```tsx
import { useGoogleMaps } from "@/providers/GoogleMapsProvider";

// Replace useJsApiLoader with useGoogleMaps()
const { isLoaded } = useGoogleMaps();
```

## 3. Lazy Load HeroScene (3D Background)

**File**: `src/app/page.tsx`

Replace the HeroScene section with:

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load HeroScene - don't load on mobile, delay on desktop
const HeroScene = dynamic(() => import("@/components/scene/HeroScene"), {
  ssr: false,
  loading: () => null, // No loading indicator needed
});

export default function Home() {
  const [showScene, setShowScene] = useState(false);
  const isMounted = useState(false)[0]; // Your existing mounted check

  useEffect(() => {
    // Only load 3D scene on desktop after a delay
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      // Delay loading by 1 second to prioritize content
      const timer = setTimeout(() => {
        setShowScene(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // ... rest of component ...

  return (
    <>
      {/* ... existing code ... */}

      <div className="text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Only render HeroScene if showScene is true */}
        {showScene && <HeroScene />}
        <Modal isOpen={modalOpen} onClose={closeModal} type={modalType} />

        {/* ... rest of JSX ... */}
      </div>
    </>
  );
}
```

## 4. Optimize Socket.io Connection

**File**: `src/lib/socket.ts`

Replace with lazy loading version:

```tsx
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

export async function getSocket(): Promise<Socket> {
  // Return existing connected socket
  if (socket?.connected) {
    return socket;
  }

  // If connection is in progress, return that promise
  if (connectPromise) {
    return connectPromise;
  }

  // Create new connection
  connectPromise = new Promise((resolve, reject) => {
    socket = io({
      path: "/api/socket",
      autoConnect: false, // Don't auto-connect
      transports: ["websocket"],
    });

    socket.once("connect", () => {
      resolve(socket!);
    });

    socket.once("connect_error", (error) => {
      connectPromise = null;
      reject(error);
    });

    // Start connection
    socket.connect();
  });

  return connectPromise;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectPromise = null;
  }
}

// Helper to check if socket is available (for conditional loading)
export function isSocketAvailable(): boolean {
  return socket?.connected ?? false;
}
```

**Update Components Using Socket:**

**File**: `src/components/dashboard/farmer/ShipmentsCard.tsx`

```tsx
useEffect(() => {
  // Only connect socket when component mounts and needs real-time updates
  let isMounted = true;

  const initSocket = async () => {
    try {
      const socket = await getSocket(); // Now async
      if (!isMounted) return;

      socket.on(
        "farmer-shipment-update",
        (update: { type: string; shipment: ShipmentFromDB }) => {
          if (!isMounted) return;
          setLiveShipments((prev) => {
            // ... existing update logic ...
          });
        }
      );
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  };

  initSocket();

  return () => {
    isMounted = false;
    // Note: Don't disconnect socket here - it might be used by other components
    // Only remove event listeners
    if (socket) {
      socket.off("farmer-shipment-update");
    }
  };
}, []);
```

## 5. Add Database Query Caching

**File**: `src/actions/orderActions.ts`

Add caching to frequently called functions:

```tsx
import { unstable_cache } from "next/cache";

export async function getMyOrders() {
  try {
    const { userId } = await requireAuth();

    // Cache with 60 second revalidation
    return await unstable_cache(
      async () => {
        const orders = await orderRepository.findByFarmerId(userId);
        return {
          success: true,
          data: orders.map((o) => serializeDocument(o)),
        };
      },
      [`my-orders-${userId}`],
      {
        revalidate: 60, // Cache for 60 seconds
        tags: [`orders-${userId}`],
      }
    )();
  } catch (error) {
    // ... existing error handling ...
  }
}
```

For functions that need invalidation after mutations:

```tsx
import { revalidateTag } from "next/cache";

export async function approveOrder(orderId: string) {
  // ... existing approve logic ...

  // Invalidate cache after mutation
  const { userId } = await requireAuth();
  revalidateTag(`orders-${userId}`);

  // ... rest of function ...
}
```

## 6. Add Bundle Analyzer

### Step 1: Install

```bash
npm install --save-dev @next/bundle-analyzer
```

### Step 2: Update next.config.ts

**File**: `next.config.ts`

```tsx
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ... your existing config ...
};

export default withBundleAnalyzer(nextConfig);
```

### Step 3: Add Script

**File**: `package.json`

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "BUNDLE_ANALYZE=server next build",
    "analyze:browser": "BUNDLE_ANALYZE=browser next build"
  }
}
```

### Step 4: Run Analysis

```bash
npm run analyze
```

## 7. Optimize Image Loading

Ensure all images use Next.js Image with proper attributes:

**Example Pattern:**

```tsx
import Image from "next/image";

<Image
  src={imageUrl}
  alt={altText}
  width={800} // Always specify width
  height={600} // Always specify height
  priority={false} // Only true for above-fold images
  loading="lazy" // Default, but explicit
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>;
```

**For Above-Fold Images:**

```tsx
<Image
  src={heroImage}
  alt="Hero"
  width={1920}
  height={1080}
  priority={true} // Load immediately
  sizes="100vw"
/>
```

## Testing Your Changes

After implementing these fixes:

1. **Measure Before/After:**

   ```bash
   # Build and check bundle size
   npm run build

   # Check build output for bundle sizes
   ```

2. **Test in Browser:**

   - Open DevTools → Network tab
   - Check "Disable cache"
   - Reload page and check load times
   - Look for parallel requests (they should start simultaneously)

3. **Lighthouse Audit:**
   - Open Chrome DevTools → Lighthouse
   - Run Performance audit
   - Compare scores before/after

## Expected Results

After implementing all quick fixes:

- **Dashboard Load Time**: 60-70% faster
- **Initial Bundle Size**: 20-30% smaller
- **Parallel Requests**: All data fetched simultaneously
- **Google Maps**: Loaded once, shared across components
- **3D Scene**: Only loads on desktop, after initial render

## Next Steps

After implementing these quick fixes, refer to `PERFORMANCE_OPTIMIZATION_REPORT.md` for:

- Server Components migration
- Advanced caching strategies
- Further optimizations
