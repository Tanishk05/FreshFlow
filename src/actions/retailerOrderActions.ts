"use server";

import {
  getRetailerOrderCollection,
  RetailerOrderSerialized,
  RetailerOrderStatus,
} from "@/models/RetailerOrder";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getUsersCollection } from "@/models/User";
import { getFleetCollection } from "@/models/Fleet";

export async function getMyRetailerOrders(): Promise<
  RetailerOrderSerialized[]
> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getRetailerOrderCollection();
  const orders = await collection
    .find({ distributorId: new ObjectId(session.user.id) })
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
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getRetailerOrderCollection();
  const orders = await collection
    .find({
      distributorId: new ObjectId(session.user.id),
      status,
    })
    .sort({ orderDate: -1 })
    .toArray();

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
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getRetailerOrderCollection();
  const fleetCollection = await getFleetCollection();

  // Get the order to get destination info
  const order = await collection.findOne({
    _id: new ObjectId(orderId),
    distributorId: new ObjectId(session.user.id),
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update the order with truck assignment
  await collection.updateOne(
    {
      _id: new ObjectId(orderId),
      distributorId: new ObjectId(session.user.id),
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
  await fleetCollection.updateOne(
    {
      _id: new ObjectId(truckId),
      distributorId: new ObjectId(session.user.id),
    },
    {
      $set: {
        status: "on-route",
        assignedOrderId: new ObjectId(orderId),
        destination: order.destination,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function updateRetailerOrderStatus(
  orderId: string,
  status: RetailerOrderStatus
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getRetailerOrderCollection();
  const fleetCollection = await getFleetCollection();

  // Get the order to find the assigned truck
  const order = await collection.findOne({
    _id: new ObjectId(orderId),
    distributorId: new ObjectId(session.user.id),
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update order status
  await collection.updateOne(
    {
      _id: new ObjectId(orderId),
      distributorId: new ObjectId(session.user.id),
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  // If order is delivered, reset truck to available
  if (status === "delivered" && order.assignedTruckId) {
    await fleetCollection.updateOne(
      {
        _id: order.assignedTruckId,
        distributorId: new ObjectId(session.user.id),
      },
      {
        $set: {
          status: "available",
          destination: undefined,
          assignedOrderId: undefined,
          updatedAt: new Date(),
        },
      }
    );
  }

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function getRetailerOrderStats() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getRetailerOrderCollection();

  const [total, pending, assigned, inTransit, delivered] = await Promise.all([
    collection.countDocuments({ distributorId: new ObjectId(session.user.id) }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "pending",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "assigned",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "in-transit",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
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
