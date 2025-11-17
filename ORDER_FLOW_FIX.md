# Order Flow Fix - Distributor Order Book

## Problem

When a retailer places an order to buy produce from a farmer, and the farmer approves it, the order was **not appearing in the distributor's order book**.

## Root Cause

There are **two separate order systems** in the application:

1. **Order** (Farmer ↔ Retailer)

   - Collection: `orders`
   - Model: `/src/models/Order.ts`
   - Used when retailers buy produce from farmers

2. **RetailerOrder** (Retailer ↔ Distributor)
   - Collection: `retailer_orders`
   - Model: `/src/models/RetailerOrder.ts`
   - Used for distributor order book and logistics

**The Issue**: When a farmer approved a retailer's order, it only updated the `Order` status to "approved" but **did not create a corresponding `RetailerOrder`** for distributors to fulfill.

## Solution Implemented

### 1. Updated `approveOrder` Function

**File**: `/src/actions/orderActions.ts`

When a farmer approves an order, the system now:

1. Updates the order status to "approved" ✅
2. Deducts produce quantity from inventory ✅
3. **NEW**: Finds an available distributor
4. **NEW**: Creates a `RetailerOrder` with the order details
5. **NEW**: Revalidates the distributor dashboard

```typescript
// After approving the order, create a RetailerOrder for distributors
const usersCollection = await getUsersCollection();
const distributor = await usersCollection.findOne({ role: "distributor" });

if (distributor && order.retailerId) {
  const retailerOrderCollection = await getRetailerOrderCollection();

  const retailer = await usersCollection.findOne({
    _id: order.retailerId,
  });

  const retailerOrder = {
    retailerId: order.retailerId,
    distributorId: distributor._id,
    items: [
      {
        produceId: order.produceId,
        name: order.produceName,
        quantity: order.quantity,
        pricePerUnit: order.pricePerUnit,
      },
    ],
    totalAmount: order.totalPrice,
    status: "pending",
    destination: retailer?.name || "Retailer Store",
    deliveryAddress: retailer?.phone || "Address not provided",
    orderDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await retailerOrderCollection.insertOne(retailerOrder);
  revalidatePath("/dashboard/distributor");
}
```

### 2. Enhanced Distributor Order Display

**File**: `/src/actions/retailerOrderActions.ts`

Updated `getRetailerOrdersByStatus` to include retailer names:

- Fetches retailer information from the users collection
- Maps retailer names to orders
- Displays retailer name instead of "Unknown"

```typescript
// Fetch retailer names for each order
const usersCollection = await getUsersCollection();
const retailerIds = [...new Set(orders.map((o) => o.retailerId.toString()))];
const retailers = await usersCollection
  .find({ _id: { $in: retailerIds.map((id) => new ObjectId(id)) } })
  .toArray();

const retailerMap = new Map(
  retailers.map((r) => [r._id.toString(), r.name || r.email || "Unknown"])
);

return orders.map((order) => ({
  ...order,
  retailerName: retailerMap.get(order.retailerId.toString()),
}));
```

## How It Works Now

### Complete Order Flow

1. **Retailer Places Order**

   - Retailer browses farmer's produce in marketplace
   - Retailer clicks "Buy Now" and creates an order
   - `Order` created with status "pending"
   - Order appears in farmer's "Pending Orders"

2. **Farmer Approves Order**

   - Farmer sees order in "Pending Orders" section
   - Farmer clicks "Approve"
   - System:
     - Updates `Order` status to "approved"
     - Deducts produce quantity from inventory
     - **Creates `RetailerOrder` for distributor** ← NEW!
     - Assigns to available distributor

3. **Distributor Sees Order**

   - Order appears in distributor's "Order Book (New Jobs)"
   - Shows:
     - Produce name and quantity
     - Retailer name (not "Unknown" anymore)
     - Destination and delivery address
     - Total payout amount
   - Distributor can "Accept Job"

4. **Distributor Accepts Job**

   - Assigns order to available truck
   - Status changes from "pending" to "assigned"
   - Order moves to "Pending Deliveries"

5. **Delivery Lifecycle**
   - Status progression: pending → assigned → in-transit → delivered
   - Retailer sees incoming delivery on their dashboard
   - Distributor tracks in "Fleet Management"

## Distributor Assignment Logic

**Current Implementation**: Simple round-robin

- Finds any available distributor in the system
- Assigns the order to that distributor

**Future Enhancements**:

- Location-based assignment (nearest distributor)
- Capacity-based assignment (distributor with most available trucks)
- Performance-based assignment (distributor with best ratings)
- Manual selection by farmer or retailer
- Preferred distributor relationships

## Testing the Fix

### Test Scenario

1. **As Retailer**:

   - Log in as retailer
   - Go to "Buy Produce" or marketplace
   - Place an order for farmer's produce

2. **As Farmer**:

   - Log in as farmer
   - Go to "Pending Orders"
   - Click "Approve" on the retailer's order

3. **As Distributor**:

   - Log in as distributor
   - Go to "Order Book"
   - **Order should now appear** with:
     - Produce details (name, quantity)
     - Retailer name (not "Unknown")
     - Total payout
     - "Accept Job" button

4. **Accept the Job**:
   - Click "Accept Job"
   - Order moves to "Pending Deliveries"
   - Truck assigned automatically

## Database Collections

### orders

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId,
  retailerId: ObjectId,
  produceId: ObjectId,
  produceName: string,
  quantity: number,
  unit: "kg" | "tons" | "bags",
  pricePerUnit: number,
  totalPrice: number,
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled",
  orderDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### retailer_orders (NEW entries created on approval)

```javascript
{
  _id: ObjectId,
  retailerId: ObjectId,
  distributorId: ObjectId,
  items: [
    {
      produceId: ObjectId,
      name: string,
      quantity: number,
      pricePerUnit: number
    }
  ],
  totalAmount: number,
  status: "pending" | "assigned" | "in-transit" | "delivered" | "cancelled",
  destination: string,
  deliveryAddress: string,
  assignedTruckId?: ObjectId,
  orderDate: Date,
  estimatedDelivery?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Files Modified

1. `/src/actions/orderActions.ts`

   - Added imports for RetailerOrder and User collections
   - Enhanced `approveOrder()` to create RetailerOrder

2. `/src/actions/retailerOrderActions.ts`
   - Added User collection import
   - Enhanced `getRetailerOrdersByStatus()` to fetch retailer names

## Benefits

✅ **Complete Order Flow**: Orders now flow seamlessly from retailer → farmer → distributor
✅ **Distributor Visibility**: Distributors can now see all orders that need fulfillment
✅ **Better UX**: Retailer names displayed instead of "Unknown"
✅ **Automatic Assignment**: Orders automatically assigned to available distributors
✅ **Real-time Updates**: Dashboard revalidation ensures fresh data
✅ **Scalable**: Easy to enhance with more sophisticated assignment logic

## Next Steps (Optional Enhancements)

1. **Smart Distributor Assignment**

   - Location-based routing
   - Load balancing across distributors
   - Preferred distributor relationships

2. **Order Bundling**

   - Combine multiple orders going to same destination
   - Optimize truck capacity and routes

3. **Delivery Tracking**

   - Real-time GPS tracking
   - Estimated delivery times
   - Push notifications for status updates

4. **Payment Integration**

   - Automatic payment on delivery
   - Commission handling
   - Transaction history

5. **Rating System**
   - Distributors rate retailers and farmers
   - Retailers rate delivery service
   - Performance metrics and analytics
