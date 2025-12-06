# Truck Load Management System

## Overview

The Truck Load Management System optimizes delivery efficiency by allowing trucks to carry multiple orders simultaneously based on available capacity. This maximizes truck utilization and reduces delivery costs.

## Problem Statement

**Before:** One truck = One order (inefficient)

- Truck capacity: 10,000 kg
- Single order: 50 kg
- Wasted capacity: 9,950 kg (99.5% unused!)

**After:** One truck = Multiple orders (efficient)

- Truck capacity: 10,000 kg
- Multiple orders: 50 kg + 200 kg + 150 kg + ... = 9,800 kg
- Wasted capacity: 200 kg (2% unused)
- **Efficiency gain: 49x more orders per truck!**

## Key Features

### 1. **Multi-Order Assignment**

- Assign multiple orders to a single truck
- Real-time capacity tracking (kg)
- Visual load percentage indicators
- Automatic validation of weight limits

### 2. **AI-Powered Optimization**

- **First Fit Decreasing Algorithm**
  - Sorts orders by weight (heaviest first)
  - Assigns to trucks with best fit
  - Maximizes overall utilization
- **Smart Suggestions**
  - Analyzes all pending orders
  - Calculates optimal truck assignments
  - Shows load distribution preview
  - One-click apply all suggestions

### 3. **Real-Time Capacity Management**

- Current load tracking
- Available capacity calculation
- Load percentage visualization
- Color-coded status indicators
  - 🟢 Green: < 70% (efficient)
  - 🟡 Yellow: 70-89% (good)
  - 🔴 Red: ≥ 90% (near capacity)

### 4. **Order Lifecycle Management**

- Assign orders → Truck load increases
- Complete delivery → Truck load decreases
- Automatic status updates
- Truck availability management

## Database Schema

### Fleet Model Updates

```typescript
export interface Fleet {
  _id?: ObjectId;
  distributorId: ObjectId;
  truckNumber: string;
  driver: string;
  driverContact: string;
  status: "available" | "on-route" | "maintenance" | "offline";

  // NEW: Multiple order tracking
  assignedOrderIds?: ObjectId[]; // Array of order IDs

  // NEW: Capacity management
  capacityKg: number;      // Total capacity (e.g., 10000 kg)
  currentLoadKg: number;   // Current load (e.g., 5000 kg)

  // Calculated fields
  availableCapacityKg: capacityKg - currentLoadKg
  loadPercentage: (currentLoadKg / capacityKg) * 100

  currentLocation?: string;
  destination?: string;
  temperatureC?: number;
  eta?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### RetailerOrder Model Updates

```typescript
export interface RetailerOrder {
  _id?: ObjectId;
  retailerId: ObjectId;
  distributorId: ObjectId;
  items: RetailerOrderItem[];
  totalAmount: number;
  deliveryFee: number;

  // NEW: Weight tracking
  totalWeightKg: number; // Sum of all item quantities (in kg)

  distance?: number;
  status: RetailerOrderStatus;
  destination: string;
  deliveryAddress: string;
  assignedTruckId?: ObjectId;
  orderDate: Date;
  estimatedDelivery?: Date;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Functions

### 1. `assignOrdersToTruck(truckId, orderIds[])`

Assigns multiple orders to a specific truck.

**Parameters:**

- `truckId`: Truck ID to assign orders to
- `orderIds`: Array of order IDs to assign

**Logic:**

```typescript
1. Fetch truck and orders from database
2. Calculate total weight of orders
3. Check if truck has sufficient capacity
4. If yes:
   - Add orders to truck.assignedOrderIds[]
   - Increase truck.currentLoadKg
   - Set truck.status = "on-route"
   - Update orders.assignedTruckId
   - Set orders.status = "assigned"
5. Return success/error with load details
```

**Response:**

```typescript
{
  success: true,
  message: "Successfully assigned 3 orders (450 kg) to truck TRK-001",
  truckLoad: {
    currentLoad: 5450,
    capacity: 10000,
    availableCapacity: 4550,
    loadPercentage: 54.5
  }
}
```

### 2. `getAvailableTrucks(requiredWeightKg)`

Finds trucks that can accommodate a specific weight.

**Parameters:**

- `requiredWeightKg`: Minimum available capacity needed

**Logic:**

```typescript
1. Query trucks WHERE:
   - (capacityKg - currentLoadKg) >= requiredWeightKg
   - status IN ["available", "on-route"]
2. Calculate availableCapacityKg for each
3. Sort by available capacity (descending)
4. Return truck list
```

**Response:**

```typescript
{
  success: true,
  trucks: [
    {
      _id: "...",
      truckNumber: "TRK-001",
      capacityKg: 10000,
      currentLoadKg: 2000,
      availableCapacityKg: 8000,
      loadPercentage: 20,
      assignedOrderIds: ["order1", "order2"]
    },
    // More trucks...
  ]
}
```

### 3. `getTruckOrders(truckId)`

Gets all orders assigned to a specific truck.

**Response:**

```typescript
{
  success: true,
  orders: [...],
  totalWeight: 2450,
  orderCount: 5
}
```

### 4. `completeDelivery(truckId, orderIds[])`

Marks orders as delivered and updates truck capacity.

**Logic:**

```typescript
1. Fetch orders to calculate total weight
2. Update orders:
   - status = "delivered"
   - deliveryDate = now
3. Update truck:
   - Remove delivered orders from assignedOrderIds
   - Decrease currentLoadKg by deliveredWeight
   - Set status = "available" if no more orders
4. Return updated status
```

### 5. `suggestOptimalAssignments(distributorId)`

AI-powered optimal assignment suggestion using bin packing algorithm.

**Algorithm: First Fit Decreasing**

```typescript
1. Get all available/on-route trucks
2. Get all pending orders
3. Sort orders by weight (descending)
4. For each order:
   a. Find first truck with enough capacity
   b. Assign order to that truck
   c. Update truck's available capacity
5. Return suggestions + unassigned orders
```

**Response:**

```typescript
{
  success: true,
  suggestions: [
    {
      truckId: "...",
      truckNumber: "TRK-001",
      driver: "John Doe",
      currentLoad: 2000,
      additionalLoad: 3500,
      newLoad: 5500,
      capacity: 10000,
      loadPercentage: 55,
      orderIds: ["order1", "order2", "order3"],
      orders: [
        { orderId: "...", destination: "Mumbai", weight: 1500, items: 3 },
        { orderId: "...", destination: "Pune", weight: 1000, items: 2 },
        { orderId: "...", destination: "Nashik", weight: 1000, items: 2 }
      ]
    },
    // More suggestions...
  ],
  unassignedOrders: [
    {
      orderId: "...",
      destination: "Delhi",
      weight: 12000,
      reason: "Insufficient truck capacity"
    }
  ],
  summary: {
    totalOrders: 15,
    assignedOrders: 13,
    unassignedOrders: 2,
    trucksUsed: 4,
    averageLoadPercentage: 72.5
  }
}
```

## UI Components

### 1. TruckLoadManagement Component

**Location:** `/src/components/dashboard/distributor/TruckLoadManagement.tsx`

**Features:**

- Two-column layout:
  - Left: Available trucks with load visualization
  - Right: Pending orders with weight display
- Interactive selection:
  - Click truck to select
  - Click orders to add to selection
- Real-time validation:
  - Shows if selected orders fit in selected truck
  - Color-coded feedback (green/red)
- One-click assignment

**Visual Elements:**

```
┌─────────────────────────────────────────┐
│ Truck Load Management                   │
│ [AI Suggestions Button]                 │
├──────────────────┬──────────────────────┤
│ Available Trucks │ Pending Orders (12)  │
├──────────────────┼──────────────────────┤
│ 🚚 TRK-001       │ ☐ Mumbai (50 kg)     │
│ Driver: John Doe │ ☐ Pune (200 kg)      │
│ [████████░░] 80% │ ☑ Delhi (150 kg)     │
│ 8000/10000 kg    │ ☐ Chennai (300 kg)   │
│ 2000 kg avail    │                      │
│ • 3 orders       │ Selected: 2 orders   │
│                  │ Total: 350 kg        │
│ 🚚 TRK-002       │ ✓ Can fit in truck   │
│ Driver: Jane Doe │                      │
│ [███░░░░░░░] 30% │ [Assign to Truck]    │
│ 3000/10000 kg    │                      │
│ 7000 kg avail    │                      │
└──────────────────┴──────────────────────┘
```

### 2. OptimalAssignmentModal Component

**Location:** `/src/components/dashboard/distributor/OptimalAssignmentModal.tsx`

**Features:**

- AI suggestion display
- Summary statistics
- Truck-by-truck breakdown
- Unassigned orders warning
- One-click apply all

**Visual Elements:**

```
┌──────────────────────────────────────────────┐
│ 🤖 AI Optimal Assignment                     │
├──────────────────────────────────────────────┤
│ [15]     [13]      [2]       [4]      [72%]  │
│ Total  Assigned  Unassign  Trucks    Avg Load│
├──────────────────────────────────────────────┤
│ Suggested Assignments                        │
│                                              │
│ 🚚 TRK-001 - John Doe          [75% loaded]  │
│ Current: 2000 kg + 5500 kg = 7500 kg         │
│ [██████████████████░░] 75%                   │
│   📦 Mumbai (1500 kg, 3 items)               │
│   📦 Pune (1000 kg, 2 items)                 │
│   📦 Nashik (1000 kg, 2 items)               │
│   📦 Thane (2000 kg, 4 items)                │
│                                              │
│ 🚚 TRK-002 - Jane Doe          [68% loaded]  │
│ Current: 3000 kg + 3800 kg = 6800 kg         │
│ [█████████████████░░░] 68%                   │
│   📦 Delhi (2000 kg, 5 items)                │
│   📦 Jaipur (1800 kg, 3 items)               │
│                                              │
│ ⚠️ Unassigned Orders                         │
│   📦 Bangalore (12000 kg)                    │
│   Reason: Insufficient truck capacity        │
├──────────────────────────────────────────────┤
│ Using First Fit Decreasing algorithm         │
│ [Cancel] [Apply Suggestions]                 │
└──────────────────────────────────────────────┘
```

## Usage Flow

### Manual Assignment Flow

```
1. Distributor opens Truck Load Management
2. Views available trucks and pending orders
3. Selects a truck (e.g., TRK-001)
4. Selects multiple orders to assign
5. System validates total weight vs capacity
6. Clicks "Assign to Truck"
7. Orders assigned + Truck status updated
8. Truck goes "on-route" with multiple deliveries
```

### AI Suggestion Flow

```
1. Distributor clicks "AI Suggestions"
2. System analyzes:
   - All available/on-route trucks
   - All pending orders
   - Current truck loads
3. Runs First Fit Decreasing algorithm
4. Shows modal with optimal assignments
5. Distributor reviews suggestions
6. Clicks "Apply Suggestions"
7. All orders assigned automatically
8. Trucks updated with new loads
```

### Delivery Completion Flow

```
1. Truck delivers first order
2. Driver marks order as delivered
3. System:
   - Sets order status = "delivered"
   - Removes order from truck.assignedOrderIds
   - Decreases truck.currentLoadKg
4. Truck continues to next delivery
5. When all orders delivered:
   - truck.currentLoadKg = 0
   - truck.status = "available"
   - truck.assignedOrderIds = []
```

## Benefits

### 🚚 **For Distributors**

- **Maximize truck utilization**: 10-50x more orders per trip
- **Reduce fuel costs**: Fewer trips needed
- **Increase revenue**: More deliveries per day
- **Better resource planning**: Visual capacity management
- **AI optimization**: Automated assignment suggestions

### 💰 **Cost Savings Example**

**Scenario:** 20 orders, 500 kg average weight

**Before (1 order per truck):**

- Trucks needed: 20
- Trips: 20
- Fuel cost: ₹20,000
- Time: 20 days

**After (multi-order per truck):**

- Trucks needed: 2 (10,000 kg capacity each)
- Trips: 2
- Fuel cost: ₹2,000
- Time: 2 days

**Savings:**

- **90% fewer trips**
- **₹18,000 fuel savings**
- **18 days faster**

### 🌱 **Environmental Impact**

- Reduce CO₂ emissions by 90%
- Lower fuel consumption
- Fewer vehicles on road

## Algorithm Details

### First Fit Decreasing (FFD)

**Why FFD?**

- Simple and efficient
- Good approximation (within 11/9 of optimal)
- Fast computation (O(n log n))
- Real-time performance

**Steps:**

```
1. SORT orders by weight (descending)
   [500kg, 450kg, 300kg, 200kg, 100kg, ...]

2. FOR each order in sorted list:
     FOR each truck:
       IF order.weight <= truck.availableCapacity:
         ASSIGN order to truck
         truck.availableCapacity -= order.weight
         BREAK (move to next order)
     END FOR
   END FOR

3. COLLECT unassigned orders (too heavy for any truck)

4. RETURN assignments + unassigned
```

**Example:**

```
Trucks: A (10000kg), B (10000kg)
Orders: [500, 450, 300, 200, 100, 80, 70]

Step 1: Assign 500 to A → A: 9500 remaining
Step 2: Assign 450 to A → A: 9050 remaining
Step 3: Assign 300 to A → A: 8750 remaining
Step 4: Assign 200 to A → A: 8550 remaining
Step 5: Assign 100 to A → A: 8450 remaining
Step 6: Assign 80 to A → A: 8370 remaining
Step 7: Assign 70 to A → A: 8300 remaining

Result: All 7 orders fit in Truck A!
Truck B remains empty for other orders.
Utilization: 17% of A's capacity
```

## Testing

### Manual Testing Checklist

**Truck Capacity:**

- [ ] Create truck with 10,000 kg capacity
- [ ] Verify currentLoadKg = 0 initially
- [ ] Verify availableCapacityKg = 10,000 kg

**Order Assignment:**

- [ ] Assign single order (50 kg)
- [ ] Verify truck load increases to 50 kg
- [ ] Verify availableCapacity = 9,950 kg
- [ ] Assign another order (200 kg)
- [ ] Verify total load = 250 kg
- [ ] Verify assignedOrderIds contains both orders

**Capacity Validation:**

- [ ] Try to assign order exceeding capacity
- [ ] Verify error message shown
- [ ] Verify order not assigned

**AI Suggestions:**

- [ ] Create 10 pending orders (varying weights)
- [ ] Click "AI Suggestions"
- [ ] Verify optimal assignment shown
- [ ] Apply suggestions
- [ ] Verify all orders assigned correctly

**Delivery Completion:**

- [ ] Mark one order as delivered
- [ ] Verify truck load decreases
- [ ] Verify order removed from assignedOrderIds
- [ ] Mark all orders delivered
- [ ] Verify truck status = "available"
- [ ] Verify currentLoadKg = 0

### Edge Cases

**Oversized Order:**

- Order weight: 15,000 kg
- Truck capacity: 10,000 kg
- Expected: Shows in "Unassigned Orders"

**Exact Capacity:**

- Truck: 10,000 kg available
- Order: 10,000 kg
- Expected: Assigns successfully, 100% loaded

**Multiple Trucks Full:**

- All trucks at 100% capacity
- New order arrives
- Expected: Shows no available trucks

## Database Indexes (Recommended)

For optimal performance, create these indexes:

```javascript
// Fleet collection
db.fleet.createIndex({
  distributorId: 1,
  status: 1,
  capacityKg: -1,
  currentLoadKg: 1,
});

// Efficient query for available trucks
db.fleet.createIndex({
  $expr: {
    $gte: [{ $subtract: ["$capacityKg", "$currentLoadKg"] }, 0],
  },
});

// RetailerOrder collection
db.retailer_orders.createIndex({
  distributorId: 1,
  status: 1,
  totalWeightKg: -1,
});

db.retailer_orders.createIndex({
  assignedTruckId: 1,
  status: 1,
});
```

## Migration Guide

### Updating Existing Data

If you have existing fleet and orders, run this migration:

```javascript
// Update Fleet collection
db.fleet.updateMany(
  { capacityKg: { $exists: false } },
  {
    $set: {
      capacityKg: 10000, // Default 10 tons
      currentLoadKg: 0,
      assignedOrderIds: [],
    },
    $unset: {
      capacity: "", // Remove old field
      assignedOrderId: "", // Remove old field
    },
  }
);

// Update RetailerOrder collection
db.retailer_orders.updateMany({ totalWeightKg: { $exists: false } }, [
  {
    $set: {
      totalWeightKg: {
        $sum: "$items.quantity", // Sum all item quantities
      },
    },
  },
]);
```

## Future Enhancements

### Planned Features

- [ ] **Route Optimization**: Optimize delivery sequence based on GPS
- [ ] **Time Windows**: Assign orders with delivery time constraints
- [ ] **Multi-stop Routes**: Visual route planning with multiple stops
- [ ] **Load Balancing**: Distribute weight evenly across axles
- [ ] **Driver Preferences**: Consider driver availability and skills
- [ ] **Real-time Tracking**: Live truck location and ETA updates
- [ ] **Automatic Reassignment**: Reassign if truck breaks down
- [ ] **Historical Analytics**: Track utilization trends over time

### Advanced Algorithms

- [ ] **Genetic Algorithm**: For complex multi-constraint optimization
- [ ] **Vehicle Routing Problem (VRP)**: Optimize routes + assignments
- [ ] **Machine Learning**: Predict optimal assignments based on history

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 17, 2025
