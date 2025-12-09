/**
 * Pricing Strategy Service
 * Implements Strategy Pattern for different pricing calculation strategies
 * Allows easy switching between pricing models
 */

import type { SubscriptionTier } from "@/models/Subscription";

export interface PricingStrategy {
  calculateDeliveryFee(
    distance: number,
    weightKg: number,
    orderValue: number
  ): DeliveryFeeCalculation;

  calculateOrderPricing(
    productPrice: number,
    quantity: number,
    distance: number,
    weightKg: number,
    subscriptionTier: SubscriptionTier
  ): OrderPriceBreakdown;

  getName(): string;
}

export interface DeliveryFeeCalculation {
  baseFee: number;
  distanceFee: number;
  weightSurcharge: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  final: number;
  isFree: boolean;
  appliedThreshold?: "free" | "half" | "quarter";
}

export interface OrderPriceBreakdown {
  productSubtotal: number;
  platformCommission: number;
  farmerRevenue: number;
  deliveryFee: DeliveryFeeCalculation;
  distributorRevenue: number;
  serviceFee: number;
  platformRevenue: number;
  customerTotal: number;
  customerSavings: number;
}

/**
 * Standard Pricing Strategy (Default)
 * Uses tiered delivery thresholds and subscription discounts
 */
export class StandardPricingStrategy implements PricingStrategy {
  private config = {
    platformCommissionRate: 0.04,
    serviceFeeFlatRate: 25,
    deliveryBaseFee: 80,
    deliveryPerKmRate: 12,
    deliveryWeightThreshold: 50,
    deliveryWeightSurchargeRate: 5,
    freeDeliveryThreshold: 2000,
    halfPriceDeliveryThreshold: 1500,
    quarterPriceDeliveryThreshold: 1000,
    subscriptionDiscounts: {
      free: 0,
      pro: 0.05,
      premium: 0.1,
    },
  };

  calculateDeliveryFee(
    distance: number,
    weightKg: number,
    orderValue: number
  ): DeliveryFeeCalculation {
    const baseFee = this.config.deliveryBaseFee;
    const distanceFee = distance * this.config.deliveryPerKmRate;
    const excessWeight = Math.max(
      0,
      weightKg - this.config.deliveryWeightThreshold
    );
    const weightSurcharge =
      (excessWeight / 10) * this.config.deliveryWeightSurchargeRate;
    const subtotal = baseFee + distanceFee + weightSurcharge;

    let discountPercentage = 0;
    let appliedThreshold: "free" | "half" | "quarter" | undefined;

    if (orderValue >= this.config.freeDeliveryThreshold) {
      discountPercentage = 1.0;
      appliedThreshold = "free";
    } else if (orderValue >= this.config.halfPriceDeliveryThreshold) {
      discountPercentage = 0.5;
      appliedThreshold = "half";
    } else if (orderValue >= this.config.quarterPriceDeliveryThreshold) {
      discountPercentage = 0.25;
      appliedThreshold = "quarter";
    }

    const discount = subtotal * discountPercentage;
    const final = Math.max(0, subtotal - discount);

    return {
      baseFee,
      distanceFee,
      weightSurcharge,
      subtotal,
      discount,
      discountPercentage,
      final,
      isFree: discountPercentage === 1.0,
      appliedThreshold,
    };
  }

  calculateOrderPricing(
    productPrice: number,
    quantity: number,
    distance: number,
    weightKg: number,
    subscriptionTier: SubscriptionTier
  ): OrderPriceBreakdown {
    const subscriptionDiscount =
      this.config.subscriptionDiscounts[subscriptionTier as keyof typeof this.config.subscriptionDiscounts] || 0;
    const productSubtotal =
      productPrice * quantity * (1 - subscriptionDiscount);
    const platformCommission =
      productSubtotal * this.config.platformCommissionRate;
    const farmerRevenue = productSubtotal - platformCommission;

    const deliveryFee = this.calculateDeliveryFee(
      distance,
      weightKg,
      productSubtotal
    );
    const distributorRevenue = deliveryFee.subtotal;
    const serviceFee = this.config.serviceFeeFlatRate;
    const deliverySubsidy = deliveryFee.discount;
    const platformRevenue = platformCommission + serviceFee - deliverySubsidy;
    const customerTotal = productSubtotal + deliveryFee.final + serviceFee;
    const customerSavings =
      deliveryFee.discount + productPrice * quantity * subscriptionDiscount;

    return {
      productSubtotal,
      platformCommission,
      farmerRevenue,
      deliveryFee,
      distributorRevenue,
      serviceFee,
      platformRevenue,
      customerTotal,
      customerSavings,
    };
  }

  getName(): string {
    return "standard";
  }
}

/**
 * Premium Pricing Strategy
 * Higher base fees but better discounts for premium customers
 */
export class PremiumPricingStrategy implements PricingStrategy {
  private config = {
    platformCommissionRate: 0.03, // Lower commission
    serviceFeeFlatRate: 20,
    deliveryBaseFee: 100,
    deliveryPerKmRate: 10,
    deliveryWeightThreshold: 50,
    deliveryWeightSurchargeRate: 4,
    freeDeliveryThreshold: 1500, // Lower threshold
    halfPriceDeliveryThreshold: 1000,
    quarterPriceDeliveryThreshold: 750,
    subscriptionDiscounts: {
      free: 0,
      pro: 0.08,
      premium: 0.15,
    },
  };

  calculateDeliveryFee(
    distance: number,
    weightKg: number,
    orderValue: number
  ): DeliveryFeeCalculation {
    const baseFee = this.config.deliveryBaseFee;
    const distanceFee = distance * this.config.deliveryPerKmRate;
    const excessWeight = Math.max(
      0,
      weightKg - this.config.deliveryWeightThreshold
    );
    const weightSurcharge =
      (excessWeight / 10) * this.config.deliveryWeightSurchargeRate;
    const subtotal = baseFee + distanceFee + weightSurcharge;

    let discountPercentage = 0;
    let appliedThreshold: "free" | "half" | "quarter" | undefined;

    if (orderValue >= this.config.freeDeliveryThreshold) {
      discountPercentage = 1.0;
      appliedThreshold = "free";
    } else if (orderValue >= this.config.halfPriceDeliveryThreshold) {
      discountPercentage = 0.5;
      appliedThreshold = "half";
    } else if (orderValue >= this.config.quarterPriceDeliveryThreshold) {
      discountPercentage = 0.25;
      appliedThreshold = "quarter";
    }

    const discount = subtotal * discountPercentage;
    const final = Math.max(0, subtotal - discount);

    return {
      baseFee,
      distanceFee,
      weightSurcharge,
      subtotal,
      discount,
      discountPercentage,
      final,
      isFree: discountPercentage === 1.0,
      appliedThreshold,
    };
  }

  calculateOrderPricing(
    productPrice: number,
    quantity: number,
    distance: number,
    weightKg: number,
    subscriptionTier: SubscriptionTier
  ): OrderPriceBreakdown {
    const subscriptionDiscount =
      this.config.subscriptionDiscounts[subscriptionTier as keyof typeof this.config.subscriptionDiscounts] || 0;
    const productSubtotal =
      productPrice * quantity * (1 - subscriptionDiscount);
    const platformCommission =
      productSubtotal * this.config.platformCommissionRate;
    const farmerRevenue = productSubtotal - platformCommission;

    const deliveryFee = this.calculateDeliveryFee(
      distance,
      weightKg,
      productSubtotal
    );
    const distributorRevenue = deliveryFee.subtotal;
    const serviceFee = this.config.serviceFeeFlatRate;
    const deliverySubsidy = deliveryFee.discount;
    const platformRevenue = platformCommission + serviceFee - deliverySubsidy;
    const customerTotal = productSubtotal + deliveryFee.final + serviceFee;
    const customerSavings =
      deliveryFee.discount + productPrice * quantity * subscriptionDiscount;

    return {
      productSubtotal,
      platformCommission,
      farmerRevenue,
      deliveryFee,
      distributorRevenue,
      serviceFee,
      platformRevenue,
      customerTotal,
      customerSavings,
    };
  }

  getName(): string {
    return "premium";
  }
}

/**
 * Pricing Strategy Context
 * Manages which strategy to use
 */
export class PricingStrategyContext {
  private strategy: PricingStrategy;

  constructor(strategy: PricingStrategy = new StandardPricingStrategy()) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  getStrategy(): PricingStrategy {
    return this.strategy;
  }

  calculateDeliveryFee(
    distance: number,
    weightKg: number,
    orderValue: number
  ): DeliveryFeeCalculation {
    return this.strategy.calculateDeliveryFee(distance, weightKg, orderValue);
  }

  calculateOrderPricing(
    productPrice: number,
    quantity: number,
    distance: number,
    weightKg: number,
    subscriptionTier: SubscriptionTier
  ): OrderPriceBreakdown {
    return this.strategy.calculateOrderPricing(
      productPrice,
      quantity,
      distance,
      weightKg,
      subscriptionTier
    );
  }
}

// Export singleton with default strategy
export const pricingStrategy = new PricingStrategyContext();
