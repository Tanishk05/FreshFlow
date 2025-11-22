/**
 * Delivery Fee Calculator
 * Calculates delivery fees based on distance, weight, and service type
 */

export type ServiceType = "standard" | "express" | "bulk";

export interface DeliveryFeeParams {
  distance: number; // in kilometers
  weight: number; // in kilograms
  serviceType?: ServiceType;
  isUrgent?: boolean;
}

export interface DeliveryFeeBreakdown {
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  serviceFee: number;
  urgentFee: number;
  totalFee: number;
}

// Fee structure constants (in INR)
const FEE_STRUCTURE = {
  // Base fees
  BASE_FEE: 50, // Minimum delivery fee

  // Distance-based fees (per km)
  DISTANCE_RATES: {
    SHORT: { max: 10, rate: 5 }, // 0-10 km: ₹5/km
    MEDIUM: { max: 50, rate: 4 }, // 11-50 km: ₹4/km
    LONG: { max: 100, rate: 3 }, // 51-100 km: ₹3/km
    VERY_LONG: { rate: 2.5 }, // 100+ km: ₹2.5/km
  },

  // Weight-based fees (per kg)
  WEIGHT_RATES: {
    LIGHT: { max: 50, rate: 0.5 }, // 0-50 kg: ₹0.5/kg
    MEDIUM: { max: 200, rate: 0.4 }, // 51-200 kg: ₹0.4/kg
    HEAVY: { max: 500, rate: 0.3 }, // 201-500 kg: ₹0.3/kg
    VERY_HEAVY: { rate: 0.25 }, // 500+ kg: ₹0.25/kg
  },

  // Service type multipliers
  SERVICE_MULTIPLIER: {
    standard: 1.0,
    express: 1.5, // 50% premium for express delivery
    bulk: 0.8, // 20% discount for bulk orders
  },

  // Additional fees
  URGENT_FEE: 100, // Flat ₹100 for urgent deliveries
};

/**
 * Calculate distance-based fee
 */
function calculateDistanceFee(distance: number): number {
  const { SHORT, MEDIUM, LONG, VERY_LONG } = FEE_STRUCTURE.DISTANCE_RATES;

  if (distance <= SHORT.max) {
    return distance * SHORT.rate;
  } else if (distance <= MEDIUM.max) {
    return SHORT.max * SHORT.rate + (distance - SHORT.max) * MEDIUM.rate;
  } else if (distance <= LONG.max) {
    return (
      SHORT.max * SHORT.rate +
      (MEDIUM.max - SHORT.max) * MEDIUM.rate +
      (distance - MEDIUM.max) * LONG.rate
    );
  } else {
    return (
      SHORT.max * SHORT.rate +
      (MEDIUM.max - SHORT.max) * MEDIUM.rate +
      (LONG.max - MEDIUM.max) * LONG.rate +
      (distance - LONG.max) * VERY_LONG.rate
    );
  }
}

/**
 * Calculate weight-based fee
 */
function calculateWeightFee(weight: number): number {
  const { LIGHT, MEDIUM, HEAVY, VERY_HEAVY } = FEE_STRUCTURE.WEIGHT_RATES;

  if (weight <= LIGHT.max) {
    return weight * LIGHT.rate;
  } else if (weight <= MEDIUM.max) {
    return LIGHT.max * LIGHT.rate + (weight - LIGHT.max) * MEDIUM.rate;
  } else if (weight <= HEAVY.max) {
    return (
      LIGHT.max * LIGHT.rate +
      (MEDIUM.max - LIGHT.max) * MEDIUM.rate +
      (weight - MEDIUM.max) * HEAVY.rate
    );
  } else {
    return (
      LIGHT.max * LIGHT.rate +
      (MEDIUM.max - LIGHT.max) * MEDIUM.rate +
      (HEAVY.max - MEDIUM.max) * HEAVY.rate +
      (weight - HEAVY.max) * VERY_HEAVY.rate
    );
  }
}

/**
 * Calculate delivery fee with detailed breakdown
 */
export function calculateDeliveryFee(
  params: DeliveryFeeParams
): DeliveryFeeBreakdown {
  const {
    distance,
    weight,
    serviceType = "standard",
    isUrgent = false,
  } = params;

  // Calculate component fees
  const baseFee = FEE_STRUCTURE.BASE_FEE;
  const distanceFee = calculateDistanceFee(distance);
  const weightFee = calculateWeightFee(weight);

  // Calculate subtotal before service multiplier
  const subtotal = baseFee + distanceFee + weightFee;

  // Apply service type multiplier
  const serviceMultiplier = FEE_STRUCTURE.SERVICE_MULTIPLIER[serviceType];
  const serviceFee = subtotal * (serviceMultiplier - 1);

  // Add urgent fee if applicable
  const urgentFee = isUrgent ? FEE_STRUCTURE.URGENT_FEE : 0;

  // Calculate total
  const totalFee = Math.round((subtotal + serviceFee + urgentFee) * 100) / 100;

  return {
    baseFee: Math.round(baseFee * 100) / 100,
    distanceFee: Math.round(distanceFee * 100) / 100,
    weightFee: Math.round(weightFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    urgentFee,
    totalFee,
  };
}

/**
 * Get simplified delivery fee (just the total)
 */
export function getDeliveryFee(
  distance: number,
  weight: number,
  serviceType?: ServiceType,
  isUrgent?: boolean
): number {
  const breakdown = calculateDeliveryFee({
    distance,
    weight,
    serviceType,
    isUrgent,
  });
  return breakdown.totalFee;
}

/**
 * Estimate delivery time based on distance
 */
export function estimateDeliveryTime(
  distance: number,
  serviceType: ServiceType = "standard"
): Date {
  const now = new Date();
  let hoursToAdd = 0;

  // Base delivery time calculation (assuming average speed of 40 km/h)
  const travelHours = distance / 40;

  // Add processing and loading time
  const processingHours = serviceType === "express" ? 1 : 2;

  hoursToAdd = travelHours + processingHours;

  // Express delivery gets priority
  if (serviceType === "express") {
    hoursToAdd *= 0.7; // 30% faster
  }

  now.setHours(now.getHours() + hoursToAdd);
  return now;
}

/**
 * Format delivery fee breakdown for display
 */
export function formatFeeBreakdown(breakdown: DeliveryFeeBreakdown): string {
  const lines = [
    `Base Fee: ₹${breakdown.baseFee}`,
    `Distance Fee: ₹${breakdown.distanceFee}`,
    `Weight Fee: ₹${breakdown.weightFee}`,
  ];

  if (breakdown.serviceFee !== 0) {
    lines.push(`Service Fee: ₹${breakdown.serviceFee}`);
  }

  if (breakdown.urgentFee > 0) {
    lines.push(`Urgent Fee: ₹${breakdown.urgentFee}`);
  }

  lines.push(`Total: ₹${breakdown.totalFee}`);

  return lines.join("\n");
}

/**
 * Get weight in kg from order quantity and unit
 */
export function getWeightInKg(
  quantity: number,
  unit: "kg" | "tons" | "bags"
): number {
  switch (unit) {
    case "kg":
      return quantity;
    case "tons":
      return quantity * 1000;
    case "bags":
      return quantity * 50; // Assume 50kg per bag
    default:
      return quantity;
  }
}
