/**
 * Order Mediator Service
 * Implements Mediator Pattern for coordinating between actors (farmer, distributor, retailer)
 * Centralizes communication and reduces direct dependencies between actors
 */

import type { Order } from "@/models/Order";
import { ObjectId } from "mongodb";
import { userRepository } from "@/repositories/user.repository";
import { orderRepository } from "@/repositories/order.repository";
import { produceRepository } from "@/repositories/produce.repository";
import { getRetailerOrderCollection } from "@/models/RetailerOrder";
import { getDeliveryDistance } from "@/lib/distanceCalculator";
import { getWeightInKg } from "@/lib/deliveryFeeCalculator";
import { pricingStrategy } from "./pricing-strategy.service";
import { emitOrderEvent } from "./event-observer.service";

export type ActorRole = "farmer" | "distributor" | "retailer" | "admin";

export interface OrderMediationRequest {
  orderId: string;
  actorId: string;
  actorRole: ActorRole;
  action: "approve" | "assign" | "deliver" | "cancel";
  additionalData?: {
    truckId?: string;
    distributorId?: string;
  };
}

export interface OrderMediationResult {
  success: boolean;
  error?: string;
  data?: any;
  notifications?: {
    farmer?: boolean;
    retailer?: boolean;
    distributor?: boolean;
  };
}

/**
 * Order Mediator
 * Coordinates interactions between different actors in the order lifecycle
 */
export class OrderMediator {
  /**
   * Mediate order approval (farmer approves retailer's order)
   */
  async mediateApproval(
    orderId: string,
    farmerId: string
  ): Promise<OrderMediationResult> {
    try {
      // Get order
      const order = await orderRepository.findById(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Verify farmer owns the order
      if (order.farmerId.toString() !== farmerId) {
        return { success: false, error: "Unauthorized" };
      }

      // Check produce availability
      const produce = await produceRepository.findById(
        order.produceId.toString()
      );
      if (!produce || produce.quantity < order.quantity) {
        return {
          success: false,
          error: "Insufficient produce quantity available",
        };
      }

      // Update produce quantity
      await produceRepository.update(order.produceId.toString(), {
        quantity: produce.quantity - order.quantity,
      });

      // Find available distributor
      const distributors = await userRepository.findMany(
        { role: "distributor" },
        { page: 1, limit: 1 }
      );
      const distributor = distributors.data[0];

      // Create RetailerOrder for distributor if distributor exists
      if (distributor && order.retailerId) {
        await this.createRetailerOrder(order, distributor._id!);
      }

      // Emit event for all parties
      await emitOrderEvent({
        type: "order.approved",
        orderId: orderId,
        timestamp: new Date(),
        data: {
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceName: order.produceName,
          quantity: order.quantity,
          unit: order.unit,
          status: "approved",
        },
      });

      return {
        success: true,
        notifications: {
          farmer: true,
          retailer: true,
          distributor: !!distributor,
        },
      };
    } catch (error) {
      console.error("[OrderMediator] Error mediating approval:", error);
      return { success: false, error: "Failed to approve order" };
    }
  }

  /**
   * Mediate order assignment (distributor accepts order)
   */
  async mediateAssignment(
    orderId: string,
    distributorId: string,
    truckId: string
  ): Promise<OrderMediationResult> {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Get farmer and retailer for distance calculation
      const farmer = await userRepository.findById(order.farmerId.toString());
      const retailer = order.retailerId
        ? await userRepository.findById(order.retailerId.toString())
        : null;

      // Calculate delivery details
      const deliveryDetails = await this.calculateDeliveryDetails(
        farmer,
        retailer,
        order
      );

      // Update order with delivery details
      await orderRepository.update(orderId, {
        distributorId: new ObjectId(distributorId),
        assignedTruckId: new ObjectId(truckId),
        ...deliveryDetails,
      });

      // Emit event
      await emitOrderEvent({
        type: "order.assigned",
        orderId: orderId,
        timestamp: new Date(),
        data: {
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          distributorId: distributorId,
          produceName: order.produceName,
          quantity: order.quantity,
          unit: order.unit,
          status: "assigned",
          deliveryFee: deliveryDetails.deliveryFee,
          destination: deliveryDetails.destination,
        },
      });

      return {
        success: true,
        notifications: {
          farmer: true,
          retailer: true,
          distributor: true,
        },
      };
    } catch (error) {
      console.error("[OrderMediator] Error mediating assignment:", error);
      return { success: false, error: "Failed to assign order" };
    }
  }

  /**
   * Mediate order delivery (distributor delivers to retailer)
   */
  async mediateDelivery(
    orderId: string,
    distributorId: string
  ): Promise<OrderMediationResult> {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Update order status
      await orderRepository.update(orderId, {
        status: "delivered",
        deliveryDate: new Date(),
      });

      // Handle truck status if assigned
      if (order.assignedTruckId) {
        const { fleetRepository } = await import(
          "@/repositories/fleet.repository"
        );
        const truck = await fleetRepository.findById(
          order.assignedTruckId.toString()
        );
        if (truck) {
          const updatedOrderIds = (truck.assignedOrderIds || []).filter(
            (id) => id.toString() !== orderId
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

      // Emit event
      await emitOrderEvent({
        type: "order.delivered",
        orderId: orderId,
        timestamp: new Date(),
        data: {
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          distributorId: distributorId,
          produceName: order.produceName,
          quantity: order.quantity,
          unit: order.unit,
          status: "delivered",
          deliveryFee: order.deliveryFee,
          destination: order.destination,
        },
      });

      return {
        success: true,
        notifications: {
          farmer: true,
          retailer: true,
          distributor: true,
        },
      };
    } catch (error) {
      console.error("[OrderMediator] Error mediating delivery:", error);
      return { success: false, error: "Failed to deliver order" };
    }
  }

  /**
   * Create RetailerOrder for distributor
   */
  private async createRetailerOrder(
    order: Order,
    distributorId: ObjectId
  ): Promise<void> {
    const retailerOrderCollection = await getRetailerOrderCollection();
    const retailer = order.retailerId
      ? await userRepository.findById(order.retailerId.toString())
      : null;
    const farmer = await userRepository.findById(order.farmerId.toString());

    let distanceResult: any = undefined;
    if (
      farmer?.address?.latitude &&
      farmer?.address?.longitude &&
      retailer?.address?.latitude &&
      retailer?.address?.longitude
    ) {
      try {
        distanceResult = await getDeliveryDistance(
          farmer.address.latitude,
          farmer.address.longitude,
          retailer.address.latitude,
          retailer.address.longitude
        );
      } catch {}
    }

    const estimatedDistance =
      distanceResult?.distance ?? Math.floor(Math.random() * 45) + 5;
    const weightKg = getWeightInKg(order.quantity, order.unit);
    const deliveryFeeCalculation = pricingStrategy.calculateDeliveryFee(
      estimatedDistance,
      weightKg,
      order.totalPrice
    );
    const deliveryFee = deliveryFeeCalculation.final;

    const deliveryAddress = retailer?.address
      ? `${retailer.address.street || ""}, ${retailer.address.city || ""}, ${
          retailer.address.state || ""
        } ${retailer.address.pincode || ""}`.trim()
      : retailer?.phone || "Address not provided";

    if (!order.retailerId) {
      throw new Error("Order must have a retailer ID");
    }

    await retailerOrderCollection.insertOne({
      retailerId: order.retailerId,
      distributorId: distributorId,
      items: [
        {
          produceId: order.produceId,
          name: order.produceName,
          quantity: order.quantity,
          pricePerUnit: order.pricePerUnit,
        },
      ],
      totalAmount: order.totalPrice,
      deliveryFee: deliveryFee,
      totalWeightKg: weightKg,
      distance: estimatedDistance,
      estimatedTime: distanceResult?.duration,
      estimatedTimeText: distanceResult?.durationText,
      status: "pending" as const,
      destination: retailer?.name || "Retailer Store",
      deliveryAddress: deliveryAddress,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Calculate delivery details
   */
  private async calculateDeliveryDetails(
    farmer: any,
    retailer: any,
    order: Order
  ): Promise<{
    distance: number;
    deliveryFee: number;
    destination: string;
    deliveryAddress: string;
    estimatedDelivery: Date;
  }> {
    let distance = 0;
    let deliveryFee = 0;
    let destination = "";
    let deliveryAddress = "";
    let estimatedDelivery = new Date();

    if (farmer?.address && retailer?.address) {
      const fLat = Number(farmer.address.latitude);
      const fLon = Number(farmer.address.longitude);
      const rLat = Number(retailer.address.latitude);
      const rLon = Number(retailer.address.longitude);

      const coordsValid =
        isFinite(fLat) &&
        isFinite(fLon) &&
        isFinite(rLat) &&
        isFinite(rLon) &&
        fLat >= -90 &&
        fLat <= 90 &&
        fLon >= -180 &&
        fLon <= 180 &&
        rLat >= -90 &&
        rLat <= 90 &&
        rLon >= -180 &&
        rLon <= 180;

      if (coordsValid) {
        const distanceResult = await getDeliveryDistance(
          fLat,
          fLon,
          rLat,
          rLon
        );
        distance = distanceResult.distance;
      } else {
        distance = Math.floor(Math.random() * 45) + 10;
      }

      const weightKg = getWeightInKg(order.quantity, order.unit);
      const feeCalculation = pricingStrategy.calculateDeliveryFee(
        distance,
        weightKg,
        order.totalPrice
      );
      deliveryFee = feeCalculation.final;

      const { estimateDeliveryTime } = await import(
        "@/lib/deliveryFeeCalculator"
      );
      estimatedDelivery = estimateDeliveryTime(distance);

      destination = retailer.address.city || "Unknown Location";
      deliveryAddress = `${retailer.address.street || ""}, ${
        retailer.address.city || ""
      }, ${retailer.address.state || ""} ${
        retailer.address.pincode || ""
      }`.trim();
    } else {
      distance = Math.floor(Math.random() * 45) + 10;
      const weightKg = getWeightInKg(order.quantity, order.unit);
      const feeCalculation = pricingStrategy.calculateDeliveryFee(
        distance,
        weightKg,
        order.totalPrice
      );
      deliveryFee = feeCalculation.final;
      const { estimateDeliveryTime } = await import(
        "@/lib/deliveryFeeCalculator"
      );
      estimatedDelivery = estimateDeliveryTime(distance);
      destination = retailer?.name || "Unknown Location";
      deliveryAddress = "Address not available";
    }

    return {
      distance: Math.round(distance * 10) / 10,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      destination,
      deliveryAddress,
      estimatedDelivery,
    };
  }
}

// Export singleton mediator
export const orderMediator = new OrderMediator();
