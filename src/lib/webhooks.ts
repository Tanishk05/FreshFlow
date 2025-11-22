/**
 * Webhook system for real-time notifications
 * Triggers instant alerts when orders are created or updated
 */

import { sendEmail } from "./email";

export type WebhookEvent =
  | "order.created"
  | "order.approved"
  | "order.assigned"
  | "order.picked_up"
  | "order.in_transit"
  | "order.delivered"
  | "order.cancelled"
  | "order.rejected";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: {
    orderId: string;
    farmerId?: string;
    retailerId?: string;
    distributorId?: string;
    produceName: string;
    quantity: number;
    unit: string;
    status: string;
    farmerEmail?: string;
    farmerName?: string;
    retailerEmail?: string;
    retailerName?: string;
    distributorEmail?: string;
    distributorName?: string;
    deliveryFee?: number;
    destination?: string;
  };
}

/**
 * Trigger webhook event and send notifications
 */
export async function triggerWebhook(payload: WebhookPayload): Promise<void> {
  try {
    console.log(`[Webhook] Event triggered: ${payload.event}`, {
      orderId: payload.data.orderId,
      timestamp: payload.timestamp,
    });

    // Send notifications based on event type
    await Promise.all([
      sendNotificationsByEvent(payload),
      sendEmailsByEvent(payload),
    ]);
  } catch (error) {
    console.error("[Webhook] Error triggering webhook:", error);
    throw error;
  }
}

/**
 * Send in-app notifications based on webhook event
 */
async function sendNotificationsByEvent(
  payload: WebhookPayload
): Promise<void> {
  const { event, data } = payload;

  switch (event) {
    case "order.created":
      // Notify farmer about new order from retailer
      if (data.farmerId) {
        await createNotification({
          userId: data.farmerId,
          type: "order",
          title: "🎉 New Order Received!",
          message: `${data.retailerName || "A retailer"} ordered ${
            data.quantity
          } ${data.unit} of ${data.produceName}`,
          link: `/dashboard/farmer`,
          priority: "high",
        });
      }
      break;

    case "order.approved":
      // Notify retailer and distributors when farmer approves
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "order",
          title: "✅ Order Approved!",
          message: `Your order for ${data.quantity} ${data.unit} of ${data.produceName} has been approved`,
          link: `/dashboard/retailer`,
          priority: "medium",
        });
      }
      // Broadcast to distributors about available job
      await broadcastToDistributors({
        type: "job",
        title: "🚚 New Delivery Job Available!",
        message: `${data.quantity} ${data.unit} of ${data.produceName} needs delivery`,
        link: `/order-book`,
        priority: "high",
        orderId: data.orderId,
      });
      break;

    case "order.assigned":
      // Notify farmer that distributor accepted
      if (data.farmerId) {
        await createNotification({
          userId: data.farmerId,
          type: "shipment",
          title: "🚛 Distributor Assigned!",
          message: `${
            data.distributorName || "A distributor"
          } will deliver your ${data.produceName} order`,
          link: `/dashboard/farmer`,
          priority: "medium",
        });
      }
      // Notify retailer about assignment
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "shipment",
          title: "🚛 Delivery Assigned!",
          message: `Your order for ${data.produceName} has been assigned to a distributor`,
          link: `/dashboard/retailer`,
          priority: "medium",
        });
      }
      break;

    case "order.picked_up":
      // Notify retailer and distributor
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "shipment",
          title: "📦 Order Picked Up!",
          message: `Your ${data.produceName} order is being prepared for delivery`,
          link: `/dashboard/retailer`,
          priority: "medium",
        });
      }
      break;

    case "order.in_transit":
      // Notify retailer about shipment
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "shipment",
          title: "🚚 Order In Transit!",
          message: `Your ${data.produceName} order is on the way to ${
            data.destination || "you"
          }`,
          link: `/dashboard/retailer`,
          priority: "high",
        });
      }
      break;

    case "order.delivered":
      // Notify all parties about successful delivery
      if (data.farmerId) {
        await createNotification({
          userId: data.farmerId,
          type: "order",
          title: "✅ Order Delivered!",
          message: `Your ${data.produceName} has been successfully delivered`,
          link: `/dashboard/farmer`,
          priority: "low",
        });
      }
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "order",
          title: "📦 Order Received!",
          message: `Your ${data.produceName} order has been delivered`,
          link: `/dashboard/retailer`,
          priority: "medium",
        });
      }
      if (data.distributorId) {
        await createNotification({
          userId: data.distributorId,
          type: "payment",
          title: "💰 Delivery Completed!",
          message: `You earned ₹${data.deliveryFee?.toFixed(
            2
          )} for delivering ${data.produceName}`,
          link: `/dashboard/distributor`,
          priority: "low",
        });
      }
      break;

    case "order.cancelled":
    case "order.rejected":
      // Notify retailer about cancellation/rejection
      if (data.retailerId) {
        await createNotification({
          userId: data.retailerId,
          type: "alert",
          title:
            event === "order.cancelled"
              ? "❌ Order Cancelled"
              : "⚠️ Order Rejected",
          message: `Your order for ${data.produceName} has been ${
            event === "order.cancelled" ? "cancelled" : "rejected"
          }`,
          link: `/dashboard/retailer`,
          priority: "high",
        });
      }
      break;
  }
}

/**
 * Send email notifications based on webhook event
 */
async function sendEmailsByEvent(payload: WebhookPayload): Promise<void> {
  const { event, data } = payload;

  try {
    switch (event) {
      case "order.created":
        // Email farmer about new order
        if (data.farmerEmail) {
          await sendEmail({
            to: data.farmerEmail,
            subject: "🎉 New Order Received - FreshFlow",
            html: `
              <h2>New Order Alert!</h2>
              <p>Hello ${data.farmerName || "Farmer"},</p>
              <p>You have received a new order:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
                <li><strong>Retailer:</strong> ${
                  data.retailerName || "N/A"
                }</li>
              </ul>
              <p>Please log in to your dashboard to approve or reject this order.</p>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL
              }/dashboard/farmer" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                View Order
              </a>
            `,
          });
        }
        break;

      case "order.approved":
        // Email retailer about approval
        if (data.retailerEmail) {
          await sendEmail({
            to: data.retailerEmail,
            subject: "✅ Order Approved - FreshFlow",
            html: `
              <h2>Order Approved!</h2>
              <p>Hello ${data.retailerName || "Retailer"},</p>
              <p>Great news! Your order has been approved by the farmer:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
              </ul>
              <p>A distributor will be assigned soon to deliver your order.</p>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL
              }/dashboard/retailer" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                Track Order
              </a>
            `,
          });
        }
        // Email distributors about new job
        await broadcastEmailToDistributors({
          subject: "🚚 New Delivery Job Available - FreshFlow",
          message: `A new delivery job is available for ${data.quantity} ${data.unit} of ${data.produceName}. Check the order book to accept this job.`,
        });
        break;

      case "order.assigned":
        // Email farmer about distributor assignment
        if (data.farmerEmail) {
          await sendEmail({
            to: data.farmerEmail,
            subject: "🚛 Distributor Assigned - FreshFlow",
            html: `
              <h2>Distributor Assigned!</h2>
              <p>Hello ${data.farmerName || "Farmer"},</p>
              <p>A distributor has been assigned to pick up your order:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
                <li><strong>Distributor:</strong> ${
                  data.distributorName || "N/A"
                }</li>
              </ul>
              <p>Please prepare the order for pickup.</p>
            `,
          });
        }
        // Email retailer
        if (data.retailerEmail) {
          await sendEmail({
            to: data.retailerEmail,
            subject: "🚛 Delivery Assigned - FreshFlow",
            html: `
              <h2>Delivery Assigned!</h2>
              <p>Hello ${data.retailerName || "Retailer"},</p>
              <p>Your order has been assigned to a distributor:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
              </ul>
              <p>You will receive updates as the delivery progresses.</p>
            `,
          });
        }
        // Email distributor confirmation
        if (data.distributorEmail) {
          await sendEmail({
            to: data.distributorEmail,
            subject: "✅ Job Accepted - FreshFlow",
            html: `
              <h2>Delivery Job Confirmed!</h2>
              <p>Hello ${data.distributorName || "Distributor"},</p>
              <p>You have successfully accepted a delivery job:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
                <li><strong>Delivery Fee:</strong> ₹${
                  data.deliveryFee?.toFixed(2) || "N/A"
                }</li>
                <li><strong>Destination:</strong> ${
                  data.destination || "N/A"
                }</li>
              </ul>
              <p>Please coordinate with the farmer for pickup.</p>
            `,
          });
        }
        break;

      case "order.in_transit":
        // Email retailer about shipment
        if (data.retailerEmail) {
          await sendEmail({
            to: data.retailerEmail,
            subject: "🚚 Order In Transit - FreshFlow",
            html: `
              <h2>Your Order is On the Way!</h2>
              <p>Hello ${data.retailerName || "Retailer"},</p>
              <p>Your order is now in transit:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
                <li><strong>Destination:</strong> ${
                  data.destination || "Your location"
                }</li>
              </ul>
              <p>Track your delivery in real-time on your dashboard.</p>
            `,
          });
        }
        break;

      case "order.delivered":
        // Email all parties
        if (data.farmerEmail) {
          await sendEmail({
            to: data.farmerEmail,
            subject: "✅ Order Delivered Successfully - FreshFlow",
            html: `
              <h2>Delivery Completed!</h2>
              <p>Hello ${data.farmerName || "Farmer"},</p>
              <p>Your ${
                data.produceName
              } order has been successfully delivered to the retailer.</p>
              <p>Thank you for using FreshFlow!</p>
            `,
          });
        }
        if (data.retailerEmail) {
          await sendEmail({
            to: data.retailerEmail,
            subject: "📦 Order Delivered - FreshFlow",
            html: `
              <h2>Order Received!</h2>
              <p>Hello ${data.retailerName || "Retailer"},</p>
              <p>Your order has been delivered:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
              </ul>
              <p>Thank you for choosing FreshFlow!</p>
            `,
          });
        }
        if (data.distributorEmail) {
          await sendEmail({
            to: data.distributorEmail,
            subject: "💰 Delivery Payment - FreshFlow",
            html: `
              <h2>Delivery Completed!</h2>
              <p>Hello ${data.distributorName || "Distributor"},</p>
              <p>Congratulations! You have earned ₹${data.deliveryFee?.toFixed(
                2
              )} for this delivery:</p>
              <ul>
                <li><strong>Product:</strong> ${data.produceName}</li>
                <li><strong>Quantity:</strong> ${data.quantity} ${
              data.unit
            }</li>
              </ul>
              <p>The payment will be processed according to your payment schedule.</p>
            `,
          });
        }
        break;
    }
  } catch (error) {
    console.error("[Webhook] Error sending emails:", error);
    // Don't throw - email failures shouldn't break the webhook
  }
}

/**
 * Create in-app notification
 */
async function createNotification(notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: "low" | "medium" | "high";
}): Promise<void> {
  try {
    const { ObjectId } = await import("mongodb");
    // Dynamic import to avoid circular dependencies
    const { createNotification: createNotificationAction } = await import(
      "@/actions/notificationActions"
    );

    // Map priority to notification type
    const typeMap: Record<
      string,
      "critical" | "warning" | "info" | "reminder"
    > = {
      high: "critical",
      medium: "warning",
      low: "info",
    };

    const notificationType = typeMap[notification.priority || "medium"];

    await createNotificationAction(new ObjectId(notification.userId), {
      id: `${notification.type}-${Date.now()}-${Math.random()}`,
      type: notificationType,
      category: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: { link: notification.link },
    });
  } catch (error) {
    console.error("[Webhook] Error creating notification:", error);
  }
}

/**
 * Broadcast notification to all distributors
 */
async function broadcastToDistributors(notification: {
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: "low" | "medium" | "high";
  orderId: string;
}): Promise<void> {
  try {
    const { getUsersCollection } = await import("@/models/User");
    const usersCollection = await getUsersCollection();

    // Get all distributors
    const distributors = await usersCollection
      .find({ role: "distributor" })
      .toArray();

    // Create notification for each distributor
    await Promise.all(
      distributors.map((distributor) =>
        createNotification({
          userId: distributor._id!.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          priority: notification.priority,
        })
      )
    );
  } catch (error) {
    console.error("[Webhook] Error broadcasting to distributors:", error);
  }
}

/**
 * Broadcast email to all distributors
 */
async function broadcastEmailToDistributors(data: {
  subject: string;
  message: string;
}): Promise<void> {
  try {
    const { getUsersCollection } = await import("@/models/User");
    const usersCollection = await getUsersCollection();

    // Get all distributors with email
    const distributors = await usersCollection
      .find({ role: "distributor", email: { $exists: true, $ne: null } })
      .toArray();

    // Send email to each distributor
    await Promise.all(
      distributors.map((distributor) =>
        sendEmail({
          to: distributor.email!,
          subject: data.subject,
          html: `
            <h2>New Delivery Job Available!</h2>
            <p>Hello ${distributor.name || "Distributor"},</p>
            <p>${data.message}</p>
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/order-book" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
              View Available Jobs
            </a>
          `,
        })
      )
    );
  } catch (error) {
    console.error("[Webhook] Error broadcasting email to distributors:", error);
  }
}
