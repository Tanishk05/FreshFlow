"use server";

import { Order, OrderStatus } from "@/models/Order";
import { requireAuth } from "@/services/auth.service";
import { orderRepository } from "@/repositories/order.repository";
import { produceRepository } from "@/repositories/produce.repository";
import { userRepository } from "@/repositories/user.repository";
import { fleetRepository } from "@/repositories/fleet.repository";
import { serializeDocument } from "@/lib/serialization";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import {
  getSubscriptionsCollection,
  type SubscriptionTier,
} from "@/models/Subscription";
import {
  getUserLoyaltyPointsCollection,
  getPointsTransactionsCollection,
  calculateTier,
} from "@/models/LoyaltyPoints";
import {
  OrderBuilderFactory,
  type OrderBuilderConfig,
} from "@/services/order-builder.service";
import {
  ApproveOrderCommand,
  CancelOrderCommand,
  PickupOrderCommand,
  TransitOrderCommand,
  DeliverOrderCommand,
  orderCommandInvoker,
} from "@/services/order-command.service";
import { emitOrderEvent } from "@/services/event-observer.service";
import { orderMediator } from "@/services/order-mediator.service";
import { getDeliveryDistance } from "@/lib/distanceCalculator";

/**
 * Get all orders for the current farmer
 * Cached for 60 seconds to reduce database load
 */
export async function getMyOrders() {
  try {
    const { userId } = await requireAuth();

    // Cache with 60 second revalidation
    return await unstable_cache(
      async () => {
        const orders = await orderRepository.findByFarmerId(userId);

        // Use Decorator Pattern for order enrichment
        const { OrderDecoratorFactory } = await import(
          "@/services/order-decorator.service"
        );
        const enrichedOrders = await Promise.all(
          orders.map((order) => OrderDecoratorFactory.createDisplayReady(order))
        );

        // Serialize ObjectIds to strings for client-side compatibility
        const serializedOrders = enrichedOrders.map((order) => ({
          ...order,
          _id: order._id?.toString() || "",
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          distributorId: order.distributorId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: order.assignedTruckId?.toString(),
        }));

        return {
          success: true,
          data: serializedOrders,
        };
      },
      [`my-orders-${userId}`],
      {
        revalidate: 60, // Cache for 60 seconds
        tags: [`orders-${userId}`],
      }
    )();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get all orders placed by the current retailer
 */
export async function getMyRetailerOrders() {
  try {
    const { userId } = await requireAuth();

    const orders = await orderRepository.findByRetailerId(userId);

    // Use Decorator Pattern for order enrichment
    const { OrderDecoratorFactory } = await import(
      "@/services/order-decorator.service"
    );
    const enrichedOrders = await Promise.all(
      orders.map((order) => OrderDecoratorFactory.createDisplayReady(order))
    );

    // Serialize ObjectIds to strings for client-side compatibility
    const serializedOrders = enrichedOrders.map((order) => ({
      ...order,
      _id: order._id?.toString() || "",
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: order.distributorId?.toString(),
      produceId: order.produceId.toString(),
      assignedTruckId: order.assignedTruckId?.toString(),
    }));

    return {
      success: true,
      data: serializedOrders,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error fetching retailer orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Create a new order using Builder Pattern
 */
export async function createOrder(data: {
  produceId: string;
  quantity: number;
  notes?: string;
}) {
  try {
    const { userId } = await requireAuth();

    // Get produce details
    const produce = await produceRepository.findById(data.produceId);
    if (!produce) {
      return { success: false, error: "Produce not found" };
    }

    // Get user details
    const retailer = await userRepository.findById(userId);
    const farmer = await userRepository.findById(produce.userId.toString());

    if (!retailer || !farmer) {
      return { success: false, error: "User not found" };
    }

    // Get retailer's subscription tier
    const subscriptionsCollection = await getSubscriptionsCollection();
    const subscription = await subscriptionsCollection.findOne({
      userId: new ObjectId(userId),
      status: "active",
    });
    const subscriptionTier = (subscription?.tier || "free") as SubscriptionTier;

    // Get loyalty points info
    const loyaltyPointsCollection = await getUserLoyaltyPointsCollection();
    const loyaltyData = await loyaltyPointsCollection.findOne({
      userId: new ObjectId(userId),
    });

    // Build order using Builder Pattern
    const builderConfig: OrderBuilderConfig = {
      produce,
      retailer,
      farmer,
      quantity: data.quantity,
      notes: data.notes,
      subscriptionTier,
    };

    const order = await OrderBuilderFactory.buildCompleteOrder(
      builderConfig,
      loyaltyData
    );

    // Create order in database
    const result = await orderRepository.create(order);

    // Award loyalty points
    const pointsEarned = order.loyaltyPointsEarned || 0;
    let finalLoyaltyData = loyaltyData;

    if (!loyaltyData) {
      const newLoyaltyDoc = {
        userId: new ObjectId(userId),
        totalEarned: pointsEarned,
        totalRedeemed: 0,
        totalExpired: 0,
        currentBalance: pointsEarned,
        tier: "bronze" as const,
        pointsMultiplier: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await loyaltyPointsCollection.insertOne(
        newLoyaltyDoc
      );
      finalLoyaltyData = { ...newLoyaltyDoc, _id: insertResult.insertedId };
    } else {
      const newTotalEarned = loyaltyData.totalEarned + pointsEarned;
      const newTier = calculateTier(newTotalEarned);
      await loyaltyPointsCollection.updateOne(
        { userId: new ObjectId(userId) },
        {
          $inc: {
            totalEarned: pointsEarned,
            currentBalance: pointsEarned,
          },
          $set: {
            tier: newTier,
            updatedAt: new Date(),
          },
        }
      );
      finalLoyaltyData = {
        ...loyaltyData,
        totalEarned: newTotalEarned,
        currentBalance: loyaltyData.currentBalance + pointsEarned,
        tier: newTier,
      };
    }

    // Record points transaction
    const pointsTransactionsCollection =
      await getPointsTransactionsCollection();
    await pointsTransactionsCollection.insertOne({
      userId: new ObjectId(userId),
      type: "earned_purchase",
      points: pointsEarned,
      balance: (finalLoyaltyData?.currentBalance || 0) + pointsEarned,
      orderId: result.insertedId,
      description: `Earned ${pointsEarned} points from order #${result.insertedId
        .toString()
        .slice(-6)}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    // Emit event using Observer Pattern
    await emitOrderEvent({
      type: "order.created",
      orderId: result.insertedId.toString(),
      timestamp: new Date(),
      data: {
        farmerId: order.farmerId.toString(),
        retailerId: order.retailerId?.toString(),
        produceName: order.produceName,
        quantity: order.quantity,
        unit: order.unit,
        status: "pending",
      },
    });

    revalidatePath("/dashboard/farmer");
    revalidatePath("/dashboard/retailer");

    return {
      success: true,
      data: {
        ...order,
        _id: result.insertedId.toString(),
        farmerId: order.farmerId.toString(),
        retailerId: order.retailerId?.toString(),
        produceId: order.produceId.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

/**
 * Approve an order using Command Pattern
 */
export async function approveOrder(orderId: string) {
  try {
    const { userId } = await requireAuth();

    // Get user role
    const user = await userRepository.findById(userId);
    const userRole = (user?.role || "farmer") as
      | "farmer"
      | "distributor"
      | "retailer"
      | "admin";

    // Get the order
    const order = await orderRepository.findById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Check if produce has enough quantity
    const produce = await produceRepository.findById(
      order.produceId.toString()
    );
    if (!produce) {
      return { success: false, error: "Produce not found" };
    }
    if (produce.quantity < order.quantity) {
      return {
        success: false,
        error: "Insufficient produce quantity available",
      };
    }

    // Execute approve command
    const command = new ApproveOrderCommand(orderId, userId, userRole);
    const commandResult = await orderCommandInvoker.execute(command);

    if (!commandResult.success) {
      return commandResult;
    }

    // Use Mediator Pattern to coordinate between actors (farmer, retailer, distributor)
    const mediationResult = await orderMediator.mediateApproval(
      orderId,
      userId
    );

    if (!mediationResult.success) {
      return mediationResult;
    }

    // Invalidate cache after mutation (using 'max' profile for stale-while-revalidate)
    revalidateTag(`orders-${userId}`, "max");
    revalidatePath("/dashboard/farmer");
    revalidatePath("/my-produce");

    return { success: true };
  } catch (error) {
    console.error("Error approving order:", error);
    return { success: false, error: "Failed to approve order" };
  }
}

/**
 * Cancel an order using Command Pattern
 */
export async function cancelOrder(orderId: string) {
  try {
    const { userId } = await requireAuth();
    const user = await userRepository.findById(userId);
    const userRole = (user?.role || "farmer") as
      | "farmer"
      | "distributor"
      | "retailer"
      | "admin";

    const command = new CancelOrderCommand(orderId, userId, userRole);
    const result = await orderCommandInvoker.execute(command);

    if (result.success) {
      const order = await orderRepository.findById(orderId);
      if (order) {
        await emitOrderEvent({
          type: "order.cancelled",
          orderId: orderId,
          timestamp: new Date(),
          data: {
            farmerId: order.farmerId.toString(),
            retailerId: order.retailerId?.toString(),
            produceName: order.produceName,
            quantity: order.quantity,
            unit: order.unit,
            status: "cancelled",
          },
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

/**
 * Complete an order (mark as delivered/completed)
 */
export async function completeOrder(orderId: string) {
  try {
    const { userId } = await requireAuth();

    // Verify the order belongs to this farmer
    const order = await orderRepository.findById(orderId);
    if (!order || order.farmerId.toString() !== userId) {
      return { success: false, error: "Order not found or unauthorized" };
    }

    if (order.status !== "approved") {
      return { success: false, error: "Only approved orders can be completed" };
    }

    // Update order status to delivered (legacy function, kept for backwards compatibility)
    await orderRepository.update(orderId, {
      status: "delivered",
      deliveryDate: new Date(),
    });

    revalidatePath("/dashboard/farmer");

    return { success: true };
  } catch (error) {
    console.error("Error completing order:", error);
    return { success: false, error: "Failed to complete order" };
  }
}

/**
 * Mark order as picked up using Command Pattern
 */
export async function markOrderAsPickedUp(orderId: string) {
  try {
    const { userId } = await requireAuth();
    const user = await userRepository.findById(userId);
    const userRole = (user?.role || "farmer") as
      | "farmer"
      | "distributor"
      | "retailer"
      | "admin";

    const command = new PickupOrderCommand(orderId, userId, userRole);
    const result = await orderCommandInvoker.execute(command);

    if (result.success) {
      const order = await orderRepository.findById(orderId);
      if (order) {
        await emitOrderEvent({
          type: "order.picked_up",
          orderId: orderId,
          timestamp: new Date(),
          data: {
            farmerId: order.farmerId.toString(),
            retailerId: order.retailerId?.toString(),
            distributorId: order.distributorId?.toString(),
            produceName: order.produceName,
            quantity: order.quantity,
            unit: order.unit,
            status: "picked-up",
          },
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error marking order as picked up:", error);
    return { success: false, error: "Failed to mark order as picked up" };
  }
}

/**
 * Mark order as in transit using Command Pattern
 */
export async function markOrderAsInTransit(orderId: string) {
  try {
    const { userId } = await requireAuth();
    const user = await userRepository.findById(userId);
    const userRole = (user?.role || "distributor") as
      | "farmer"
      | "distributor"
      | "retailer"
      | "admin";

    const command = new TransitOrderCommand(orderId, userId, userRole);
    const result = await orderCommandInvoker.execute(command);

    if (result.success) {
      const order = await orderRepository.findById(orderId);
      if (order) {
        await emitOrderEvent({
          type: "order.in_transit",
          orderId: orderId,
          timestamp: new Date(),
          data: {
            farmerId: order.farmerId.toString(),
            retailerId: order.retailerId?.toString(),
            distributorId: order.distributorId?.toString(),
            produceName: order.produceName,
            quantity: order.quantity,
            unit: order.unit,
            status: "in-transit",
            destination: order.destination,
          },
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error marking order as in transit:", error);
    return { success: false, error: "Failed to mark order as in transit" };
  }
}

/**
 * Mark order as delivered using Command Pattern
 */
export async function markOrderAsDelivered(orderId: string) {
  try {
    const { userId } = await requireAuth();
    const user = await userRepository.findById(userId);
    const userRole = (user?.role || "distributor") as
      | "farmer"
      | "distributor"
      | "retailer"
      | "admin";

    const command = new DeliverOrderCommand(orderId, userId, userRole);
    const commandResult = await orderCommandInvoker.execute(command);

    if (!commandResult.success) {
      return commandResult;
    }

    // Use Mediator Pattern to coordinate delivery completion
    const mediationResult = await orderMediator.mediateDelivery(
      orderId,
      userId
    );

    return mediationResult;
  } catch (error) {
    console.error("Error marking order as delivered:", error);
    return { success: false, error: "Failed to mark order as delivered" };
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus) {
  try {
    const { userId } = await requireAuth();

    const result = await orderRepository.findMany(
      { farmerId: userId, status },
      { page: 1, limit: 1000 } // Get all orders for this status
    );

    const orders = result.data;

    return {
      success: true,
      data: orders.map((order) => {
        const { assignedTruckId, distributorId, ...orderData } = order;
        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          distributorId: distributorId?.toString(),
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get all approved orders available for distributors to accept
 */
export async function getAvailableOrdersForDistributor() {
  try {
    await requireAuth();
    // Note: Role check could be moved to a role service

    // Get orders with status "approved" (farmer approved, awaiting distributor)
    const result = await orderRepository.findMany(
      { status: "approved" },
      { page: 1, limit: 1000 }
    );
    const orders = result.data;

    // Enrich orders with farmer and retailer names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const farmer = await userRepository.findById(order.farmerId.toString());
        let retailerName = "Unknown Retailer";
        if (order.retailerId) {
          const retailer = await userRepository.findById(
            order.retailerId.toString()
          );
          retailerName = retailer?.name || "Unknown Retailer";
        }

        const serialized = serializeDocument(order);
        return {
          ...serialized,
          farmerName: farmer?.name || "Unknown Farmer",
          retailerName,
        };
      })
    );

    return {
      success: true,
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching available orders:", error);
    return { success: false, error: "Failed to fetch available orders" };
  }
}

/**
 * Accept an order as a distributor (assign distributor and change status to "assigned")
 */
export async function acceptOrderAsDistributor(
  orderId: string,
  truckId: string
) {
  try {
    const { userId } = await requireAuth();

    // Check if order exists and is in approved status
    const order = await orderRepository.findById(orderId);
    if (!order || order.status !== "approved") {
      return {
        success: false,
        error: "Order not found or already assigned",
      };
    }

    // Use Mediator Pattern to coordinate order assignment
    // Mediator handles distance calculation, delivery fee, and order updates
    const mediationResult = await orderMediator.mediateAssignment(
      orderId,
      userId,
      truckId
    );

    if (!mediationResult.success) {
      return mediationResult;
    }

    // Update truck status to "on-route" and add order to assignedOrderIds
    const { fleetRepository } = await import("@/repositories/fleet.repository");
    const truck = await fleetRepository.findById(truckId);
    if (truck) {
      const assignedOrderIds = truck.assignedOrderIds || [];
      if (!assignedOrderIds.some((id) => id.toString() === orderId)) {
        assignedOrderIds.push(new ObjectId(orderId));
      }
      await fleetRepository.update(truckId, {
        status: "on-route",
        assignedOrderIds,
      });
    }

    revalidatePath("/dashboard/distributor");
    revalidatePath("/dashboard/farmer");
    revalidatePath("/dashboard/retailer");

    return { success: true };
  } catch (error) {
    console.error("Error accepting order:", error);
    return { success: false, error: "Failed to accept order" };
  }
}

/**
 * Get distributor's orders by status
 */
export async function getDistributorOrdersByStatus(status: OrderStatus) {
  try {
    const { userId } = await requireAuth();
    // Note: Role check could be moved to a role service

    // Get orders assigned to this distributor with the specified status
    const result = await orderRepository.findMany(
      {
        distributorId: userId,
        status,
      },
      { page: 1, limit: 1000 }
    );
    const orders = result.data;

    // Use Decorator Pattern for order enrichment
    const { OrderDecoratorFactory } = await import(
      "@/services/order-decorator.service"
    );
    const enrichedOrders = await Promise.all(
      orders.map((order) => OrderDecoratorFactory.createDisplayReady(order))
    );

    // Serialize ObjectIds to strings for client-side compatibility
    const serializedOrders = enrichedOrders.map((order) => ({
      ...order,
      _id: order._id?.toString() || "",
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: order.distributorId?.toString(),
      produceId: order.produceId.toString(),
      assignedTruckId: order.assignedTruckId?.toString(),
    }));

    return {
      success: true,
      data: serializedOrders,
    };
  } catch (error) {
    console.error("Error fetching distributor orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Assign multiple orders to a truck for optimized delivery
 */
export async function assignMultipleOrdersToTruck(
  truckId: string,
  orderIds: string[]
) {
  try {
    const { userId } = await requireAuth();
    // Note: Role check could be moved to a role service

    // Verify truck belongs to distributor
    const truck = await fleetRepository.findById(truckId);
    if (!truck || truck.distributorId.toString() !== userId) {
      return { success: false, error: "Truck not found or unauthorized" };
    }

    // Calculate total weight of orders
    const orders = await Promise.all(
      orderIds.map((id) => orderRepository.findById(id))
    );
    const validOrders = orders.filter(
      (order) =>
        order &&
        order.distributorId?.toString() === userId &&
        order.status === "assigned"
    ) as Order[];

    if (validOrders.length !== orderIds.length) {
      return {
        success: false,
        error: "Some orders not found or not available",
      };
    }

    // Calculate total weight (convert to kg)
    let totalWeightKg = 0;
    for (const order of validOrders) {
      if (order.unit === "kg") {
        totalWeightKg += order.quantity;
      } else if (order.unit === "tons") {
        totalWeightKg += order.quantity * 1000;
      } else if (order.unit === "bags") {
        totalWeightKg += order.quantity * 50; // Assume 50kg per bag
      }
    }

    // Check if truck has capacity
    const availableCapacity = truck.capacityKg - truck.currentLoadKg;
    if (totalWeightKg > availableCapacity) {
      return {
        success: false,
        error: `Insufficient truck capacity. Available: ${availableCapacity.toFixed(
          0
        )}kg, Required: ${totalWeightKg.toFixed(0)}kg`,
      };
    }

    // Update all orders with truck assignment
    await Promise.all(
      orderIds.map((id) =>
        orderRepository.update(id, {
          assignedTruckId: new ObjectId(truckId),
        })
      )
    );

    // Update truck with new orders and load
    const currentOrderIds = truck.assignedOrderIds || [];
    const newOrderIds = orderIds
      .map((id) => new ObjectId(id))
      .filter(
        (id) => !currentOrderIds.some((oid) => oid.toString() === id.toString())
      );

    await fleetRepository.update(truckId, {
      assignedOrderIds: [...currentOrderIds, ...newOrderIds],
      currentLoadKg: truck.currentLoadKg + totalWeightKg,
    });

    revalidatePath("/dashboard/distributor");

    return {
      success: true,
      message: `Successfully assigned ${
        orderIds.length
      } order(s) to truck. Total weight: ${totalWeightKg.toFixed(0)}kg`,
    };
  } catch (error) {
    console.error("Error assigning orders to truck:", error);
    return { success: false, error: "Failed to assign orders to truck" };
  }
}

/**
 * Calculate delivery fee for a produce item based on farmer and retailer locations
 */
export async function calculateDeliveryFee(produceId: string) {
  try {
    const { userId } = await requireAuth();

    const produce = await produceRepository.findById(produceId);

    if (!produce) {
      return { success: false, error: "Produce not found", deliveryFee: 0 };
    }

    let deliveryFee = 0;
    let distance: number | undefined = undefined;

    try {
      const farmer = await userRepository.findById(produce.userId.toString());
      const retailer = await userRepository.findById(userId);

      if (
        farmer?.address?.latitude &&
        farmer?.address?.longitude &&
        retailer?.address?.latitude &&
        retailer?.address?.longitude
      ) {
        const result = await getDeliveryDistance(
          farmer.address.latitude,
          farmer.address.longitude,
          retailer.address.latitude,
          retailer.address.longitude
        );
        distance = result.distance;

        // Calculate delivery fee based on distance
        // Base fee: ₹50, Distance fee: ₹10 per km
        const baseFee = 50;
        const distanceFee = distance * 10;
        deliveryFee = baseFee + distanceFee;
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
    }

    // If distance couldn't be calculated, use estimated delivery fee
    if (!deliveryFee) {
      const estimatedDistance = Math.floor(Math.random() * 45) + 5;
      const baseFee = 50;
      const distanceFee = estimatedDistance * 10;
      deliveryFee = baseFee + distanceFee;
    }

    return {
      success: true,
      deliveryFee: Math.round(deliveryFee),
      distance: distance ? Math.round(distance) : undefined,
    };
  } catch (error) {
    console.error("Error calculating delivery fee:", error);
    return {
      success: false,
      error: "Failed to calculate delivery fee",
      deliveryFee: 0,
    };
  }
}
