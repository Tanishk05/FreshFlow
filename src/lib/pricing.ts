// src/lib/pricing.ts
/**
 * Pricing and Fee Calculation Utilities
 * Implements the FreshFlow pricing strategy
 */

import type { SubscriptionTier } from "@/models/Subscription";

export interface PricingConfig {
  // Platform fees
  platformCommissionRate: number; // 0.03 = 3%, 0.04 = 4%, 0.05 = 5%
  serviceFeeFlatRate: number; // Fixed fee per order (e.g., ₹25)

  // Delivery pricing
  deliveryBaseFee: number; // Base delivery fee (e.g., ₹80)
  deliveryPerKmRate: number; // Per km rate (e.g., ₹12)
  deliveryWeightThreshold: number; // kg threshold for surcharge (e.g., 50kg)
  deliveryWeightSurchargeRate: number; // Rate per 10kg above threshold (e.g., ₹5)

  // Free delivery thresholds
  freeDeliveryThreshold: number; // Order value for 100% free delivery (e.g., ₹2000)
  halfPriceDeliveryThreshold: number; // Order value for 50% off delivery (e.g., ₹1500)
  quarterPriceDeliveryThreshold: number; // Order value for 25% off delivery (e.g., ₹1000)

  // Subscription discounts
  subscriptionDiscounts: {
    free: number; // 0% discount
    pro: number; // e.g., 0.05 = 5%
    premium: number; // e.g., 0.10 = 10%
  };
}

// Free delivery thresholds by subscription tier
export const FREE_DELIVERY_THRESHOLDS: Record<SubscriptionTier, number> = {
  free: 2000,
  pro: 2000,
  premium: 2000,
  business: 1500,
  enterprise: 1000,
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  platformCommissionRate: 0.04, // 4%
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

/**
 * Calculate delivery fee with free delivery threshold logic
 */
export function calculateDeliveryFee(
  distance: number,
  weightKg: number,
  orderValue: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): DeliveryFeeCalculation {
  // Base calculations
  const baseFee = config.deliveryBaseFee;
  const distanceFee = distance * config.deliveryPerKmRate;

  // Weight surcharge (only if above threshold)
  const excessWeight = Math.max(0, weightKg - config.deliveryWeightThreshold);
  const weightSurcharge =
    (excessWeight / 10) * config.deliveryWeightSurchargeRate;

  const subtotal = baseFee + distanceFee + weightSurcharge;

  // Apply free delivery thresholds
  let discountPercentage = 0;
  let appliedThreshold: "free" | "half" | "quarter" | undefined;

  if (orderValue >= config.freeDeliveryThreshold) {
    discountPercentage = 1.0; // 100% discount
    appliedThreshold = "free";
  } else if (orderValue >= config.halfPriceDeliveryThreshold) {
    discountPercentage = 0.5; // 50% discount
    appliedThreshold = "half";
  } else if (orderValue >= config.quarterPriceDeliveryThreshold) {
    discountPercentage = 0.25; // 25% discount
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

export interface OrderPriceBreakdown {
  // Product pricing
  productSubtotal: number;
  platformCommission: number;
  farmerRevenue: number;

  // Delivery pricing
  deliveryFee: DeliveryFeeCalculation;
  distributorRevenue: number;

  // Platform revenue
  serviceFee: number;
  platformRevenue: number;

  // Totals
  customerTotal: number;
  customerSavings: number;
}

/**
 * Calculate complete order price breakdown
 */
export function calculateOrderPricing(
  productPrice: number,
  quantity: number,
  distance: number,
  weightKg: number,
  subscriptionTier: "free" | "pro" | "premium" = "free",
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): OrderPriceBreakdown {
  // Apply subscription discount to product price
  const subscriptionDiscount = config.subscriptionDiscounts[subscriptionTier];
  const productSubtotal = productPrice * quantity * (1 - subscriptionDiscount);

  // Platform commission (taken from product value)
  const platformCommission = productSubtotal * config.platformCommissionRate;
  const farmerRevenue = productSubtotal - platformCommission;

  // Delivery fee calculation
  const deliveryFee = calculateDeliveryFee(
    distance,
    weightKg,
    productSubtotal,
    config
  );

  // Distributor gets the actual delivery fee (platform subsidizes if free)
  const distributorRevenue = deliveryFee.subtotal;

  // Service fee
  const serviceFee = config.serviceFeeFlatRate;

  // Platform revenue (commission + service fee - delivery subsidy)
  const deliverySubsidy = deliveryFee.discount;
  const platformRevenue = platformCommission + serviceFee - deliverySubsidy;

  // Customer total and savings
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

/**
 * Get the next free delivery threshold message
 */
export function getFreeDeliveryMessage(
  currentValue: number,
  subscriptionTier: SubscriptionTier = "free"
): {
  eligible: boolean;
  message: string;
  amountNeeded: number;
  threshold: number;
} {
  const threshold =
    FREE_DELIVERY_THRESHOLDS[subscriptionTier] || FREE_DELIVERY_THRESHOLDS.free;
  const eligible = currentValue >= threshold;
  const amountNeeded = Math.max(0, threshold - currentValue);

  let message = "";
  if (eligible) {
    message = "You've unlocked FREE delivery!";
  } else {
    message = `Add ₹${amountNeeded.toFixed(0)} more for FREE delivery!`;
  }

  return {
    eligible,
    message,
    amountNeeded,
    threshold,
  };
}

/**
 * Calculate bulk order discount
 */
export function calculateBulkDiscount(quantity: number): number {
  if (quantity >= 500) return 0.15; // 15% off
  if (quantity >= 100) return 0.1; // 10% off
  if (quantity >= 50) return 0.05; // 5% off
  return 0; // No discount
}

/**
 * Format price breakdown for display
 */
export function formatPriceBreakdown(breakdown: OrderPriceBreakdown) {
  return {
    items: [
      {
        label: "Product Subtotal",
        value: breakdown.productSubtotal,
        type: "product" as const,
      },
      {
        label: "Delivery Fee",
        value: breakdown.deliveryFee.subtotal,
        originalValue: breakdown.deliveryFee.subtotal,
        discount: breakdown.deliveryFee.discount,
        finalValue: breakdown.deliveryFee.final,
        type: "delivery" as const,
      },
      {
        label: "Service Fee",
        value: breakdown.serviceFee,
        type: "service" as const,
      },
    ],
    savings: breakdown.customerSavings,
    total: breakdown.customerTotal,
  };
}
