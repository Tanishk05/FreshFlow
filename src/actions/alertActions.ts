"use server";

import { getProduceCollection } from "@/models/Produce";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export type AlertType = "critical" | "warning" | "info" | "reminder";
export type AlertCategory =
  | "shelf_life"
  | "expiring_soon"
  | "expired"
  | "low_stock"
  | "order_pending"
  | "harvest_reminder"
  | "temperature"
  | "quality"
  | "delivery"
  | "pricing"
  | "demand"
  | "logistics"
  | "supplier"
  | "inventory";

export interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  produceId?: string;
  produceName?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

function calculateDaysUntilExpiry(
  harvestDate: string,
  shelfLifeDays: number
): number {
  const harvest = new Date(harvestDate);
  const expiry = new Date(harvest);
  expiry.setDate(expiry.getDate() + shelfLifeDays);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

async function getFarmerAlerts(userId: ObjectId): Promise<Alert[]> {
  const produceCollection = await getProduceCollection();
  const alerts: Alert[] = [];
  const now = new Date();

  const farmerProduce = await produceCollection
    .find({ userId: userId })
    .toArray();

  for (const produce of farmerProduce) {
    const daysUntilExpiry = calculateDaysUntilExpiry(
      produce.harvestDate,
      produce.shelfLifeDays
    );

    if (daysUntilExpiry <= 0) {
      alerts.push({
        id: `expired-${produce._id?.toString()}`,
        type: "critical",
        category: "expired",
        title: "⚠️ Produce Expired",
        message: `${produce.name} has expired. Remove from inventory.`,
        produceId: produce._id?.toString(),
        produceName: produce.name,
        createdAt: now,
        metadata: {
          daysOverdue: Math.abs(daysUntilExpiry),
          harvestDate: produce.harvestDate,
        },
      });
    } else if (daysUntilExpiry <= 2) {
      alerts.push({
        id: `expiring-soon-${produce._id?.toString()}`,
        type: "warning",
        category: "expiring_soon",
        title: "⏰ Produce Expiring Soon",
        message: `${produce.name} will expire in ${daysUntilExpiry} day(s).`,
        produceId: produce._id?.toString(),
        produceName: produce.name,
        createdAt: now,
        metadata: { daysUntilExpiry, harvestDate: produce.harvestDate },
      });
    } else if (daysUntilExpiry <= 5) {
      alerts.push({
        id: `shelf-life-${produce._id?.toString()}`,
        type: "info",
        category: "shelf_life",
        title: "📅 Limited Shelf Life",
        message: `${produce.name} has ${daysUntilExpiry} days remaining.`,
        produceId: produce._id?.toString(),
        produceName: produce.name,
        createdAt: now,
        metadata: { daysUntilExpiry, harvestDate: produce.harvestDate },
      });
    }

    if (produce.quantity < 20 && produce.quantity > 0) {
      alerts.push({
        id: `low-stock-${produce._id?.toString()}`,
        type: "warning",
        category: "low_stock",
        title: "📦 Low Stock",
        message: `${produce.name} stock is low (${produce.quantity} ${produce.unit}).`,
        produceId: produce._id?.toString(),
        produceName: produce.name,
        createdAt: now,
        metadata: { currentStock: produce.quantity, unit: produce.unit },
      });
    }

    if (produce.quantity === 0) {
      alerts.push({
        id: `out-of-stock-${produce._id?.toString()}`,
        type: "critical",
        category: "low_stock",
        title: "❌ Out of Stock",
        message: `${produce.name} is out of stock.`,
        produceId: produce._id?.toString(),
        produceName: produce.name,
        createdAt: now,
        metadata: { currentStock: 0 },
      });
    }
  }

  const { getOrdersCollection } = await import("@/models/Order");
  const ordersCollection = await getOrdersCollection();
  const pendingOrders = await ordersCollection
    .find({ farmerId: userId, status: "pending" })
    .toArray();

  if (pendingOrders.length > 0) {
    alerts.push({
      id: `pending-orders-${now.getTime()}`,
      type: "warning",
      category: "order_pending",
      title: "📋 Pending Orders",
      message: `You have ${pendingOrders.length} pending order(s).`,
      createdAt: now,
      metadata: { count: pendingOrders.length },
    });
  }

  const priorityOrder = { critical: 0, warning: 1, info: 2, reminder: 3 };
  alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
  return alerts;
}

async function getRetailerAlerts(userId: ObjectId): Promise<Alert[]> {
  const produceCollection = await getProduceCollection();
  const alerts: Alert[] = [];
  const now = new Date();

  const { getStoreInventoryCollection } = await import(
    "@/models/StoreInventory"
  );
  const storeInventoryCollection = await getStoreInventoryCollection();
  const myInventory = await storeInventoryCollection
    .find({ retailerId: userId })
    .toArray();

  const expiringSoon = myInventory.filter((item) => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiryDate).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
  });

  if (expiringSoon.length > 0) {
    alerts.push({
      id: `expiring-soon-${now.getTime()}`,
      type: "critical",
      category: "expiring_soon",
      title: "⚠️ Items Expiring Soon",
      message: `${expiringSoon.length} item(s) will expire within 2 days.`,
      createdAt: now,
      metadata: { count: expiringSoon.length },
    });
  }

  const lowStockItems = myInventory.filter(
    (item) => item.stock <= item.reorderPoint
  );
  if (lowStockItems.length > 0) {
    alerts.push({
      id: `low-stock-${now.getTime()}`,
      type: "warning",
      category: "low_stock",
      title: "📦 Low Stock Alert",
      message: `${lowStockItems.length} item(s) have reached reorder point.`,
      createdAt: now,
      metadata: { count: lowStockItems.length },
    });
  }

  const marketplaceProduce = await produceCollection
    .find({ isVisible: true, isAvailable: true })
    .limit(20)
    .toArray();
  if (marketplaceProduce.length === 0) {
    alerts.push({
      id: "no-produce",
      type: "warning",
      category: "supplier",
      title: "⚠️ No Produce Available",
      message: "No produce currently available in the marketplace.",
      createdAt: now,
    });
  }

  const priorityOrder = { critical: 0, warning: 1, info: 2, reminder: 3 };
  alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
  return alerts;
}

async function getDistributorAlerts(userId: ObjectId): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  try {
    const { getRetailerOrderCollection } = await import(
      "@/models/RetailerOrder"
    );
    const { getFleetCollection } = await import("@/models/Fleet");

    const [ordersCollection, fleetCollection] = await Promise.all([
      getRetailerOrderCollection(),
      getFleetCollection(),
    ]);

    const pendingOrders = await ordersCollection
      .find({ distributorId: userId, status: "pending" })
      .toArray();
    if (pendingOrders.length > 0) {
      alerts.push({
        id: `pending-orders-${now.getTime()}`,
        type: "warning",
        category: "logistics",
        title: "🚚 Pending Deliveries",
        message: `${pendingOrders.length} deliveries awaiting assignment.`,
        createdAt: now,
        metadata: { count: pendingOrders.length },
      });
    }

    const trucksWithTempIssues = await fleetCollection
      .find({
        distributorId: userId,
        status: "on-route",
        temperatureC: { $gt: 4 },
      })
      .toArray();
    for (const truck of trucksWithTempIssues) {
      if (truck.temperatureC && truck.temperatureC > 4) {
        alerts.push({
          id: `temp-alert-${truck._id?.toString()}`,
          type: "critical",
          category: "temperature",
          title: "🌡️ Temperature Alert",
          message: `Truck ${truck.truckNumber} at ${truck.temperatureC.toFixed(
            1
          )}°C.`,
          createdAt: now,
          metadata: {
            truckId: truck._id?.toString(),
            temperature: truck.temperatureC,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error fetching distributor alerts:", error);
  }

  const priorityOrder = { critical: 0, warning: 1, info: 2, reminder: 3 };
  alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
  return alerts;
}

export async function getMyAlerts(): Promise<Alert[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const userRole = session.user.role;

  let alerts: Alert[] = [];

  switch (userRole) {
    case "farmer":
      alerts = await getFarmerAlerts(userId);
      break;
    case "retailer":
      alerts = await getRetailerAlerts(userId);
      break;
    case "distributor":
      alerts = await getDistributorAlerts(userId);
      break;
    default:
      return [];
  }

  // Create notifications for new alerts and send email
  await processNewAlerts(userId, alerts, session);

  return alerts;
}

// Process new alerts and create notifications + send emails
async function processNewAlerts(
  userId: ObjectId,
  alerts: Alert[],
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      role?: string | null;
    };
  }
): Promise<void> {
  try {
    // Import notification and email services
    const { createNotification } = await import(
      "@/actions/notificationActions"
    );
    const { sendAlertEmail } = await import("@/lib/email");
    const { getAlertEmailCollection } = await import("@/models/AlertEmail");

    // Create notifications for critical and warning alerts
    const importantAlerts = alerts.filter(
      (alert) => alert.type === "critical" || alert.type === "warning"
    );

    // Check which alerts haven't been sent yet
    const alertEmailCollection = await getAlertEmailCollection();
    const newAlerts = [];

    for (const alert of importantAlerts) {
      // Check if this alert email was already sent
      const existingEmail = await alertEmailCollection.findOne({
        userId: userId,
        alertId: alert.id,
      });

      if (!existingEmail) {
        newAlerts.push(alert);

        // Create in-app notification
        await createNotification(userId, alert);
      }
    }

    // Send email notification only for new alerts
    if (
      newAlerts.length > 0 &&
      session.user?.email &&
      session.user?.name &&
      session.user?.role
    ) {
      const userEmail = session.user.email;

      await sendAlertEmail(
        userEmail,
        session.user.name,
        session.user.role,
        newAlerts
      );

      // Track that we sent these emails
      const emailRecords = newAlerts.map((alert) => ({
        userId: userId,
        alertId: alert.id,
        email: userEmail,
        sentAt: new Date(),
      }));

      await alertEmailCollection.insertMany(emailRecords);
    }
  } catch (error) {
    console.error("Error processing new alerts:", error);
  }
}
