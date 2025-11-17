"use server";

import {
  getFleetCollection,
  Fleet,
  FleetSerialized,
  TruckStatus,
} from "@/models/Fleet";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function getMyFleet(): Promise<FleetSerialized[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();
  const trucks = await collection
    .find({ distributorId: new ObjectId(session.user.id) })
    .sort({ truckNumber: 1 })
    .toArray();

  return trucks.map((truck) => ({
    ...truck,
    _id: truck._id?.toString(),
    distributorId: truck.distributorId.toString(),
    assignedOrderIds:
      truck.assignedOrderIds
        ?.filter((id) => id !== null)
        .map((id) => id.toString()) || [],
    availableCapacityKg: truck.capacityKg - truck.currentLoadKg,
    loadPercentage: (truck.currentLoadKg / truck.capacityKg) * 100,
  }));
}

export async function getTrucksByStatus(
  status: TruckStatus
): Promise<FleetSerialized[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();
  const trucks = await collection
    .find({
      distributorId: new ObjectId(session.user.id),
      status,
    })
    .sort({ truckNumber: 1 })
    .toArray();

  return trucks.map((truck) => ({
    ...truck,
    _id: truck._id?.toString(),
    distributorId: truck.distributorId.toString(),
    assignedOrderIds:
      truck.assignedOrderIds
        ?.filter((id) => id !== null)
        .map((id) => id.toString()) || [],
    availableCapacityKg: truck.capacityKg - truck.currentLoadKg,
    loadPercentage: (truck.currentLoadKg / truck.capacityKg) * 100,
  }));
}

export async function addTruck(data: {
  truckNumber: string;
  driver: string;
  driverContact: string;
  capacityKg: number;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();

  const newTruck: Fleet = {
    distributorId: new ObjectId(session.user.id),
    truckNumber: data.truckNumber,
    driver: data.driver,
    driverContact: data.driverContact,
    status: "available",
    capacityKg: data.capacityKg,
    currentLoadKg: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(newTruck);

  revalidatePath("/dashboard/distributor");
  return { success: true, id: result.insertedId.toString() };
}

export async function updateTruckStatus(
  truckId: string,
  status: TruckStatus,
  location?: string,
  destination?: string,
  eta?: Date,
  temperatureC?: number
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();

  const updateData: Partial<Fleet> = {
    status,
    updatedAt: new Date(),
  };

  if (location) updateData.currentLocation = location;
  if (destination) updateData.destination = destination;
  if (eta) updateData.eta = eta;
  if (temperatureC !== undefined) updateData.temperatureC = temperatureC;

  await collection.updateOne(
    {
      _id: new ObjectId(truckId),
      distributorId: new ObjectId(session.user.id),
    },
    { $set: updateData }
  );

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function assignTruckToOrder(truckId: string, orderId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();

  await collection.updateOne(
    {
      _id: new ObjectId(truckId),
      distributorId: new ObjectId(session.user.id),
    },
    {
      $set: {
        assignedOrderId: new ObjectId(orderId),
        status: "on-route",
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function getFleetStats() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "distributor") {
    throw new Error("Unauthorized");
  }

  const collection = await getFleetCollection();

  const [total, available, onRoute, maintenance] = await Promise.all([
    collection.countDocuments({ distributorId: new ObjectId(session.user.id) }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "available",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "on-route",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(session.user.id),
      status: "maintenance",
    }),
  ]);

  return {
    total,
    available,
    onRoute,
    maintenance,
  };
}
