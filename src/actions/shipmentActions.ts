"use server";

import { getShipmentsCollection, Shipment } from "@/models/Shipment";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

/**
 * Get all shipments for the current farmer
 */
export async function getMyShipments() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const shipmentsCollection = await getShipmentsCollection();
    const farmerId = new ObjectId(session.user.id);

    const shipments = await shipmentsCollection
      .find({ farmerId })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: shipments.map((shipment) => ({
        ...shipment,
        _id: shipment._id!.toString(),
        farmerId: shipment.farmerId.toString(),
        orderId: shipment.orderId?.toString(),
      })),
    };
  } catch (error) {
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
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const shipmentsCollection = await getShipmentsCollection();

    const shipment: Shipment = {
      farmerId: new ObjectId(session.user.id),
      orderId: data.orderId ? new ObjectId(data.orderId) : undefined,
      origin: data.origin,
      destination: data.destination,
      status: "in-transit",
      temperatureC: data.temperatureC,
      eta: new Date(data.eta),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await shipmentsCollection.insertOne(shipment);

    return {
      success: true,
      data: {
        ...shipment,
        _id: result.insertedId.toString(),
        farmerId: shipment.farmerId.toString(),
        orderId: shipment.orderId?.toString(),
      },
    };
  } catch (error) {
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
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const shipmentsCollection = await getShipmentsCollection();
    const farmerId = new ObjectId(session.user.id);

    // Verify the shipment belongs to this farmer
    const shipment = await shipmentsCollection.findOne({
      _id: new ObjectId(shipmentId),
      farmerId,
    });

    if (!shipment) {
      return { success: false, error: "Shipment not found" };
    }

    await shipmentsCollection.updateOne(
      { _id: new ObjectId(shipmentId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating shipment:", error);
    return { success: false, error: "Failed to update shipment" };
  }
}
