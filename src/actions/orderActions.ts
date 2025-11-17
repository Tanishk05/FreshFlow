"use server";

import { getOrdersCollection, Order, OrderStatus } from "@/models/Order";
import { getProduceCollection } from "@/models/Produce";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getRetailerOrderCollection } from "@/models/RetailerOrder";
import { getUsersCollection } from "@/models/User";
import { getDeliveryDistance } from "@/lib/distanceCalculator";

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
        return {
          ...order,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
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
        return {
          ...order,
          _id: order._id!.toString(),
          farmerId: order.farmerId.toString(),
          retailerId: order.retailerId?.toString(),
          produceId: order.produceId.toString(),
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
    };

    const result = await ordersCollection.insertOne(order);

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
      let distanceResult: {
        distance: number;
        method: "driving" | "straight-line" | "estimated";
      };

      if (
        farmer?.address?.latitude &&
        farmer?.address?.longitude &&
        retailer?.address?.latitude &&
        retailer?.address?.longitude
      ) {
        // Calculate real-world driving distance using mapping API
        distanceResult = await getDeliveryDistance(
          farmer.address.latitude,
          farmer.address.longitude,
          retailer.address.latitude,
          retailer.address.longitude
        );
      } else {
        // Fallback to random estimate if no coordinates
        distanceResult = {
          distance: Math.floor(Math.random() * 45) + 5,
          method: "estimated",
        };
      }

      const estimatedDistance = distanceResult.distance;

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

    // Update order status
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "completed",
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
      data: orders.map((order) => ({
        ...order,
        _id: order._id!.toString(),
        farmerId: order.farmerId.toString(),
        retailerId: order.retailerId?.toString(),
        produceId: order.produceId.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
