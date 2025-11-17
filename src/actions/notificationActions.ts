"use server";

import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { getNotificationCollection, Notification } from "@/models/Notification";
import { getPushSubscriptionCollection } from "@/models/PushSubscription";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

// Configure web-push with VAPID keys
// You'll need to generate these and add to .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Create notification in database
export async function createNotification(
  userId: ObjectId,
  alert: {
    id: string;
    type: "critical" | "warning" | "info" | "reminder";
    category: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const notificationCollection = await getNotificationCollection();

    // Check if notification already exists for this alert
    const existing = await notificationCollection.findOne({
      userId,
      alertId: alert.id,
    });

    if (existing) {
      return; // Don't create duplicate notifications
    }

    const notification: Notification = {
      userId,
      alertId: alert.id,
      type: alert.type,
      category: alert.category,
      title: alert.title,
      message: alert.message,
      read: false,
      createdAt: new Date(),
      metadata: alert.metadata,
    };

    await notificationCollection.insertOne(notification);

    // Send push notification
    await sendPushNotification(userId, alert);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Send push notification to user's devices
async function sendPushNotification(
  userId: ObjectId,
  alert: {
    title: string;
    message: string;
    type: string;
  }
): Promise<void> {
  try {
    const subscriptionCollection = await getPushSubscriptionCollection();
    const subscriptions = await subscriptionCollection
      .find({ userId })
      .toArray();

    const payload = JSON.stringify({
      title: alert.title,
      body: alert.message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: alert.type,
      data: {
        url: "/dashboard",
      },
    });

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );

        // Update last used timestamp
        await subscriptionCollection.updateOne(
          { _id: subscription._id },
          { $set: { lastUsed: new Date() } }
        );
      } catch (error: unknown) {
        // If subscription is invalid, remove it
        if (
          error &&
          typeof error === "object" &&
          "statusCode" in error &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await subscriptionCollection.deleteOne({ _id: subscription._id });
        }
        console.error("Error sending push notification:", error);
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
  }
}

// Get user's notifications
export async function getMyNotifications(
  limit: number = 50
): Promise<Notification[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const notificationCollection = await getNotificationCollection();

  const notifications = await notificationCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return notifications;
}

// Get unread notification count
export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const notificationCollection = await getNotificationCollection();

  return await notificationCollection.countDocuments({ userId, read: false });
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const notificationCollection = await getNotificationCollection();

  await notificationCollection.updateOne(
    { _id: new ObjectId(notificationId), userId },
    { $set: { read: true, readAt: new Date() } }
  );

  revalidatePath("/dashboard");
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const notificationCollection = await getNotificationCollection();

  await notificationCollection.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  revalidatePath("/dashboard");
}

// Subscribe to push notifications
export async function subscribeToPush(
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!subscription.endpoint || !subscription.keys) {
      return { success: false, error: "Invalid subscription" };
    }

    const userId = new ObjectId(session.user.id);
    const subscriptionCollection = await getPushSubscriptionCollection();

    // Check if subscription already exists
    const existing = await subscriptionCollection.findOne({
      userId,
      endpoint: subscription.endpoint,
    });

    if (existing) {
      // Update existing subscription
      await subscriptionCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            keys: {
              p256dh: subscription.keys.p256dh!,
              auth: subscription.keys.auth!,
            },
            lastUsed: new Date(),
          },
        }
      );
    } else {
      // Create new subscription
      await subscriptionCollection.insertOne({
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh!,
          auth: subscription.keys.auth!,
        },
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        createdAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(
  endpoint: string
): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = new ObjectId(session.user.id);
    const subscriptionCollection = await getPushSubscriptionCollection();

    await subscriptionCollection.deleteOne({ userId, endpoint });

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return { success: false };
  }
}
