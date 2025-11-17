"use server";

import { getFleetCollection } from "@/models/Fleet";
import {
  getRetailerOrderCollection,
  RetailerOrder,
} from "@/models/RetailerOrder";
import { ObjectId } from "mongodb";

/**
 * Assign multiple orders to a truck based on available capacity
 * This optimizes truck utilization by loading multiple jobs
 */
export async function assignOrdersToTruck(truckId: string, orderIds: string[]) {
  try {
    const fleetCollection = await getFleetCollection();
    const ordersCollection = await getRetailerOrderCollection();

    const truckObjId = new ObjectId(truckId);
    const orderObjIds = orderIds.map((id) => new ObjectId(id));

    // Get truck details
    const truck = await fleetCollection.findOne({ _id: truckObjId });
    if (!truck) {
      return { success: false, error: "Truck not found" };
    }

    // Get all orders
    const orders = await ordersCollection
      .find({ _id: { $in: orderObjIds } })
      .toArray();

    if (orders.length !== orderIds.length) {
      return { success: false, error: "Some orders not found" };
    }

    // Calculate total weight
    const totalWeight = orders.reduce(
      (sum, order) => sum + order.totalWeightKg,
      0
    );

    // Check if truck has enough capacity
    const availableCapacity = truck.capacityKg - truck.currentLoadKg;
    if (totalWeight > availableCapacity) {
      return {
        success: false,
        error: `Insufficient capacity. Need ${totalWeight} kg, available ${availableCapacity} kg`,
        availableCapacity,
        requiredCapacity: totalWeight,
      };
    }

    // Update truck with new assignments
    const existingOrders = truck.assignedOrderIds || [];
    const updatedOrderIds = [...existingOrders, ...orderObjIds];

    await fleetCollection.updateOne(
      { _id: truckObjId },
      {
        $set: {
          assignedOrderIds: updatedOrderIds,
          currentLoadKg: truck.currentLoadKg + totalWeight,
          status: "on-route" as const,
          updatedAt: new Date(),
        },
      }
    );

    // Update all orders with truck assignment
    await ordersCollection.updateMany(
      { _id: { $in: orderObjIds } },
      {
        $set: {
          assignedTruckId: truckObjId,
          status: "assigned" as const,
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      message: `Successfully assigned ${orders.length} orders (${totalWeight} kg) to truck ${truck.truckNumber}`,
      truckLoad: {
        currentLoad: truck.currentLoadKg + totalWeight,
        capacity: truck.capacityKg,
        availableCapacity:
          truck.capacityKg - (truck.currentLoadKg + totalWeight),
        loadPercentage:
          ((truck.currentLoadKg + totalWeight) / truck.capacityKg) * 100,
      },
    };
  } catch (error) {
    console.error("Error assigning orders to truck:", error);
    return {
      success: false,
      error: "Failed to assign orders to truck",
    };
  }
}

/**
 * Get available trucks that can accommodate a specific weight
 */
export async function getAvailableTrucks(requiredWeightKg: number) {
  try {
    const fleetCollection = await getFleetCollection();

    // Find trucks that are available or on-route with enough capacity
    const trucks = await fleetCollection
      .find({
        $expr: {
          $gte: [
            { $subtract: ["$capacityKg", "$currentLoadKg"] },
            requiredWeightKg,
          ],
        },
        status: { $in: ["available", "on-route"] },
      })
      .toArray();

    // Calculate available capacity for each truck
    const trucksWithCapacity = trucks.map((truck) => ({
      ...truck,
      _id: truck._id!.toString(),
      distributorId: truck.distributorId.toString(),
      assignedOrderIds: truck.assignedOrderIds?.map((id) => id.toString()),
      availableCapacityKg: truck.capacityKg - truck.currentLoadKg,
      loadPercentage: (truck.currentLoadKg / truck.capacityKg) * 100,
    }));

    // Sort by available capacity (descending) - prefer trucks with more space
    trucksWithCapacity.sort(
      (a, b) => b.availableCapacityKg - a.availableCapacityKg
    );

    return {
      success: true,
      trucks: trucksWithCapacity,
    };
  } catch (error) {
    console.error("Error getting available trucks:", error);
    return {
      success: false,
      trucks: [],
      error: "Failed to get available trucks",
    };
  }
}

/**
 * Get all orders assigned to a specific truck
 */
export async function getTruckOrders(truckId: string) {
  try {
    const ordersCollection = await getRetailerOrderCollection();
    const truckObjId = new ObjectId(truckId);

    const orders = await ordersCollection
      .find({ assignedTruckId: truckObjId })
      .toArray();

    const serializedOrders = orders.map((order) => ({
      ...order,
      _id: order._id?.toString(),
      retailerId: order.retailerId.toString(),
      distributorId: order.distributorId.toString(),
      assignedTruckId: order.assignedTruckId?.toString(),
      items: order.items.map((item) => ({
        ...item,
        produceId: item.produceId.toString(),
      })),
    }));

    return {
      success: true,
      orders: serializedOrders,
      totalWeight: orders.reduce((sum, order) => sum + order.totalWeightKg, 0),
      orderCount: orders.length,
    };
  } catch (error) {
    console.error("Error getting truck orders:", error);
    return {
      success: false,
      orders: [],
      totalWeight: 0,
      orderCount: 0,
      error: "Failed to get truck orders",
    };
  }
}

/**
 * Complete delivery for specific orders and update truck capacity
 */
export async function completeDelivery(truckId: string, orderIds: string[]) {
  try {
    const fleetCollection = await getFleetCollection();
    const ordersCollection = await getRetailerOrderCollection();

    const truckObjId = new ObjectId(truckId);
    const orderObjIds = orderIds.map((id) => new ObjectId(id));

    // Get orders to calculate weight
    const orders = await ordersCollection
      .find({ _id: { $in: orderObjIds } })
      .toArray();

    const deliveredWeight = orders.reduce(
      (sum, order) => sum + order.totalWeightKg,
      0
    );

    // Update orders to delivered status
    await ordersCollection.updateMany(
      { _id: { $in: orderObjIds } },
      {
        $set: {
          status: "delivered" as const,
          deliveryDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Get current truck state
    const truck = await fleetCollection.findOne({ _id: truckObjId });
    if (!truck) {
      return { success: false, error: "Truck not found" };
    }

    // Remove delivered orders from truck's assigned list
    const remainingOrders =
      truck.assignedOrderIds?.filter(
        (id) => !orderObjIds.some((orderId) => orderId.equals(id))
      ) || [];

    // Update truck load and status
    const newLoad = Math.max(0, truck.currentLoadKg - deliveredWeight);
    const newStatus = remainingOrders.length === 0 ? "available" : "on-route";

    await fleetCollection.updateOne(
      { _id: truckObjId },
      {
        $set: {
          assignedOrderIds: remainingOrders,
          currentLoadKg: newLoad,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      message: `Delivered ${orders.length} orders (${deliveredWeight} kg)`,
      remainingOrders: remainingOrders.length,
      currentLoad: newLoad,
      truckStatus: newStatus,
    };
  } catch (error) {
    console.error("Error completing delivery:", error);
    return {
      success: false,
      error: "Failed to complete delivery",
    };
  }
}

/**
 * Suggest optimal truck assignments for pending orders
 * Uses bin packing algorithm to maximize truck utilization
 */
export async function suggestOptimalAssignments(distributorId: string) {
  try {
    const fleetCollection = await getFleetCollection();
    const ordersCollection = await getRetailerOrderCollection();

    const distributorObjId = new ObjectId(distributorId);

    // Get all available/on-route trucks
    const trucks = await fleetCollection
      .find({
        distributorId: distributorObjId,
        status: { $in: ["available", "on-route"] },
      })
      .toArray();

    // Get all pending orders
    const pendingOrders = await ordersCollection
      .find({
        distributorId: distributorObjId,
        status: "pending",
      })
      .toArray();

    if (pendingOrders.length === 0) {
      return {
        success: true,
        suggestions: [],
        message: "No pending orders to assign",
      };
    }

    // Sort orders by weight (descending) - First Fit Decreasing algorithm
    const sortedOrders = [...pendingOrders].sort(
      (a, b) => b.totalWeightKg - a.totalWeightKg
    );

    // Calculate available capacity for each truck
    const trucksWithCapacity = trucks.map((truck) => ({
      truck,
      availableCapacity: truck.capacityKg - truck.currentLoadKg,
      assignedOrders: [] as RetailerOrder[],
    }));

    // Sort trucks by available capacity (descending)
    trucksWithCapacity.sort(
      (a, b) => b.availableCapacity - a.availableCapacity
    );

    const suggestions = [];
    const unassignedOrders = [];

    // Assign orders to trucks using First Fit Decreasing
    for (const order of sortedOrders) {
      let assigned = false;

      for (const truckData of trucksWithCapacity) {
        if (order.totalWeightKg <= truckData.availableCapacity) {
          truckData.assignedOrders.push(order);
          truckData.availableCapacity -= order.totalWeightKg;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        unassignedOrders.push(order);
      }
    }

    // Build suggestions
    for (const truckData of trucksWithCapacity) {
      if (truckData.assignedOrders.length > 0) {
        const totalWeight = truckData.assignedOrders.reduce(
          (sum, order) => sum + order.totalWeightKg,
          0
        );

        suggestions.push({
          truckId: truckData.truck._id!.toString(),
          truckNumber: truckData.truck.truckNumber,
          driver: truckData.truck.driver,
          currentLoad: truckData.truck.currentLoadKg,
          additionalLoad: totalWeight,
          newLoad: truckData.truck.currentLoadKg + totalWeight,
          capacity: truckData.truck.capacityKg,
          loadPercentage:
            ((truckData.truck.currentLoadKg + totalWeight) /
              truckData.truck.capacityKg) *
            100,
          orderIds: truckData.assignedOrders.map((o) => o._id!.toString()),
          orders: truckData.assignedOrders.map((o) => ({
            orderId: o._id!.toString(),
            destination: o.destination,
            weight: o.totalWeightKg,
            items: o.items.length,
          })),
        });
      }
    }

    return {
      success: true,
      suggestions,
      unassignedOrders: unassignedOrders.map((o) => ({
        orderId: o._id!.toString(),
        destination: o.destination,
        weight: o.totalWeightKg,
        reason: "Insufficient truck capacity",
      })),
      summary: {
        totalOrders: pendingOrders.length,
        assignedOrders: pendingOrders.length - unassignedOrders.length,
        unassignedOrders: unassignedOrders.length,
        trucksUsed: suggestions.length,
        averageLoadPercentage:
          suggestions.reduce((sum, s) => sum + s.loadPercentage, 0) /
          (suggestions.length || 1),
      },
    };
  } catch (error) {
    console.error("Error suggesting optimal assignments:", error);
    return {
      success: false,
      suggestions: [],
      error: "Failed to generate suggestions",
    };
  }
}
