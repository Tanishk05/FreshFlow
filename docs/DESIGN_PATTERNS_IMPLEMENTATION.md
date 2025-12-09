# Design Patterns Implementation

## Overview

This document describes the design patterns implemented in the FreshFlow codebase to improve code organization, maintainability, and scalability.

## Implemented Patterns

### 1. State Machine Pattern

**Location**: `src/services/order-state-machine.service.ts`

**Purpose**: Manages order status transitions with validation and role-based permissions.

**Benefits**:

- Ensures only valid state transitions occur
- Centralizes transition logic
- Prevents invalid status changes
- Role-based access control for transitions

**Usage**:

```typescript
import { OrderStateMachine } from "@/services/order-state-machine.service";

// Check if transition is valid
const canTransition = OrderStateMachine.canTransition("pending", "approve");

// Validate transition with context
const validation = await OrderStateMachine.validateTransition(
  order,
  "approve",
  userId,
  "farmer"
);
```

**State Transitions**:

- `pending` → `approved` (farmer/admin)
- `pending` → `rejected` (farmer/admin)
- `pending`/`approved` → `cancelled` (farmer/retailer/admin)
- `approved` → `assigned` (distributor/admin)
- `assigned` → `picked-up` (farmer/distributor/admin)
- `picked-up` → `in-transit` (distributor/admin)
- `in-transit` → `delivered` (distributor/admin)

---

### 2. Strategy Pattern

**Location**: `src/services/pricing-strategy.service.ts`

**Purpose**: Allows switching between different pricing calculation strategies.

**Benefits**:

- Easy to add new pricing models
- Testable pricing logic
- Runtime strategy switching
- Separation of pricing concerns

**Strategies**:

- **StandardPricingStrategy**: Default pricing with tiered delivery thresholds
- **PremiumPricingStrategy**: Higher base fees but better discounts

**Usage**:

```typescript
import { pricingStrategy, PremiumPricingStrategy } from "@/services/pricing-strategy.service";

// Use default strategy
const pricing = pricingStrategy.calculateOrderPricing(...);

// Switch to premium strategy
pricingStrategy.setStrategy(new PremiumPricingStrategy());
```

---

### 3. Command Pattern

**Location**: `src/services/order-command.service.ts`

**Purpose**: Encapsulates order operations as objects, enabling undo operations and command queuing.

**Benefits**:

- Encapsulates requests as objects
- Supports undo/redo operations
- Command history tracking
- Parameterization of operations

**Commands**:

- `ApproveOrderCommand`
- `CancelOrderCommand`
- `AssignOrderCommand`
- `PickupOrderCommand`
- `TransitOrderCommand`
- `DeliverOrderCommand`

**Usage**:

```typescript
import {
  ApproveOrderCommand,
  orderCommandInvoker,
} from "@/services/order-command.service";

const command = new ApproveOrderCommand(orderId, userId, "farmer");
const result = await orderCommandInvoker.execute(command);
```

---

### 4. Observer Pattern

**Location**: `src/services/event-observer.service.ts`

**Purpose**: Implements event-driven architecture for decoupled event handling.

**Benefits**:

- Loose coupling between components
- Easy to add new event handlers
- Centralized event management
- Supports multiple observers per event

**Observers**:

- **WebhookObserver**: Handles webhook notifications
- **NotificationObserver**: Handles in-app notifications
- **AnalyticsObserver**: Tracks events for analytics

**Usage**:

```typescript
import { emitOrderEvent } from "@/services/event-observer.service";

await emitOrderEvent({
  type: "order.created",
  orderId: "123",
  timestamp: new Date(),
  data: { ... }
});
```

---

### 5. Builder Pattern

**Location**: `src/services/order-builder.service.ts`

**Purpose**: Constructs complex order objects step by step with a fluent interface.

**Benefits**:

- Step-by-step object construction
- Fluent interface for readability
- Handles complex initialization logic
- Reusable builder instances

**Usage**:

```typescript
import { OrderBuilderFactory } from "@/services/order-builder.service";

// Build complete order
const order = await OrderBuilderFactory.buildCompleteOrder(
  {
    produce,
    retailer,
    farmer,
    quantity: 100,
    subscriptionTier: "premium",
  },
  loyaltyData
);

// Or use builder directly
const builder = new OrderBuilder();
await builder.initialize(config).calculateDistance();
builder.calculatePricing().setDeliveryAddress().setEstimatedDelivery();
const order = builder.build();
```

---

## Architecture Benefits

### Before Patterns

- Status transitions scattered across multiple functions
- Manual validation in each function
- Tight coupling between order operations and side effects
- Complex order creation logic mixed with business logic
- Difficult to test and maintain

### After Patterns

- Centralized state management
- Validated transitions with role-based access
- Decoupled event handling
- Clean, testable order creation
- Easy to extend with new features

---

## Integration with Existing Code

The patterns are designed to work alongside the existing repository and service layers:

1. **Repositories**: Handle data access (already implemented)
2. **Services**: Handle business logic (patterns added here)
3. **Actions**: Use services and patterns (refactored to use patterns)

---

## Migration Path

### Option 1: Gradual Migration

Keep existing `orderActions.ts` and create new `orderActions.refactored.ts`. Gradually migrate functions.

### Option 2: Direct Replacement

Replace functions in `orderActions.ts` with pattern-based implementations.

### Option 3: Feature Flags

Use feature flags to switch between old and new implementations.

---

## Testing Strategy

Each pattern can be tested independently:

1. **State Machine**: Test transition validation
2. **Strategy**: Test different pricing calculations
3. **Command**: Test command execution and undo
4. **Observer**: Test event emission and handling
5. **Builder**: Test order construction

---

## Future Enhancements

1. **Query Builder Pattern**: For complex database queries
2. **Factory Pattern**: For creating different order types
3. **Chain of Responsibility**: For order validation pipeline
4. **Mediator Pattern**: For coordinating between actors
5. **Template Method**: For common order processing workflows

---

## Files Created

1. `src/services/order-state-machine.service.ts` - State machine for order transitions
2. `src/services/pricing-strategy.service.ts` - Pricing strategy implementations
3. `src/services/order-command.service.ts` - Command pattern for order operations
4. `src/services/event-observer.service.ts` - Observer pattern for events
5. `src/services/order-builder.service.ts` - Builder pattern for order creation
6. `src/actions/orderActions.refactored.ts` - Refactored order actions using patterns

---

## Usage Examples

### Creating an Order (Builder Pattern)

```typescript
const order = await OrderBuilderFactory.buildCompleteOrder(
  {
    produce: produceData,
    retailer: retailerData,
    farmer: farmerData,
    quantity: 100,
    subscriptionTier: "premium",
  },
  loyaltyData
);
```

### Approving an Order (Command Pattern)

```typescript
const command = new ApproveOrderCommand(orderId, userId, "farmer");
const result = await orderCommandInvoker.execute(command);
```

### Emitting Events (Observer Pattern)

```typescript
await emitOrderEvent({
  type: "order.approved",
  orderId: orderId,
  timestamp: new Date(),
  data: { ... }
});
```

### Validating Transitions (State Machine)

```typescript
const validation = await OrderStateMachine.validateTransition(
  order,
  "approve",
  userId,
  "farmer"
);
```

---

## Conclusion

These design patterns provide a solid foundation for:

- **Maintainability**: Clear separation of concerns
- **Testability**: Each pattern can be tested independently
- **Extensibility**: Easy to add new features
- **Scalability**: Patterns support growth
- **Code Quality**: Clean, readable, and organized code

The implementation follows SOLID principles and integrates seamlessly with the existing repository pattern architecture.
