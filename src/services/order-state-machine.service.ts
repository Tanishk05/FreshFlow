/**
 * Order State Machine Service
 * Implements State Machine Pattern for order status transitions
 * Ensures valid state transitions and encapsulates transition logic
 */

import type { OrderStatus, Order } from "@/models/Order";
import { ObjectId } from "mongodb";

export type OrderStateTransition =
  | "approve"
  | "reject"
  | "cancel"
  | "assign"
  | "pickup"
  | "transit"
  | "deliver";

export interface StateTransitionRule {
  from: OrderStatus[];
  to: OrderStatus;
  allowedRoles: ("farmer" | "distributor" | "retailer" | "admin")[];
  validate?: (
    order: Order,
    userId: string
  ) => Promise<{ valid: boolean; error?: string }>;
}

/**
 * State transition rules defining valid order status changes
 */
const STATE_TRANSITIONS: Record<OrderStateTransition, StateTransitionRule> = {
  approve: {
    from: ["pending"],
    to: "approved",
    allowedRoles: ["farmer", "admin"],
    validate: async (order, userId) => {
      if (order.farmerId.toString() !== userId) {
        return {
          valid: false,
          error: "Only the order's farmer can approve it",
        };
      }
      return { valid: true };
    },
  },
  reject: {
    from: ["pending"],
    to: "rejected",
    allowedRoles: ["farmer", "admin"],
    validate: async (order, userId) => {
      if (order.farmerId.toString() !== userId) {
        return { valid: false, error: "Only the order's farmer can reject it" };
      }
      return { valid: true };
    },
  },
  cancel: {
    from: ["pending", "approved"],
    to: "cancelled",
    allowedRoles: ["farmer", "retailer", "admin"],
    validate: async (order, userId) => {
      const isFarmer = order.farmerId.toString() === userId;
      const isRetailer = order.retailerId?.toString() === userId;
      if (!isFarmer && !isRetailer) {
        return {
          valid: false,
          error: "Only the order's farmer or retailer can cancel it",
        };
      }
      return { valid: true };
    },
  },
  assign: {
    from: ["approved"],
    to: "assigned",
    allowedRoles: ["distributor", "admin"],
    validate: async (order, userId) => {
      if (order.distributorId && order.distributorId.toString() !== userId) {
        return {
          valid: false,
          error: "Order is already assigned to another distributor",
        };
      }
      return { valid: true };
    },
  },
  pickup: {
    from: ["assigned"],
    to: "picked-up",
    allowedRoles: ["farmer", "distributor", "admin"],
    validate: async (order, userId) => {
      const isFarmer = order.farmerId.toString() === userId;
      const isDistributor = order.distributorId?.toString() === userId;
      if (!isFarmer && !isDistributor) {
        return {
          valid: false,
          error:
            "Only the order's farmer or assigned distributor can mark it as picked up",
        };
      }
      if (!order.distributorId) {
        return {
          valid: false,
          error: "Order must be assigned to a distributor before pickup",
        };
      }
      return { valid: true };
    },
  },
  transit: {
    from: ["picked-up"],
    to: "in-transit",
    allowedRoles: ["distributor", "admin"],
    validate: async (order, userId) => {
      if (order.distributorId?.toString() !== userId) {
        return {
          valid: false,
          error: "Only the assigned distributor can mark order as in transit",
        };
      }
      return { valid: true };
    },
  },
  deliver: {
    from: ["in-transit"],
    to: "delivered",
    allowedRoles: ["distributor", "admin"],
    validate: async (order, userId) => {
      if (order.distributorId?.toString() !== userId) {
        return {
          valid: false,
          error: "Only the assigned distributor can mark order as delivered",
        };
      }
      return { valid: true };
    },
  },
};

export class OrderStateMachine {
  /**
   * Check if a transition is valid
   */
  static canTransition(
    currentStatus: OrderStatus,
    transition: OrderStateTransition
  ): boolean {
    const rule = STATE_TRANSITIONS[transition];
    if (!rule) return false;
    return rule.from.includes(currentStatus);
  }

  /**
   * Get the target status for a transition
   */
  static getTargetStatus(transition: OrderStateTransition): OrderStatus {
    return STATE_TRANSITIONS[transition].to;
  }

  /**
   * Get allowed transitions for current status
   */
  static getAllowedTransitions(
    currentStatus: OrderStatus
  ): OrderStateTransition[] {
    return Object.entries(STATE_TRANSITIONS)
      .filter(([_, rule]) => rule.from.includes(currentStatus))
      .map(([transition]) => transition as OrderStateTransition);
  }

  /**
   * Validate if a user role can perform a transition
   */
  static canUserPerformTransition(
    transition: OrderStateTransition,
    userRole: "farmer" | "distributor" | "retailer" | "admin"
  ): boolean {
    const rule = STATE_TRANSITIONS[transition];
    if (!rule) return false;
    return (
      rule.allowedRoles.includes(userRole) ||
      rule.allowedRoles.includes("admin")
    );
  }

  /**
   * Validate transition with order context
   */
  static async validateTransition(
    order: Order,
    transition: OrderStateTransition,
    userId: string,
    userRole: "farmer" | "distributor" | "retailer" | "admin"
  ): Promise<{ valid: boolean; error?: string }> {
    // Check if transition is allowed from current status
    if (!this.canTransition(order.status, transition)) {
      return {
        valid: false,
        error: `Cannot transition from ${order.status} using ${transition}`,
      };
    }

    // Check if user role can perform transition
    if (!this.canUserPerformTransition(transition, userRole)) {
      return {
        valid: false,
        error: `User role ${userRole} cannot perform ${transition} transition`,
      };
    }

    // Run custom validation if exists
    const rule = STATE_TRANSITIONS[transition];
    if (rule.validate) {
      return await rule.validate(order, userId);
    }

    return { valid: true };
  }

  /**
   * Get transition rule
   */
  static getTransitionRule(
    transition: OrderStateTransition
  ): StateTransitionRule | undefined {
    return STATE_TRANSITIONS[transition];
  }
}
