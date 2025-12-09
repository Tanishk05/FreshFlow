"use server";

import { triggerWebhook, WebhookPayload, WebhookEvent } from "@/lib/webhooks";
import { userRepository } from "@/repositories/user.repository";
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
    // Fetch user details for notifications and emails
    const [farmer, retailer, distributor] = await Promise.all([
      params.farmerId
        ? userRepository.findById(params.farmerId)
        : null,
      params.retailerId
        ? userRepository.findById(params.retailerId)
        : null,
      params.distributorId
        ? userRepository.findById(params.distributorId)
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
