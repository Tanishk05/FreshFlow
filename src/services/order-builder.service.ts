/**
 * Order Builder Service
 * Implements Builder Pattern for complex order creation
 * Provides a fluent interface for constructing orders step by step
 */

import type { Order, SubscriptionTier } from "@/models/Order";
import { ObjectId } from "mongodb";
import { pricingStrategy } from "./pricing-strategy.service";
import { getDeliveryDistance } from "@/lib/distanceCalculator";
import { getWeightInKg } from "@/lib/deliveryFeeCalculator";
import { calculateBulkDiscount } from "@/lib/pricing";
import type { Produce } from "@/models/Produce";
import type { User } from "@/models/User";

export interface OrderBuilderConfig {
  produce: Produce;
  retailer: User;
  farmer: User;
  quantity: number;
  notes?: string;
  subscriptionTier?: SubscriptionTier;
}

export class OrderBuilder {
  private order: Partial<Order> = {};
  private config: OrderBuilderConfig | null = null;
  private distance: number | undefined;
  private estimatedTime: number | undefined;
  private estimatedTimeText: string | undefined;

  /**
   * Initialize builder with required configuration
   */
  initialize(config: OrderBuilderConfig): this {
    this.config = config;
    this.order = {
      farmerId: config.produce.userId,
      retailerId: new ObjectId(config.retailer._id!.toString()),
      produceId: new ObjectId(config.produce._id!.toString()),
      produceName: config.produce.name,
      quantity: config.quantity,
      unit: config.produce.unit,
      pricePerUnit: config.produce.pricePerUnit,
      status: "pending",
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: config.notes,
    };
    return this;
  }

  /**
   * Calculate and set distance between farmer and retailer
   */
  async calculateDistance(): Promise<this> {
    if (!this.config) {
      throw new Error("Builder not initialized. Call initialize() first.");
    }

    const { farmer, retailer } = this.config;

    if (
      farmer?.address?.latitude &&
      farmer?.address?.longitude &&
      retailer?.address?.latitude &&
      retailer?.address?.longitude
    ) {
      try {
        const result = await getDeliveryDistance(
          farmer.address.latitude,
          farmer.address.longitude,
          retailer.address.latitude,
          retailer.address.longitude
        );
        this.distance = result.distance;
        this.estimatedTime = result.duration;
        this.estimatedTimeText = result.durationText;
      } catch (error) {
        console.error("Error calculating distance:", error);
        // Fallback to estimated distance
        this.distance = Math.floor(Math.random() * 45) + 5;
      }
    } else {
      // Fallback to estimated distance
      this.distance = Math.floor(Math.random() * 45) + 5;
    }

    this.order.distance = this.distance;
    this.order.estimatedTime = this.estimatedTime;
    this.order.estimatedTimeText = this.estimatedTimeText;

    return this;
  }

  /**
   * Calculate and set pricing breakdown
   */
  calculatePricing(): this {
    if (!this.config) {
      throw new Error("Builder not initialized. Call initialize() first.");
    }

    const { produce, quantity, subscriptionTier = "free" } = this.config;
    const distance = this.distance || Math.floor(Math.random() * 45) + 5;
    const weightKg = getWeightInKg(quantity, produce.unit);

    // Calculate bulk discount
    const bulkDiscountRate = calculateBulkDiscount(quantity);
    const bulkDiscountAmount =
      produce.pricePerUnit * quantity * bulkDiscountRate;

    // Calculate complete pricing using strategy
    const pricing = pricingStrategy.calculateOrderPricing(
      produce.pricePerUnit,
      quantity,
      distance,
      weightKg,
      subscriptionTier
    );

    // Set pricing fields
    this.order.totalPrice = pricing.productSubtotal;
    this.order.platformCommission = pricing.platformCommission;
    this.order.serviceFee = pricing.serviceFee;
    this.order.deliveryFee = pricing.deliveryFee.subtotal;
    this.order.deliveryDiscount = pricing.deliveryFee.discount;
    this.order.finalDeliveryFee = pricing.deliveryFee.final;
    this.order.subscriptionDiscount =
      pricing.customerSavings - pricing.deliveryFee.discount;
    this.order.bulkDiscount = bulkDiscountAmount;

    // Revenue distribution
    this.order.farmerRevenue = pricing.farmerRevenue;
    this.order.distributorRevenue = pricing.distributorRevenue;
    this.order.platformRevenue = pricing.platformRevenue;

    // Subscription and loyalty
    this.order.retailerSubscriptionTier = subscriptionTier;

    return this;
  }

  /**
   * Calculate and set loyalty points
   */
  async calculateLoyaltyPoints(
    loyaltyData: {
      tier: string;
      currentBalance: number;
    } | null
  ): Promise<this> {
    if (!this.config) {
      throw new Error("Builder not initialized. Call initialize() first.");
    }

    const pricing = this.getPricingBreakdown();
    if (!pricing) {
      throw new Error("Pricing not calculated. Call calculatePricing() first.");
    }

    const tier = (loyaltyData?.tier || "bronze") as
      | "bronze"
      | "silver"
      | "gold"
      | "platinum";
    const { calculatePointsFromPurchase } = await import(
      "@/models/LoyaltyPoints"
    );
    const pointsEarned = calculatePointsFromPurchase(
      pricing.customerTotal,
      tier
    );

    this.order.loyaltyPointsEarned = pointsEarned;

    return this;
  }

  /**
   * Set delivery address information
   */
  setDeliveryAddress(): this {
    if (!this.config) {
      throw new Error("Builder not initialized. Call initialize() first.");
    }

    const { retailer } = this.config;

    if (retailer.address) {
      this.order.destination = retailer.address.city || "Unknown Location";
      this.order.deliveryAddress = `${retailer.address.street || ""}, ${
        retailer.address.city || ""
      }, ${retailer.address.state || ""} ${
        retailer.address.pincode || ""
      }`.trim();
    } else {
      this.order.destination = retailer.name || "Unknown Location";
      this.order.deliveryAddress = retailer.phone || "Address not provided";
    }

    return this;
  }

  /**
   * Set estimated delivery date
   */
  async setEstimatedDelivery(): Promise<this> {
    if (this.distance) {
      const { estimateDeliveryTime } = await import(
        "@/lib/deliveryFeeCalculator"
      );
      this.order.estimatedDelivery = estimateDeliveryTime(this.distance);
    }
    return this;
  }

  /**
   * Build the final order object
   */
  async build(): Promise<Omit<Order, "_id">> {
    if (!this.config) {
      throw new Error("Builder not initialized. Call initialize() first.");
    }

    // Ensure all required fields are set
    if (!this.order.totalPrice) {
      this.calculatePricing();
    }

    if (!this.order.destination) {
      this.setDeliveryAddress();
    }

    if (!this.order.estimatedDelivery) {
      await this.setEstimatedDelivery();
    }

    return this.order as Omit<Order, "_id">;
  }

  /**
   * Get pricing breakdown (helper method)
   */
  private getPricingBreakdown() {
    if (!this.config) return null;

    const { produce, quantity, subscriptionTier = "free" } = this.config;
    const distance = this.distance || Math.floor(Math.random() * 45) + 5;
    const weightKg = getWeightInKg(quantity, produce.unit);

    return pricingStrategy.calculateOrderPricing(
      produce.pricePerUnit,
      quantity,
      distance,
      weightKg,
      subscriptionTier
    );
  }

  /**
   * Reset builder for reuse
   */
  reset(): this {
    this.order = {};
    this.config = null;
    this.distance = undefined;
    this.estimatedTime = undefined;
    this.estimatedTimeText = undefined;
    return this;
  }
}

/**
 * Order Builder Factory
 * Provides convenient factory methods for common order building scenarios
 */
export class OrderBuilderFactory {
  /**
   * Create a builder for a standard order
   */
  static createStandardBuilder(): OrderBuilder {
    return new OrderBuilder();
  }

  /**
   * Create and build a complete order in one call
   */
  static async buildCompleteOrder(
    config: OrderBuilderConfig,
    loyaltyData?: { tier: string; currentBalance: number } | null
  ): Promise<Omit<Order, "_id">> {
    const builder = new OrderBuilder();
    await builder.initialize(config).calculateDistance();
    builder.calculatePricing();
    if (loyaltyData) {
      await builder.calculateLoyaltyPoints(loyaltyData);
    }
    builder.setDeliveryAddress();
    await builder.setEstimatedDelivery();
    return await builder.build();
  }
}
