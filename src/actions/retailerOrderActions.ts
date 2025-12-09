"use server";

import {
  getRetailerOrderCollection,
  RetailerOrderSerialized,
  RetailerOrderStatus,
} from "@/models/RetailerOrder";
import { requireAuth } from "@/services/auth.service";
import { userRepository } from "@/repositories/user.repository";
import { fleetRepository } from "@/repositories/fleet.repository";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function getMyRetailerOrders(): Promise<
  RetailerOrderSerialized[]
> {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getRetailerOrderCollection();
  const orders = await collection
    .find({ distributorId: new ObjectId(userId) })
    .sort({ orderDate: -1 })
    .toArray();

  return orders.map((order) => ({
    ...order,
    _id: order._id?.toString(),
    retailerId: order.retailerId.toString(),
    distributorId: order.distributorId.toString(),
    assignedTruckId: order.assignedTruckId?.toString(),
    items: order.items.map((item) => ({
      ...item,
      produceId: item.produceId.toString(),
    })),
  }));
}

export async function getRetailerOrdersByStatus(
  status: RetailerOrderStatus
): Promise<RetailerOrderSerialized[]> {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getRetailerOrderCollection();
  const orders = await collection
    .find({
      distributorId: new ObjectId(userId),
      status,
    })
    .sort({ orderDate: -1 })
    .toArray();

  // Fetch retailer names for each order
  const retailerIds = [...new Set(orders.map((o) => o.retailerId.toString()))];
  const retailers = await Promise.all(
    retailerIds.map((id) => userRepository.findById(id))
  );
  const validRetailers = retailers.filter((r) => r !== null);

  const retailerMap = new Map(
    validRetailers.map((r) => [
      r!._id.toString(),
      r!.name || r!.email || "Unknown",
    ])
  );

  return orders.map((order) => ({
    ...order,
    _id: order._id?.toString(),
    retailerId: order.retailerId.toString(),
    distributorId: order.distributorId.toString(),
    assignedTruckId: order.assignedTruckId?.toString(),
    items: order.items.map((item) => ({
      ...item,
      produceId: item.produceId.toString(),
    })),
    retailerName: retailerMap.get(order.retailerId.toString()),
  }));
}

export async function assignOrderToTruck(orderId: string, truckId: string) {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getRetailerOrderCollection();

  // Get the order to get destination info
  const order = await collection.findOne({
    _id: new ObjectId(orderId),
    distributorId: new ObjectId(userId),
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update the order with truck assignment
  await collection.updateOne(
    {
      _id: new ObjectId(orderId),
      distributorId: new ObjectId(userId),
    },
    {
      $set: {
        assignedTruckId: new ObjectId(truckId),
        status: "assigned",
        updatedAt: new Date(),
      },
    }
  );

  // Update the truck status to "on-route" and link to order
  const truck = await fleetRepository.findById(truckId);
  if (truck && truck.distributorId.toString() === userId) {
    const assignedOrderIds = truck.assignedOrderIds || [];
    if (!assignedOrderIds.some((id) => id.toString() === orderId)) {
      assignedOrderIds.push(new ObjectId(orderId));
    }
    await fleetRepository.update(truckId, {
      status: "on-route",
      destination: order.destination,
      assignedOrderIds,
    });
  }

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function updateRetailerOrderStatus(
  orderId: string,
  status: RetailerOrderStatus
) {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getRetailerOrderCollection();

  // Get the order to find the assigned truck
  const order = await collection.findOne({
    _id: new ObjectId(orderId),
    distributorId: new ObjectId(userId),
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update order status
  await collection.updateOne(
    {
      _id: new ObjectId(orderId),
      distributorId: new ObjectId(userId),
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  // If order is delivered, reset truck to available and remove order from assignedOrderIds
  if (status === "delivered" && order.assignedTruckId) {
    const truck = await fleetRepository.findById(order.assignedTruckId.toString());
    if (truck && truck.distributorId.toString() === userId) {
      const updatedOrderIds = (truck.assignedOrderIds || []).filter(
        (id) => id.toString() !== orderId
      );
      
      if (updatedOrderIds.length === 0) {
        await fleetRepository.update(order.assignedTruckId.toString(), {
          status: "available",
          destination: undefined,
          assignedOrderIds: [],
        });
      } else {
        await fleetRepository.update(order.assignedTruckId.toString(), {
          assignedOrderIds: updatedOrderIds,
        });
      }
    }
  }

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function getRetailerOrderStats() {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getRetailerOrderCollection();

  const [total, pending, assigned, inTransit, delivered] = await Promise.all([
    collection.countDocuments({ distributorId: new ObjectId(userId) }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "pending",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "assigned",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "in-transit",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "delivered",
    }),
  ]);

  return {
    total,
    pending,
    assigned,
    inTransit,
    delivered,
  };
}
