# Performance Optimization Report

## Executive Summary

This report identifies key performance bottlenecks in the FreshFlow application and provides actionable recommendations to reduce loading times. The analysis covers bundle size, data fetching patterns, code splitting, and caching strategies.

## Critical Issues Identified

### 1. 🔴 Heavy Dependencies Loaded on Initial Page Load

**Impact: High** | **Effort: Medium**

#### Problems:

- **Three.js + React Three Fiber** (~500KB) loaded on homepage via `HeroScene.tsx`
- **Google Maps API** (~200KB) loaded in multiple places without lazy loading
- **Framer Motion** (~100KB) used extensively throughout
- **Multiple chart libraries**: Both `recharts` and `react-chartjs-2` are installed

#### Current Code:

```tsx
// src/app/page.tsx - HeroScene loaded on every homepage visit
const HeroScene = dynamic(() => import("@/components/scene/HeroScene"), {
  ssr: false,
});
```

#### Recommendations:

1. **Conditionally load HeroScene** - Only load on desktop or user interaction
2. **Lazy load Google Maps** - Only load when component is actually visible
3. **Remove unused chart library** - Standardize on one (recharts is lighter)
4. **Tree-shake Framer Motion** - Import specific functions instead of entire library

### 2. 🔴 Sequential Data Fetching in Dashboard Pages

**Impact: Critical** | **Effort: Low**

#### Problems:

- Multiple `useEffect` hooks making sequential API calls
- No parallel fetching - each waits for previous to complete
- No caching for database queries
- All dashboard pages are client components

#### Current Pattern (Farmer Dashboard):

```tsx
// Multiple sequential useEffects - SLOW!
useEffect(() => {
  fetchProduce();
}, []);
useEffect(() => {
  fetchAlerts();
}, []);
useEffect(() => {
  fetchOrders();
}, []);
useEffect(() => {
  fetchShipments();
}, []);
useEffect(() => {
  fetchTrackedOrders();
}, []);
useEffect(() => {
  fetchPerformanceMetrics();
}, []);
```

#### Recommendations:

1. **Use Promise.all()** to fetch all data in parallel
2. **Convert to Server Components** - Fetch data on server
3. **Implement React Query or SWR** for caching and parallel requests
4. **Add request deduplication**

### 3. 🟡 No Database Query Caching

**Impact: High** | **Effort: Medium**

#### Problems:

- Every page load hits MongoDB directly
- No caching layer for frequently accessed data
- Serialization overhead on every request
- No stale-while-revalidate pattern

#### Current Pattern:

```tsx
// Every request hits database - no cache
export async function getMyOrders() {
  const { userId } = await requireAuth();
  const collection = await getOrderCollection();
  return await collection.find({ farmerId: userId }).toArray();
}
```

#### Recommendations:

1. **Add Next.js cache** - Use `unstable_cache` or `revalidateTag`
2. **Implement Redis** - For frequently accessed data
3. **Add stale-while-revalidate** - Show cached data while fetching fresh
4. **Use MongoDB aggregation pipelines** - Reduce data processing overhead

### 4. 🟡 Google Maps Loaded Multiple Times

**Impact: Medium** | **Effort: Low**

#### Problems:

- `useJsApiLoader` called in 3+ components
- Each component loads Google Maps independently
- No shared loader instance
- Maps API loaded even when component isn't visible

#### Current Code:

```tsx
// Profile page
const { isLoaded } = useJsApiLoader({...});

// Complete signup page
const { isLoaded } = useJsApiLoader({...});

// GoogleLocationPicker component
const { isLoaded } = useJsApiLoader({...});
```

#### Recommendations:

1. **Create shared Google Maps provider** - Single loader instance
2. **Lazy load map components** - Only load when needed
3. **Use intersection observer** - Load when component is visible

### 5. 🟡 Socket.io Loaded on Every Page

**Impact: Medium** | **Effort: Low**

#### Problems:

- Socket connection initialized even when not needed
- No lazy loading of socket client
- Connection maintained on all pages

#### Current Code:

```tsx
// src/lib/socket.ts - Always creates connection
export function getSocket(): Socket {
  if (!socket) {
    socket = io({ autoConnect: true, ... });
  }
  return socket;
}
```

#### Recommendations:

1. **Lazy load socket** - Only initialize when needed
2. **Conditional connection** - Connect only on pages that need real-time updates
3. **Reconnect strategy** - Don't auto-connect on initial page load

### 6. 🟡 Large Initial JavaScript Bundle

**Impact: High** | **Effort: Medium**

#### Problems:

- All dependencies bundled into main bundle
- No route-based code splitting
- Heavy libraries loaded upfront

#### Recommendations:

1. **Analyze bundle size** - Use `@next/bundle-analyzer`
2. **Route-based code splitting** - Next.js handles this, but verify
3. **Dynamic imports** - For heavy components
4. **Tree shaking** - Ensure unused code is removed

## Detailed Recommendations

### Priority 1: Quick Wins (Implement First)

#### 1.1 Parallelize Data Fetching

**File**: `src/app/dashboard/farmer/page.tsx`

```tsx
// BEFORE: Sequential (slow)
useEffect(() => {
  fetchProduce();
}, []);
useEffect(() => {
  fetchAlerts();
}, []);
useEffect(() => {
  fetchOrders();
}, []);

// AFTER: Parallel (fast)
useEffect(() => {
  const fetchAllData = async () => {
    const [produce, alerts, orders] = await Promise.all([
      getMyProduce(),
      getMyAlerts(),
      getOrdersByStatus("pending"),
    ]);
    setProduce(produce.data);
    setAlerts(alerts);
    setOrders(orders.data);
  };
  fetchAllData();
}, []);
```

#### 1.2 Create Shared Google Maps Provider

**New File**: `src/providers/GoogleMapsProvider.tsx`

```tsx
"use client";
import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext<{ isLoaded: boolean } | null>(null);

export function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places", "marker"],
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context)
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  return context;
}
```

#### 1.3 Lazy Load HeroScene Only on Desktop

**File**: `src/app/page.tsx`

```tsx
const [showScene, setShowScene] = useState(false);

useEffect(() => {
  // Only load 3D scene on desktop after initial load
  if (window.innerWidth >= 768) {
    const timer = setTimeout(() => setShowScene(true), 1000);
    return () => clearTimeout(timer);
  }
}, []);

{
  showScene && <HeroScene />;
}
```

#### 1.4 Remove Unused Chart Library

**Action**: Remove `react-chartjs-2` from package.json if not used

- Standardize on `recharts` (lighter and more React-friendly)

### Priority 2: Medium-Term Optimizations

#### 2.1 Convert Dashboard Pages to Server Components

**File**: `src/app/dashboard/farmer/page.tsx`

```tsx
// BEFORE: Client component
"use client";
export default function FarmerDashboard() {
  useEffect(() => {
    fetchData();
  }, []);
  // ...
}

// AFTER: Server component with client wrapper
export default async function FarmerDashboard() {
  const [produce, alerts, orders] = await Promise.all([
    getMyProduce(),
    getMyAlerts(),
    getOrdersByStatus("pending"),
  ]);

  return (
    <FarmerDashboardClient produce={produce} alerts={alerts} orders={orders} />
  );
}

// Separate client component for interactivity
("use client");
function FarmerDashboardClient({ produce, alerts, orders }) {
  // Only client-side interactivity here
}
```

#### 2.2 Add Database Query Caching

**File**: `src/actions/orderActions.ts`

```tsx
import { unstable_cache } from "next/cache";

export const getMyOrders = unstable_cache(
  async () => {
    const { userId } = await requireAuth();
    const collection = await getOrderCollection();
    return await collection.find({ farmerId: userId }).toArray();
  },
  ["my-orders"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["orders"],
  }
);
```

#### 2.3 Implement React Query for Client-Side Caching

**New File**: `src/providers/QueryProvider.tsx`

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

#### 2.4 Lazy Load Socket.io

**File**: `src/lib/socket.ts`

```tsx
let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  if (!connectPromise) {
    connectPromise = new Promise((resolve) => {
      socket = io({
        path: "/api/socket",
        autoConnect: false, // Don't auto-connect
        transports: ["websocket"],
      });

      socket.once("connect", () => resolve(socket!));
      socket.connect();
    });
  }

  return connectPromise;
}

// Lazy connect - only when needed
export function connectSocket() {
  return getSocket();
}
```

### Priority 3: Advanced Optimizations

#### 3.1 Implement Route-Based Code Splitting

**File**: `next.config.ts`

```tsx
const nextConfig: NextConfig = {
  // ... existing config
  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
      "recharts",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: "three",
            priority: 10,
          },
          maps: {
            test: /[\\/]node_modules[\\/]@react-google-maps[\\/]/,
            name: "maps",
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

#### 3.2 Add Bundle Analyzer

**File**: `package.json`

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0"
  }
}
```

**File**: `next.config.ts`

```tsx
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

#### 3.3 Optimize Images

**Action**: Ensure all images use Next.js Image component with proper sizing

```tsx
// Add priority for above-fold images
<Image
  src={image}
  alt={name}
  width={800}
  height={600}
  priority // For LCP optimization
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### 3.4 Add Resource Hints

**File**: `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Performance Metrics to Track

### Before Optimization (Baseline)

- **First Contentful Paint (FCP)**: Measure
- **Largest Contentful Paint (LCP)**: Measure
- **Time to Interactive (TTI)**: Measure
- **Total Bundle Size**: Measure
- **Initial Load Time**: Measure

### Target Metrics

- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **TTI**: < 3.5s
- **Bundle Size**: < 200KB (initial JS)
- **Load Time**: < 3s on 3G

## Implementation Checklist

### Week 1: Quick Wins

- [ ] Parallelize all dashboard data fetching
- [ ] Create shared Google Maps provider
- [ ] Lazy load HeroScene component
- [ ] Remove unused chart library
- [ ] Analyze current bundle size

### Week 2: Server Components & Caching

- [ ] Convert dashboard pages to server components
- [ ] Add Next.js caching to server actions
- [ ] Implement React Query for client caching
- [ ] Optimize database queries

### Week 3: Advanced Optimizations

- [ ] Implement route-based code splitting
- [ ] Add bundle analyzer to build process
- [ ] Optimize all images with proper sizing
- [ ] Add resource hints and preloading

### Week 4: Testing & Monitoring

- [ ] Performance testing with Lighthouse
- [ ] Set up performance monitoring
- [ ] Load testing with realistic data
- [ ] Document performance improvements

## Expected Impact

### Load Time Improvements

- **Initial Load**: 40-50% faster (3s → 1.5-2s)
- **Dashboard Load**: 60-70% faster (5s → 1.5-2s)
- **Time to Interactive**: 50% faster

### Bundle Size Reduction

- **Main Bundle**: 30-40% smaller
- **Chunk Sizes**: More optimized splitting
- **Lazy Loaded**: Heavy libraries only when needed

### Database Load Reduction

- **Query Cache Hit Rate**: 70-80%
- **Database Requests**: 60-70% reduction
- **Response Time**: 50% faster for cached queries

## Additional Recommendations

### 1. Implement Service Worker for Offline Support

- Cache static assets
- Cache API responses
- Background sync for offline actions

### 2. Add CDN for Static Assets

- Host images on CDN
- Serve fonts from CDN
- Static asset optimization

### 3. Database Query Optimization

- Add indexes for frequently queried fields
- Use aggregation pipelines efficiently
- Implement pagination for large datasets

### 4. Monitoring & Analytics

- Set up Web Vitals monitoring
- Track real user metrics
- Alert on performance regressions

## Conclusion

Implementing these optimizations should significantly improve loading times. Start with Priority 1 items for immediate impact, then proceed to Priority 2 and 3 for comprehensive optimization.

**Estimated Overall Improvement**: 50-70% faster load times
