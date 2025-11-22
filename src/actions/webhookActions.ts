"use server";

import { triggerWebhook, WebhookPayload, WebhookEvent } from "@/lib/webhooks";
import { getUsersCollection } from "@/models/User";
import { ObjectId } from "mongodb";

/**
 * Trigger order webhook with user details
 */
export async function triggerOrderWebhook(params: {
  event: WebhookEvent;
  orderId: string;
  farmerId?: string;
  retailerId?: string;
  distributorId?: string;
  produceName: string;
  quantity: number;
  unit: string;
  status: string;
  deliveryFee?: number;
  destination?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const usersCollection = await getUsersCollection();

    // Fetch user details for notifications and emails
    const [farmer, retailer, distributor] = await Promise.all([
      params.farmerId
        ? usersCollection.findOne({ _id: new ObjectId(params.farmerId) })
        : null,
      params.retailerId
        ? usersCollection.findOne({ _id: new ObjectId(params.retailerId) })
        : null,
      params.distributorId
        ? usersCollection.findOne({ _id: new ObjectId(params.distributorId) })
        : null,
    ]);

    const payload: WebhookPayload = {
      event: params.event,
      timestamp: new Date(),
      data: {
        orderId: params.orderId,
        farmerId: params.farmerId,
        retailerId: params.retailerId,
        distributorId: params.distributorId,
        produceName: params.produceName,
        quantity: params.quantity,
        unit: params.unit,
        status: params.status,
        farmerEmail: farmer?.email || undefined,
        farmerName: farmer?.name || undefined,
        retailerEmail: retailer?.email || undefined,
        retailerName: retailer?.name || undefined,
        distributorEmail: distributor?.email || undefined,
        distributorName: distributor?.name || undefined,
        deliveryFee: params.deliveryFee,
        destination: params.destination,
      },
    };

    await triggerWebhook(payload);

    return { success: true };
  } catch (error) {
    console.error("[WebhookActions] Error triggering webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
