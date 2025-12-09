/**
 * Order Enrichment Service
 * Single Responsibility: Enrich orders with related data (user names, etc.)
 */

import { userRepository } from "@/repositories/user.repository";
import type { Order } from "@/models/Order";
import { serializeDocument } from "@/lib/serialization";

export interface EnrichedOrder {
  [key: string]: any;
  retailerName?: string;
  farmerName?: string;
}

/**
 * Enrich orders with retailer names
 */
export async function enrichOrdersWithRetailerNames(
  orders: Order[]
): Promise<EnrichedOrder[]> {
  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
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
        retailerName,
      };
    })
  );

  return enrichedOrders;
}

/**
 * Enrich orders with farmer names
 */
export async function enrichOrdersWithFarmerNames(
  orders: Order[]
): Promise<EnrichedOrder[]> {
  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const farmer = await userRepository.findById(order.farmerId.toString());
      const farmerName = farmer?.name || "Unknown Farmer";

      const serialized = serializeDocument(order);
      return {
        ...serialized,
        farmerName,
      };
    })
  );

  return enrichedOrders;
}

