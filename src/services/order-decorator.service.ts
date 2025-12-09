/**
 * Order Decorator Service
 * Implements Decorator Pattern for enhancing order objects with additional functionality
 * Allows dynamic addition of features without modifying base order structure
 */

import type { Order } from "@/models/Order";
import { serializeDocument } from "@/lib/serialization";
import { userRepository } from "@/repositories/user.repository";

export interface EnhancedOrder extends Order {
  [key: string]: any;
  retailerName?: string;
  farmerName?: string;
  distributorName?: string;
  statusBadge?: string;
  statusColor?: string;
  formattedPrice?: string;
  formattedDate?: string;
  estimatedDeliveryText?: string;
}

/**
 * Base Order Decorator
 */
export abstract class OrderDecorator {
  protected order: Order;

  constructor(order: Order) {
    this.order = order;
  }

  abstract decorate(): Promise<EnhancedOrder>;
}

/**
 * Name Enrichment Decorator
 * Adds retailer, farmer, and distributor names to order
 */
export class NameEnrichmentDecorator extends OrderDecorator {
  async decorate(): Promise<EnhancedOrder> {
    const enriched: EnhancedOrder = {
      ...this.order,
      ...serializeDocument(this.order),
    };

    // Add farmer name
    const farmer = await userRepository.findById(
      this.order.farmerId.toString()
    );
    enriched.farmerName = farmer?.name || "Unknown Farmer";

    // Add retailer name
    if (this.order.retailerId) {
      const retailer = await userRepository.findById(
        this.order.retailerId.toString()
      );
      enriched.retailerName = retailer?.name || "Unknown Retailer";
    }

    // Add distributor name
    if (this.order.distributorId) {
      const distributor = await userRepository.findById(
        this.order.distributorId.toString()
      );
      enriched.distributorName = distributor?.name || "Unknown Distributor";
    }

    return enriched;
  }
}

/**
 * Status Enhancement Decorator
 * Adds status badges and colors
 */
export class StatusEnhancementDecorator extends OrderDecorator {
  private statusConfig: Record<string, { badge: string; color: string }> = {
    pending: { badge: "⏳ Pending", color: "yellow" },
    approved: { badge: "✅ Approved", color: "green" },
    assigned: { badge: "📦 Assigned", color: "blue" },
    "picked-up": { badge: "🚚 Picked Up", color: "blue" },
    "in-transit": { badge: "🚛 In Transit", color: "purple" },
    delivered: { badge: "✓ Delivered", color: "green" },
    cancelled: { badge: "❌ Cancelled", color: "red" },
    rejected: { badge: "⚠️ Rejected", color: "orange" },
  };

  async decorate(): Promise<EnhancedOrder> {
    const config = this.statusConfig[this.order.status] || {
      badge: this.order.status,
      color: "gray",
    };

    return {
      ...this.order,
      statusBadge: config.badge,
      statusColor: config.color,
    };
  }
}

/**
 * Formatting Decorator
 * Adds formatted display values
 */
export class FormattingDecorator extends OrderDecorator {
  async decorate(): Promise<EnhancedOrder> {
    const formatted: EnhancedOrder = {
      ...this.order,
      formattedPrice: `₹${this.order.totalPrice.toLocaleString("en-IN")}`,
      formattedDate: new Date(this.order.orderDate).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ),
    };

    if (this.order.estimatedDelivery) {
      formatted.estimatedDeliveryText = new Date(
        this.order.estimatedDelivery
      ).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return formatted;
  }
}

/**
 * Delivery Info Decorator
 * Adds delivery-related information
 */
export class DeliveryInfoDecorator extends OrderDecorator {
  async decorate(): Promise<EnhancedOrder> {
    const deliveryInfo: EnhancedOrder = {
      ...this.order,
    };

    if (this.order.distance) {
      deliveryInfo.distanceText = `${this.order.distance.toFixed(1)} km`;
    }

    if (this.order.deliveryFee) {
      deliveryInfo.deliveryFeeText = `₹${this.order.deliveryFee.toFixed(2)}`;
    }

    if (this.order.estimatedTimeText) {
      deliveryInfo.estimatedTimeText = this.order.estimatedTimeText;
    }

    return deliveryInfo;
  }
}

/**
 * Order Decorator Factory
 * Creates decorator chains for different use cases
 */
export class OrderDecoratorFactory {
  /**
   * Create fully decorated order for display
   */
  static async createFullyDecorated(order: Order): Promise<EnhancedOrder> {
    let decorated: EnhancedOrder = order;

    // Apply decorators in sequence
    const nameDecorator = new NameEnrichmentDecorator(decorated);
    decorated = await nameDecorator.decorate();

    const statusDecorator = new StatusEnhancementDecorator(decorated);
    decorated = await statusDecorator.decorate();

    const formattingDecorator = new FormattingDecorator(decorated);
    decorated = await formattingDecorator.decorate();

    const deliveryDecorator = new DeliveryInfoDecorator(decorated);
    decorated = await deliveryDecorator.decorate();

    return decorated;
  }

  /**
   * Create minimal decorated order (names only)
   */
  static async createMinimalDecorated(order: Order): Promise<EnhancedOrder> {
    const nameDecorator = new NameEnrichmentDecorator(order);
    return await nameDecorator.decorate();
  }

  /**
   * Create display-ready order (with formatting)
   */
  static async createDisplayReady(order: Order): Promise<EnhancedOrder> {
    let decorated: EnhancedOrder = order;

    const nameDecorator = new NameEnrichmentDecorator(decorated);
    decorated = await nameDecorator.decorate();

    const statusDecorator = new StatusEnhancementDecorator(decorated);
    decorated = await statusDecorator.decorate();

    const formattingDecorator = new FormattingDecorator(decorated);
    decorated = await formattingDecorator.decorate();

    return decorated;
  }
}
