# Remaining Refactoring Tasks

## Status

### ✅ Completed
- `adminActions.ts` - Fully refactored
- `settingsActions.ts` - Fully refactored  
- `produceActions.ts` - Fully refactored
- `fleetActions.ts` - Fully refactored
- `shipmentActions.ts` - Fully refactored
- `orderActions.ts` - Partially refactored (3/15 functions)

### 🔄 In Progress
- `orderActions.ts` - 12 functions remaining

### 📋 Pattern for Remaining Functions

For each function in `orderActions.ts`, follow this pattern:

```typescript
// OLD
export async function functionName(...) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const ordersCollection = await getOrdersCollection();
    // ... rest of function
  }
}

// NEW
export async function functionName(...) {
  try {
    const { userId } = await requireAuth();
    // Use orderRepository instead of ordersCollection
    // ... rest of function
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error:", error);
    return { success: false, error: "Failed to..." };
  }
}
```

### Remaining Functions in orderActions.ts

1. `cancelOrder` - Replace session, use orderRepository
2. `completeOrder` - Replace session, use orderRepository  
3. `markOrderAsPickedUp` - Replace session, use orderRepository
4. `markOrderAsInTransit` - Replace session, use orderRepository
5. `markOrderAsDelivered` - Replace session, use orderRepository
6. `getOrdersByStatus` - Replace session, use orderRepository
7. `getAvailableOrdersForDistributor` - Replace session, use orderRepository
8. `acceptOrderAsDistributor` - Replace session, use orderRepository
9. `getDistributorOrdersByStatus` - Replace session, use orderRepository
10. `assignMultipleOrdersToTruck` - Replace session, use orderRepository
11. `calculateDeliveryFee` - Replace session, use produceRepository

### Other Files to Refactor

1. `retailerOrderActions.ts` - Create RetailerOrderRepository
2. `marketplaceActions.ts` - Use existing repositories
3. `notificationActions.ts` - Create NotificationRepository
4. `alertActions.ts` - Use existing repositories
5. `earningsActions.ts` - Use existing repositories
6. `loyaltyActions.ts` - Create LoyaltyRepository
7. `subscriptionActions.ts` - Create SubscriptionRepository
8. `storeInventoryActions.ts` - Create StoreInventoryRepository
9. `warehouseActions.ts` - Create WarehouseRepository
10. `performanceActions.ts` - Use existing repositories
11. `emailActions.ts` - Use existing repositories
12. `webhookActions.ts` - Use existing repositories
13. `completeSignup.ts` - Use userRepository

## Quick Reference

### Replace Authentication
```typescript
// OLD
const session = await auth();
if (!session?.user?.id) {
  return { success: false, error: "Unauthorized" };
}
const userId = session.user.id;

// NEW
const { userId } = await requireAuth();
```

### Replace Database Access
```typescript
// OLD
const collection = await getCollection();
const data = await collection.find({...}).toArray();

// NEW
const data = await repository.findMany({...});
```

### Replace Serialization
```typescript
// OLD
data.map((item) => ({
  ...item,
  _id: item._id?.toString(),
  createdAt: item.createdAt.toISOString(),
}))

// NEW
data.map((item) => serializeDocument(item))
```

