"use server";

import { Shipment } from "@/models/Shipment";
import { requireAuth } from "@/services/auth.service";
import { shipmentRepository } from "@/repositories/shipment.repository";
import { serializeDocument } from "@/lib/serialization";
import { ObjectId } from "mongodb";

/**
 * Get all shipments for the current farmer
 */
export async function getMyShipments() {
  try {
    const { userId } = await requireAuth();

    const shipments = await shipmentRepository.findByFarmerId(userId);

    return {
      success: true,
      data: shipments.map((shipment) => serializeDocument(shipment)),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error fetching shipments:", error);
    return { success: false, error: "Failed to fetch shipments" };
  }
}

/**
 * Create a new shipment
 */
export async function createShipment(data: {
  orderId?: string;
  origin: string;
  destination: string;
  temperatureC: number;
  eta: Date;
}) {
  try {
    const { userId } = await requireAuth();

    const shipment: Omit<Shipment, "_id"> = {
      farmerId: new ObjectId(userId),
      orderId: data.orderId ? new ObjectId(data.orderId) : undefined,
      origin: data.origin,
      destination: data.destination,
      status: "in-transit",
      temperatureC: data.temperatureC,
      eta: new Date(data.eta),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await shipmentRepository.create(shipment);

    return {
      success: true,
      data: serializeDocument({
        ...shipment,
        _id: result.insertedId,
      }),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error creating shipment:", error);
    return { success: false, error: "Failed to create shipment" };
  }
}

/**
 * Update shipment status
 */
export async function updateShipmentStatus(
  shipmentId: string,
  status: "in-transit" | "delivered" | "delayed"
) {
  try {
    const { userId } = await requireAuth();

    // Verify the shipment belongs to this farmer
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment || shipment.farmerId.toString() !== userId) {
      return { success: false, error: "Shipment not found or unauthorized" };
    }

    const result = await shipmentRepository.updateStatus(shipmentId, status);

    return { success: result.success };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error updating shipment:", error);
    return { success: false, error: "Failed to update shipment" };
  }
}
