/**
 * Order Command Service
 * Implements Command Pattern for order operations
 * Encapsulates requests as objects, allowing parameterization, queuing, and undo operations
 */

import type { Order } from "@/models/Order";
import { orderRepository } from "@/repositories/order.repository";
import {
  OrderStateMachine,
  type OrderStateTransition,
} from "./order-state-machine.service";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export interface CommandResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface OrderCommand {
  execute(): Promise<CommandResult>;
  canUndo(): boolean;
  undo?(): Promise<CommandResult>;
}

/**
 * Base command class with common functionality
 */
abstract class BaseOrderCommand implements OrderCommand {
  protected orderId: string;
  protected userId: string;
  protected userRole: "farmer" | "distributor" | "retailer" | "admin";

  constructor(
    orderId: string,
    userId: string,
    userRole: "farmer" | "distributor" | "retailer" | "admin"
  ) {
    this.orderId = orderId;
    this.userId = userId;
    this.userRole = userRole;
  }

  protected async getOrder(): Promise<Order | null> {
    return await orderRepository.findById(this.orderId);
  }

  canUndo(): boolean {
    return false; // Most commands are not undoable by default
  }

  protected revalidatePaths(paths: string[]): void {
    paths.forEach((path) => revalidatePath(path));
  }

  abstract execute(): Promise<CommandResult>;
}

/**
 * Approve Order Command
 */
export class ApproveOrderCommand extends BaseOrderCommand {
  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "approve",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      await orderRepository.updateStatus(this.orderId, "approved");
      this.revalidatePaths(["/dashboard/farmer", "/dashboard/retailer"]);

      return {
        success: true,
        data: { orderId: this.orderId, status: "approved" },
      };
    } catch (error) {
      console.error("Error approving order:", error);
      return { success: false, error: "Failed to approve order" };
    }
  }
}

/**
 * Cancel Order Command
 */
export class CancelOrderCommand extends BaseOrderCommand {
  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "cancel",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      await orderRepository.updateStatus(this.orderId, "cancelled");
      this.revalidatePaths(["/dashboard/farmer", "/dashboard/retailer"]);

      return {
        success: true,
        data: { orderId: this.orderId, status: "cancelled" },
      };
    } catch (error) {
      console.error("Error cancelling order:", error);
      return { success: false, error: "Failed to cancel order" };
    }
  }
}

/**
 * Assign Order Command
 */
export class AssignOrderCommand extends BaseOrderCommand {
  private distributorId: string;
  private truckId?: string;

  constructor(
    orderId: string,
    userId: string,
    userRole: "farmer" | "distributor" | "retailer" | "admin",
    distributorId: string,
    truckId?: string
  ) {
    super(orderId, userId, userRole);
    this.distributorId = distributorId;
    this.truckId = truckId;
  }

  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "assign",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const updates: Partial<Order> = {
        status: "assigned",
        distributorId: new ObjectId(this.distributorId),
      };

      if (this.truckId) {
        updates.assignedTruckId = new ObjectId(this.truckId);
      }

      await orderRepository.update(this.orderId, updates);
      this.revalidatePaths(["/dashboard/distributor", "/dashboard/farmer"]);

      return {
        success: true,
        data: {
          orderId: this.orderId,
          status: "assigned",
          distributorId: this.distributorId,
        },
      };
    } catch (error) {
      console.error("Error assigning order:", error);
      return { success: false, error: "Failed to assign order" };
    }
  }
}

/**
 * Pickup Order Command
 */
export class PickupOrderCommand extends BaseOrderCommand {
  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "pickup",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      await orderRepository.updateStatus(this.orderId, "picked-up");
      this.revalidatePaths(["/dashboard/farmer", "/dashboard/distributor"]);

      return {
        success: true,
        data: { orderId: this.orderId, status: "picked-up" },
      };
    } catch (error) {
      console.error("Error marking order as picked up:", error);
      return { success: false, error: "Failed to mark order as picked up" };
    }
  }
}

/**
 * Transit Order Command
 */
export class TransitOrderCommand extends BaseOrderCommand {
  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "transit",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      await orderRepository.updateStatus(this.orderId, "in-transit");
      this.revalidatePaths(["/dashboard/distributor"]);

      return {
        success: true,
        data: { orderId: this.orderId, status: "in-transit" },
      };
    } catch (error) {
      console.error("Error marking order as in transit:", error);
      return { success: false, error: "Failed to mark order as in transit" };
    }
  }
}

/**
 * Deliver Order Command
 */
export class DeliverOrderCommand extends BaseOrderCommand {
  async execute(): Promise<CommandResult> {
    try {
      const order = await this.getOrder();
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      const validation = await OrderStateMachine.validateTransition(
        order,
        "deliver",
        this.userId,
        this.userRole
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      await orderRepository.update(this.orderId, {
        status: "delivered",
        deliveryDate: new Date(),
      });

      // Handle truck status update if order has assigned truck
      if (order.assignedTruckId) {
        const { fleetRepository } = await import(
          "@/repositories/fleet.repository"
        );
        const truck = await fleetRepository.findById(
          order.assignedTruckId.toString()
        );
        if (truck) {
          const updatedOrderIds = (truck.assignedOrderIds || []).filter(
            (id) => id.toString() !== this.orderId
          );

          if (updatedOrderIds.length === 0) {
            await fleetRepository.update(order.assignedTruckId.toString(), {
              status: "available",
              currentLoadKg: 0,
              assignedOrderIds: [],
            });
          } else {
            await fleetRepository.update(order.assignedTruckId.toString(), {
              assignedOrderIds: updatedOrderIds,
            });
          }
        }
      }

      this.revalidatePaths(["/dashboard/distributor", "/dashboard/retailer"]);

      return {
        success: true,
        data: { orderId: this.orderId, status: "delivered" },
      };
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      return { success: false, error: "Failed to mark order as delivered" };
    }
  }
}

/**
 * Command Invoker
 * Executes commands and can maintain command history for undo operations
 */
export class OrderCommandInvoker {
  private history: OrderCommand[] = [];
  private maxHistorySize = 50;

  async execute(command: OrderCommand): Promise<CommandResult> {
    const result = await command.execute();
    if (result.success && command.canUndo()) {
      this.history.push(command);
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }
    return result;
  }

  async undoLast(): Promise<CommandResult | null> {
    const lastCommand = this.history.pop();
    if (!lastCommand || !lastCommand.canUndo() || !lastCommand.undo) {
      return null;
    }
    return await lastCommand.undo();
  }

  clearHistory(): void {
    this.history = [];
  }
}

// Export singleton invoker
export const orderCommandInvoker = new OrderCommandInvoker();
