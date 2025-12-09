"use server";

import {
  Fleet,
  FleetSerialized,
  TruckStatus,
} from "@/models/Fleet";
import { requireAuth } from "@/services/auth.service";
import { fleetRepository } from "@/repositories/fleet.repository";
import { serializeFleetArray } from "@/lib/serialization";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function getMyFleet(): Promise<FleetSerialized[]> {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const trucks = await fleetRepository.findByDistributorId(userId);
  
  // Sort by truck number
  trucks.sort((a, b) => a.truckNumber.localeCompare(b.truckNumber));

  return serializeFleetArray(trucks);
}

export async function getTrucksByStatus(
  status: TruckStatus
): Promise<FleetSerialized[]> {
  const { userId } = await requireAuth();

  const trucks = await fleetRepository.findMany({
    distributorId: userId,
    status,
  });
  
  // Sort by truck number
  trucks.sort((a, b) => a.truckNumber.localeCompare(b.truckNumber));

  return serializeFleetArray(trucks);
}

export async function addTruck(data: {
  truckNumber: string;
  driver: string;
  driverContact: string;
  capacityKg: number;
}) {
  const { userId } = await requireAuth();

  const newTruck: Omit<Fleet, "_id"> = {
    distributorId: new ObjectId(userId),
    truckNumber: data.truckNumber,
    driver: data.driver,
    driverContact: data.driverContact,
    status: "available",
    capacityKg: data.capacityKg,
    currentLoadKg: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await fleetRepository.create(newTruck);

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
  const { userId } = await requireAuth();

  // Verify ownership
  const truck = await fleetRepository.findById(truckId);
  if (!truck || truck.distributorId.toString() !== userId) {
    throw new Error("Unauthorized: Truck not found or access denied");
  }

  const updateData: Partial<Fleet> = {
    status,
  };

  if (location) updateData.currentLocation = location;
  if (destination) updateData.destination = destination;
  if (eta) updateData.eta = eta;
  if (temperatureC !== undefined) updateData.temperatureC = temperatureC;

  await fleetRepository.update(truckId, updateData);

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function assignTruckToOrder(truckId: string, orderId: string) {
  const { userId } = await requireAuth();

  // Verify ownership
  const truck = await fleetRepository.findById(truckId);
  if (!truck || truck.distributorId.toString() !== userId) {
    throw new Error("Unauthorized: Truck not found or access denied");
  }

  // Add order to assignedOrderIds if not already present
  const orderObjectId = new ObjectId(orderId);
  const assignedOrderIds = truck.assignedOrderIds || [];
  if (!assignedOrderIds.some(id => id.toString() === orderId)) {
    assignedOrderIds.push(orderObjectId);
  }

  await fleetRepository.update(truckId, {
    status: "on-route",
    assignedOrderIds,
  });

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function getFleetStats() {
  const { userId } = await requireAuth();

  const trucks = await fleetRepository.findByDistributorId(userId);

  const stats = {
    total: trucks.length,
    available: trucks.filter(t => t.status === "available").length,
    onRoute: trucks.filter(t => t.status === "on-route").length,
    maintenance: trucks.filter(t => t.status === "maintenance").length,
  };

  return stats;
}
