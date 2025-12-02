"use server";

import { getOrdersCollection, Order, OrderStatus } from "@/models/Order";
import { getProduceCollection } from "@/models/Produce";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getRetailerOrderCollection } from "@/models/RetailerOrder";
import { getUsersCollection } from "@/models/User";
import { getDeliveryDistance } from "@/lib/distanceCalculator";
import { triggerOrderWebhook } from "@/actions/webhookActions";

/**
 * Get all orders for the current farmer
 */
export async function getMyOrders() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const usersCollection = await getUsersCollection();
    const farmerId = new ObjectId(session.user.id);

    const orders = await ordersCollection
      .find({ farmerId })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich orders with retailer names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        let retailerName = "Unknown Retailer";
        if (order.retailerId) {
          const retailer = await usersCollection.findOne({
            _id: order.retailerId,
          });
          retailerName = retailer?.name || "Unknown Retailer";
        }

        // Destructure to exclude ObjectId fields
        const { assignedTruckId, distributorId, ...orderData } = order;

        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          distributorId: distributorId?.toString(),
          retailerName,
        };
      })
    );

    return {
      success: true,
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get all orders placed by the current retailer
 */
export async function getMyRetailerOrders() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const usersCollection = await getUsersCollection();
    const retailerId = new ObjectId(session.user.id);

    const orders = await ordersCollection
      .find({ retailerId })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich orders with farmer names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const farmer = await usersCollection.findOne({
          _id: order.farmerId,
        });

        // Destructure to exclude ObjectId fields
        const { assignedTruckId, distributorId, ...orderData } = order;

        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          distributorId: distributorId?.toString(),
          farmerName: farmer?.name || "Unknown Farmer",
        };
      })
    );

    return {
      success: true,
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching retailer orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Create a new order (typically called by retailer, but we'll create a sample for testing)
 */
export async function createOrder(data: {
  produceId: string;
  quantity: number;
  notes?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const produceCollection = await getProduceCollection();

    // Get produce details
    const produce = await produceCollection.findOne({
      _id: new ObjectId(data.produceId),
    });

    if (!produce) {
      return { success: false, error: "Produce not found" };
    }

    // Calculate estimated distance and time if possible
    let estimatedTime: number | undefined = undefined;
    let estimatedTimeText: string | undefined = undefined;
    let distance: number | undefined = undefined;
    try {
      // Get farmer's and retailer's address for distance calculation
      const usersCollection = await getUsersCollection();
      const farmer = await usersCollection.findOne({
        _id: produce.userId,
      });
      const retailer = await usersCollection.findOne({
        _id: new ObjectId(session.user.id),
      });

      if (
        farmer?.address?.latitude &&
        farmer?.address?.longitude &&
        retailer?.address?.latitude &&
        retailer?.address?.longitude
      ) {
        const result = await getDeliveryDistance(
          farmer.address.latitude,
          farmer.address.longitude,
          retailer.address.latitude,
          retailer.address.longitude
        );
        distance = result.distance;
        estimatedTime = result.duration;
        estimatedTimeText = result.durationText;
      }
    } catch {}

    // Create the order
    const order: Order = {
      farmerId: produce.userId,
      retailerId: new ObjectId(session.user.id), // Current user as retailer
      produceId: new ObjectId(data.produceId),
      produceName: produce.name,
      quantity: data.quantity,
      unit: produce.unit,
      pricePerUnit: produce.pricePerUnit,
      totalPrice: produce.pricePerUnit * data.quantity,
      status: "pending",
      orderDate: new Date(),
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      distance,
      estimatedTime,
      estimatedTimeText,
    };

    const result = await ordersCollection.insertOne(order);

    // Trigger webhook for new order
    await triggerOrderWebhook({
      event: "order.created",
      orderId: result.insertedId.toString(),
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "pending",
    });

    revalidatePath("/dashboard/farmer");
    revalidatePath("/dashboard/retailer");

    return {
      success: true,
      data: {
        ...order,
        _id: result.insertedId.toString(),
        farmerId: order.farmerId.toString(),
        retailerId: order.retailerId?.toString(),
        produceId: order.produceId.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

/**
 * Approve an order (farmer approves retailer's order)
 */
export async function approveOrder(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const produceCollection = await getProduceCollection();
    const farmerId = new ObjectId(session.user.id);

    // Get the order
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      farmerId,
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status !== "pending") {
      return { success: false, error: "Order is not pending" };
    }

    // Check if produce has enough quantity
    const produce = await produceCollection.findOne({
      _id: order.produceId,
    });

    if (!produce) {
      return { success: false, error: "Produce not found" };
    }

    if (produce.quantity < order.quantity) {
      return {
        success: false,
        error: "Insufficient produce quantity available",
      };
    }

    // Update order status
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "approved",
          updatedAt: new Date(),
        },
      }
    );

    // Update produce quantity
    await produceCollection.updateOne(
      { _id: order.produceId },
      {
        $inc: { quantity: -order.quantity },
        $set: { updatedAt: new Date() },
      }
    );

    // Create a RetailerOrder for distributors to fulfill
    // Find an available distributor (for now, just get any distributor)
    const usersCollection = await getUsersCollection();
    const distributor = await usersCollection.findOne({ role: "distributor" });

    if (distributor && order.retailerId) {
      const retailerOrderCollection = await getRetailerOrderCollection();

      // Get retailer and farmer info for delivery address and distance calculation
      const retailer = await usersCollection.findOne({
        _id: order.retailerId,
      });
      const farmer = await usersCollection.findOne({
        _id: order.farmerId,
      });

      // Calculate actual distance if coordinates are available

      let distanceResult:
        | {
            distance: number;
            duration: number;
            durationText: string;
            method: "driving";
          }
        | undefined = undefined;

      if (
        farmer?.address?.latitude &&
        farmer?.address?.longitude &&
        retailer?.address?.latitude &&
        retailer?.address?.longitude
      ) {
        // Calculate real-world driving distance using mapping API
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
      const estimatedTime = distanceResult?.duration;
      const estimatedTimeText = distanceResult?.durationText;

      // Calculate delivery fee based on distance
      // Base fee: ₹50, Distance fee: ₹10 per km
      const baseFee = 50;
      const distanceFee = estimatedDistance * 10;
      const deliveryFee = baseFee + distanceFee;

      // Format delivery address
      const deliveryAddress = retailer?.address
        ? `${retailer.address.street || ""}, ${retailer.address.city || ""}, ${
            retailer.address.state || ""
          } ${retailer.address.pincode || ""}`.trim()
        : retailer?.phone || "Address not provided";

      const retailerOrder = {
        retailerId: order.retailerId,
        distributorId: distributor._id,
        items: [
          {
            produceId: order.produceId,
            name: order.produceName,
            quantity: order.quantity,
            pricePerUnit: order.pricePerUnit,
          },
        ],
        totalAmount: order.totalPrice, // Goes to farmer
        deliveryFee: deliveryFee, // Goes to distributor
        totalWeightKg: order.quantity, // Assuming quantity is in kg
        distance: estimatedDistance,
        estimatedTime,
        estimatedTimeText,
        status: "pending" as const,
        destination: retailer?.name || "Retailer Store",
        deliveryAddress: deliveryAddress,
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await retailerOrderCollection.insertOne(retailerOrder);
      revalidatePath("/dashboard/distributor");
    }

    // Trigger webhook for order approval
    await triggerOrderWebhook({
      event: "order.approved",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "approved",
    });

    revalidatePath("/dashboard/farmer");
    revalidatePath("/my-produce");

    return { success: true };
  } catch (error) {
    console.error("Error approving order:", error);
    return { success: false, error: "Failed to approve order" };
  }
}

/**
 * Reject/Cancel an order
 */
export async function cancelOrder(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const farmerId = new ObjectId(session.user.id);

    // Verify the order belongs to this farmer
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      farmerId,
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status !== "pending") {
      return { success: false, error: "Only pending orders can be cancelled" };
    }

    // Update order status
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    // Trigger webhook for order cancellation
    await triggerOrderWebhook({
      event: "order.cancelled",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "cancelled",
    });

    revalidatePath("/dashboard/farmer");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

/**
 * Complete an order (mark as delivered/completed)
 */
export async function completeOrder(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const farmerId = new ObjectId(session.user.id);

    // Verify the order belongs to this farmer
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      farmerId,
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status !== "approved") {
      return { success: false, error: "Only approved orders can be completed" };
    }

    // Update order status to delivered (legacy function, kept for backwards compatibility)
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "delivered",
          deliveryDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/dashboard/farmer");

    return { success: true };
  } catch (error) {
    console.error("Error completing order:", error);
    return { success: false, error: "Failed to complete order" };
  }
}

/**
 * Mark an order as picked up (for distributors/farmers)
 */
export async function markOrderAsPickedUp(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Allow both farmers and distributors to mark as picked up
    const userId = new ObjectId(session.user.id);
    const isFarmer = order.farmerId.equals(userId);
    const role = session.user.role;

    if (!isFarmer && role !== "distributor") {
      return {
        success: false,
        error: "Only farmers or distributors can mark orders as picked up",
      };
    }

    // Order must be assigned to a distributor before it can be picked up
    if (order.status !== "assigned") {
      return {
        success: false,
        error:
          "Only assigned orders can be picked up. Please wait for distributor assignment.",
      };
    }

    // Update order status to picked-up
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "picked-up",
          updatedAt: new Date(),
        },
      }
    );

    // Trigger webhook for order picked up
    await triggerOrderWebhook({
      event: "order.picked_up",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: order.distributorId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "picked-up",
    });

    revalidatePath("/dashboard/farmer");
    revalidatePath("/dashboard/distributor");

    return { success: true, message: "Order marked as picked up" };
  } catch (error) {
    console.error("Error marking order as picked up:", error);
    return { success: false, error: "Failed to mark order as picked up" };
  }
}

/**
 * Mark an order as in transit (for distributors)
 */
export async function markOrderAsInTransit(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return {
        success: false,
        error: "Only distributors can mark orders as in transit",
      };
    }

    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status !== "picked-up") {
      return {
        success: false,
        error: "Order must be picked up before marking as in transit",
      };
    }

    // Update order status to in-transit
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "in-transit",
          updatedAt: new Date(),
        },
      }
    );

    // Trigger webhook for order in transit
    await triggerOrderWebhook({
      event: "order.in_transit",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: order.distributorId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "in-transit",
      destination: order.destination,
    });

    revalidatePath("/dashboard/distributor");

    return { success: true, message: "Order marked as in transit" };
  } catch (error) {
    console.error("Error marking order as in transit:", error);
    return { success: false, error: "Failed to mark order as in transit" };
  }
}

/**
 * Mark an order as delivered
 */
export async function markOrderAsDelivered(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return {
        success: false,
        error: "Only distributors can mark orders as delivered",
      };
    }

    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status !== "in-transit") {
      return {
        success: false,
        error: "Order must be in transit before marking as delivered",
      };
    }

    // Update order status to delivered
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "delivered",
          deliveryDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // If the order had an assigned truck, update the truck status and assignedOrderIds
    if (order.assignedTruckId) {
      const { getFleetCollection } = await import("@/models/Fleet");
      const fleetCollection = await getFleetCollection();
      // Remove this order from assignedOrderIds
      await fleetCollection.updateOne(
        { _id: order.assignedTruckId },
        {
          $pull: { assignedOrderIds: order._id },
        }
      );
      // Check if there are any orders left assigned to this truck
      const updatedTruck = await fleetCollection.findOne({
        _id: order.assignedTruckId,
      });
      if (
        !updatedTruck?.assignedOrderIds ||
        updatedTruck.assignedOrderIds.length === 0
      ) {
        // If no more orders, set truck to available and reset currentLoadKg
        await fleetCollection.updateOne(
          { _id: order.assignedTruckId },
          {
            $set: {
              status: "available",
              currentLoadKg: 0,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    // Trigger webhook for order delivered
    await triggerOrderWebhook({
      event: "order.delivered",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: order.distributorId?.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "delivered",
      deliveryFee: order.deliveryFee,
      destination: order.destination,
    });

    revalidatePath("/dashboard/distributor");
    revalidatePath("/dashboard/retailer");

    return { success: true, message: "Order marked as delivered" };
  } catch (error) {
    console.error("Error marking order as delivered:", error);
    return { success: false, error: "Failed to mark order as delivered" };
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const farmerId = new ObjectId(session.user.id);

    const orders = await ordersCollection
      .find({ farmerId, status })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: orders.map((order) => {
        const { assignedTruckId, distributorId, ...orderData } = order;
        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          distributorId: distributorId?.toString(),
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get all approved orders available for distributors to accept
 */
export async function getAvailableOrdersForDistributor() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const usersCollection = await getUsersCollection();

    // Get orders with status "approved" (farmer approved, awaiting distributor)
    const orders = await ordersCollection
      .find({ status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich orders with farmer and retailer names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const farmer = await usersCollection.findOne({
          _id: order.farmerId,
        });
        let retailerName = "Unknown Retailer";
        if (order.retailerId) {
          const retailer = await usersCollection.findOne({
            _id: order.retailerId,
          });
          retailerName = retailer?.name || "Unknown Retailer";
        }

        // Destructure to exclude ObjectId fields (even if null/undefined)
        const { assignedTruckId, distributorId, ...orderData } = order;

        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          distributorId: distributorId?.toString(),
          farmerName: farmer?.name || "Unknown Farmer",
          retailerName,
        };
      })
    );

    return {
      success: true,
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching available orders:", error);
    return { success: false, error: "Failed to fetch available orders" };
  }
}

/**
 * Accept an order as a distributor (assign distributor and change status to "assigned")
 */
export async function acceptOrderAsDistributor(
  orderId: string,
  truckId: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized - must be a distributor" };
    }

    const ordersCollection = await getOrdersCollection();
    const usersCollection = await getUsersCollection();

    // Check if order exists and is in approved status
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      status: "approved",
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found or already assigned",
      };
    }

    // Get farmer and retailer locations to calculate distance and delivery fee
    const farmer = await usersCollection.findOne({
      _id: order.farmerId,
    });

    let retailer = null;
    if (order.retailerId) {
      retailer = await usersCollection.findOne({
        _id: order.retailerId,
      });
    }

    // Calculate distance and delivery fee
    let distance = 0;
    let deliveryFee = 0;
    let destination = "";
    let deliveryAddress = "";
    let estimatedDelivery = new Date();

    const { getDeliveryFee, getWeightInKg, estimateDeliveryTime } =
      await import("@/lib/deliveryFeeCalculator");
    const { getDeliveryDistance } = await import("@/lib/distanceCalculator");

    if (farmer?.address && retailer?.address) {
      // Stricter coordinate validation
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
        if (distanceResult.method !== "driving") {
          console.warn(
            `WARNING: Fallback method (${distanceResult.method}) used for order ${orderId}. Coordinates: Farmer(${fLat},${fLon}), Retailer(${rLat},${rLon})`
          );
        }
        console.log(
          `Distance calculated for order ${orderId}: ${distance}km (method: ${distanceResult.method})`
        );
      } else {
        // Fallback: Use random estimate if coordinates not available or invalid
        distance = Math.floor(Math.random() * 45) + 10; // 10-55 km
        console.warn(
          `WARNING: Invalid or missing coordinates for order ${orderId}. Using fallback distance: ${distance}km. Farmer:`,
          farmer.address,
          "Retailer:",
          retailer.address
        );
      }

      // Calculate delivery fee based on distance and weight
      const weightKg = getWeightInKg(order.quantity, order.unit);
      deliveryFee = getDeliveryFee(distance, weightKg);

      // Estimate delivery time
      estimatedDelivery = estimateDeliveryTime(distance);

      // Set destination and delivery address
      destination = retailer.address.city || "Unknown Location";
      deliveryAddress = `${retailer.address.street || ""}, ${
        retailer.address.city || ""
      }, ${retailer.address.state || ""} ${
        retailer.address.pincode || ""
      }`.trim();

      console.log(
        `Order ${orderId} - Distance: ${distance}km, Weight: ${weightKg}kg, Fee: ₹${deliveryFee}`
      );
    } else {
      // Fallback when addresses are missing
      distance = Math.floor(Math.random() * 45) + 10; // 10-55 km
      const weightKg = getWeightInKg(order.quantity, order.unit);
      deliveryFee = getDeliveryFee(distance, weightKg);
      estimatedDelivery = estimateDeliveryTime(distance);
      destination = retailer?.name || "Unknown Location";
      deliveryAddress = "Address not available";
      console.log(
        `Using fallback for order ${orderId} - Distance: ${distance}km, Fee: ₹${deliveryFee} (missing addresses)`
      );
    }

    // Update order status to "assigned" and add distributor info with delivery details
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "assigned",
          distributorId: new ObjectId(session.user.id),
          assignedTruckId: new ObjectId(truckId),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          deliveryFee: Math.round(deliveryFee * 100) / 100, // Round to 2 decimals
          destination,
          deliveryAddress,
          estimatedDelivery,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "Failed to accept order" };
    }

    // Update truck status to "on-route" and add order to assignedOrderIds
    const { getFleetCollection } = await import("@/models/Fleet");
    const fleetCollection = await getFleetCollection();
    await fleetCollection.updateOne(
      { _id: new ObjectId(truckId) },
      {
        $set: {
          status: "on-route",
          updatedAt: new Date(),
        },
        $addToSet: {
          assignedOrderIds: new ObjectId(orderId),
        },
      }
    );

    // Trigger webhook for order assignment
    await triggerOrderWebhook({
      event: "order.assigned",
      orderId: orderId,
      farmerId: order.farmerId.toString(),
      retailerId: order.retailerId?.toString(),
      distributorId: session.user.id,
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      status: "assigned",
      deliveryFee: deliveryFee,
      destination: destination,
    });

    revalidatePath("/dashboard/distributor");
    revalidatePath("/dashboard/farmer");
    revalidatePath("/dashboard/retailer");

    return { success: true, message: "Order accepted successfully" };
  } catch (error) {
    console.error("Error accepting order:", error);
    return { success: false, error: "Failed to accept order" };
  }
}

/**
 * Get distributor's orders by status
 */
export async function getDistributorOrdersByStatus(status: OrderStatus) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const usersCollection = await getUsersCollection();

    // Get orders assigned to this distributor with the specified status
    const orders = await ordersCollection
      .find({
        distributorId: new ObjectId(session.user.id),
        status,
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich orders with farmer and retailer names
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const farmer = await usersCollection.findOne({
          _id: order.farmerId,
        });
        let retailerName = "Unknown Retailer";
        if (order.retailerId) {
          const retailer = await usersCollection.findOne({
            _id: order.retailerId,
          });
          retailerName = retailer?.name || "Unknown Retailer";
        }

        // Destructure to exclude assignedTruckId ObjectId, then add it as string
        const { assignedTruckId, ...orderData } = order;

        return {
          ...orderData,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          distributorId: order.distributorId?.toString(),
          produceId: order.produceId.toString(),
          assignedTruckId: assignedTruckId?.toString(),
          farmerName: farmer?.name || "Unknown Farmer",
          retailerName,
        };
      })
    );

    return {
      success: true,
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching distributor orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Assign multiple orders to a truck for optimized delivery
 */
export async function assignMultipleOrdersToTruck(
  truckId: string,
  orderIds: string[]
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const { getFleetCollection } = await import("@/models/Fleet");
    const fleetCollection = await getFleetCollection();

    // Verify truck belongs to distributor
    const truck = await fleetCollection.findOne({
      _id: new ObjectId(truckId),
      distributorId: new ObjectId(session.user.id),
    });

    if (!truck) {
      return { success: false, error: "Truck not found" };
    }

    // Calculate total weight of orders
    const orders = await ordersCollection
      .find({
        _id: { $in: orderIds.map((id) => new ObjectId(id)) },
        distributorId: new ObjectId(session.user.id),
        status: "assigned",
      })
      .toArray();

    if (orders.length !== orderIds.length) {
      return {
        success: false,
        error: "Some orders not found or not available",
      };
    }

    // Calculate total weight (convert to kg)
    let totalWeightKg = 0;
    for (const order of orders) {
      if (order.unit === "kg") {
        totalWeightKg += order.quantity;
      } else if (order.unit === "tons") {
        totalWeightKg += order.quantity * 1000;
      } else if (order.unit === "bags") {
        totalWeightKg += order.quantity * 50; // Assume 50kg per bag
      }
    }

    // Check if truck has capacity
    const availableCapacity = truck.capacityKg - truck.currentLoadKg;
    if (totalWeightKg > availableCapacity) {
      return {
        success: false,
        error: `Insufficient truck capacity. Available: ${availableCapacity.toFixed(
          0
        )}kg, Required: ${totalWeightKg.toFixed(0)}kg`,
      };
    }

    // Update all orders with truck assignment
    await ordersCollection.updateMany(
      {
        _id: { $in: orderIds.map((id) => new ObjectId(id)) },
      },
      {
        $set: {
          assignedTruckId: new ObjectId(truckId),
          updatedAt: new Date(),
        },
      }
    );

    // Update truck with new orders and load
    await fleetCollection.updateOne(
      { _id: new ObjectId(truckId) },
      {
        $addToSet: {
          assignedOrderIds: {
            $each: orderIds.map((id) => new ObjectId(id)),
          },
        },
        $inc: { currentLoadKg: totalWeightKg },
        $set: { updatedAt: new Date() },
      }
    );

    revalidatePath("/dashboard/distributor");

    return {
      success: true,
      message: `Successfully assigned ${
        orderIds.length
      } order(s) to truck. Total weight: ${totalWeightKg.toFixed(0)}kg`,
    };
  } catch (error) {
    console.error("Error assigning orders to truck:", error);
    return { success: false, error: "Failed to assign orders to truck" };
  }
}
