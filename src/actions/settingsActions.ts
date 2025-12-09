"use server";

import { requireAuth, requireAdmin } from "@/services/auth.service";
import { settingsRepository, type SystemSettingsDB } from "@/repositories/settings.repository";
import { serializeDate, serializeObjectId } from "@/lib/serialization";
import client from "@/lib/db";
import { DatabaseConfig } from "@/lib/config";

// System settings interface (serialized for client components)
export interface SystemSettings {
  _id?: string;
  aiFeatures: {
    enabled: boolean;
    dynamicPricing: boolean;
    marketIntelligence: boolean;
    personalizedInsights: boolean;
    demandForecasting: boolean;
  };
  emailNotifications: {
    enabled: boolean;
    criticalAlerts: boolean;
    warningAlerts: boolean;
    infoAlerts: boolean;
  };
  features: {
    userRegistration: boolean;
    publicMarketplace: boolean;
    orderTracking: boolean;
    inventoryManagement: boolean;
  };
  apiLimits: {
    geminiDailyLimit: number;
    geminiRateLimit: number;
    emailDailyLimit: number;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  updatedAt: string; // ISO string for client components
  updatedBy: string;
}


// Get system settings
export async function getSystemSettings(): Promise<SystemSettings> {
  // Check authentication
  const { userEmail } = await requireAuth();

  // Use repository to fetch settings
  let settings = await settingsRepository.findOne();

  if (!settings) {
    // Create default settings
    const now = new Date();
    const defaultSettings: SystemSettingsDB = {
      aiFeatures: {
        enabled: true,
        dynamicPricing: true,
        marketIntelligence: true,
        personalizedInsights: true,
        demandForecasting: true,
      },
      emailNotifications: {
        enabled: true,
        criticalAlerts: true,
        warningAlerts: true,
        infoAlerts: false,
      },
      features: {
        userRegistration: true,
        publicMarketplace: true,
        orderTracking: true,
        inventoryManagement: true,
      },
      apiLimits: {
        geminiDailyLimit: 1500,
        geminiRateLimit: 15,
        emailDailyLimit: 1000,
      },
      maintenance: {
        enabled: false,
        message: "",
      },
      updatedAt: now,
      updatedBy: userEmail || "system",
    };

    await settingsRepository.create(defaultSettings);
    // Fetch the inserted document to get the _id
    settings = await settingsRepository.findOne();
  }

  if (!settings) {
    throw new Error("Failed to create or retrieve system settings");
  }

  // Serialize for client components: convert ObjectId to string and Date to ISO string
  return {
    _id: serializeObjectId(settings._id) || undefined,
    aiFeatures: settings.aiFeatures,
    emailNotifications: settings.emailNotifications,
    features: settings.features,
    apiLimits: settings.apiLimits,
    maintenance: settings.maintenance,
    updatedAt: serializeDate(settings.updatedAt) || new Date().toISOString(),
    updatedBy: settings.updatedBy,
  } as SystemSettings;
}

// Update system settings (admin only)
export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    const { userEmail } = await requireAdmin();

    // Use repository to update settings
    const result = await settingsRepository.update({
      ...updates,
      updatedAt: new Date(),
      updatedBy: userEmail || "admin",
    } as Partial<SystemSettingsDB>);

    if (result.success) {
      return { success: true, message: "Settings updated successfully" };
    } else {
      return { success: false, message: "No changes made" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error updating settings:", error);
    return { success: false, message: "Failed to update settings" };
  }
}

// Toggle AI features
export async function toggleAIFeature(
  feature: keyof SystemSettings["aiFeatures"],
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    const { userEmail } = await requireAdmin();

    // Use repository to update feature
    const result = await settingsRepository.updateField(
      `aiFeatures.${feature}`,
      enabled
    );

    // Also update metadata
    await settingsRepository.updateField("updatedAt", new Date());
    await settingsRepository.updateField("updatedBy", userEmail || "admin");

    if (result.success) {
      return {
        success: true,
        message: `AI feature ${feature} ${enabled ? "enabled" : "disabled"}`,
      };
    } else {
      return { success: false, message: "Failed to update feature" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error toggling AI feature:", error);
    return { success: false, message: "Failed to toggle AI feature" };
  }
}

// Toggle email notifications
export async function toggleEmailNotifications(
  type: keyof SystemSettings["emailNotifications"],
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    const { userEmail } = await requireAdmin();

    // Use repository to update notifications and metadata in one call
    const result = await settingsRepository.update({
      [`emailNotifications.${type}`]: enabled,
      updatedAt: new Date(),
      updatedBy: userEmail || "admin",
    });

    if (result.success) {
      return {
        success: true,
        message: `Email notifications ${type} ${
          enabled ? "enabled" : "disabled"
        }`,
      };
    } else {
      return { success: false, message: "Failed to update notifications" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error toggling email notifications:", error);
    return { success: false, message: "Failed to toggle notifications" };
  }
}

// Toggle maintenance mode
export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    const { userEmail } = await requireAdmin();

    // Use repository to update maintenance mode
    const result = await settingsRepository.update({
      "maintenance.enabled": enabled,
      "maintenance.message": message || "",
      updatedAt: new Date(),
      updatedBy: userEmail || "admin",
    } as Partial<SystemSettingsDB>);

    if (result.success) {
      return {
        success: true,
        message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      };
    } else {
      return { success: false, message: "Failed to update maintenance mode" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error toggling maintenance mode:", error);
    return { success: false, message: "Failed to toggle maintenance mode" };
  }
}

// Get system statistics
export async function getSystemStats(): Promise<{
  users: {
    total: number;
    farmers: number;
    distributors: number;
    retailers: number;
  };
  activity: {
    todayOrders: number;
    todayRevenue: number;
    activeShipments: number;
  };
  ai: {
    apiCallsToday: number;
    cacheHitRate: number;
    emailsSentToday: number;
  };
}> {
  // Check admin access
  await requireAdmin();

  try {
    const dbClient = await client;
    const db = dbClient.db(DatabaseConfig.defaultDatabase);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user statistics
    const usersCollection = db.collection("users");
    const [totalUsers, farmers, distributors, retailers] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ role: "farmer" }),
      usersCollection.countDocuments({ role: "distributor" }),
      usersCollection.countDocuments({ role: "retailer" }),
    ]);

    // Get order statistics
    const ordersCollection = db.collection("orders");
    const retailerOrdersCollection = db.collection("retailer_orders");

    // Today's orders (from both collections)
    const [todayOrdersCount, todayRetailerOrdersCount] = await Promise.all([
      ordersCollection.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      retailerOrdersCollection.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
    ]);

    const todayOrders = todayOrdersCount + todayRetailerOrdersCount;

    // Today's revenue (sum of totalPrice from orders and totalAmount + deliveryFee from retailer_orders)
    const [todayOrdersRevenue, todayRetailerOrdersRevenue] = await Promise.all([
      ordersCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: today, $lt: tomorrow },
              status: { $in: ["approved", "completed"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalPrice" },
            },
          },
        ])
        .toArray(),
      retailerOrdersCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: today, $lt: tomorrow },
              status: { $in: ["assigned", "in-transit", "delivered"] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $add: [
                    "$totalAmount",
                    { $ifNull: ["$finalDeliveryFee", "$deliveryFee"] },
                  ],
                },
              },
            },
          },
        ])
        .toArray(),
    ]);

    const todayRevenue =
      (todayOrdersRevenue[0]?.total || 0) +
      (todayRetailerOrdersRevenue[0]?.total || 0);

    // Active shipments (in-transit, picked-up, awaiting-pickup)
    const shipmentsCollection = db.collection("shipments");
    const activeShipments = await shipmentsCollection.countDocuments({
      status: { $in: ["awaiting-pickup", "picked-up", "in-transit"] },
    });

    // Email statistics (emails sent today)
    const alertEmailsCollection = db.collection("alertEmails");
    const emailsSentToday = await alertEmailsCollection.countDocuments({
      sentAt: { $gte: today, $lt: tomorrow },
    });

    // AI API calls - This would need to be tracked separately
    // For now, we'll estimate based on settings or return 0
    // You can implement a separate collection to track AI API calls
    const apiCallsToday = 0; // TODO: Implement AI API call tracking
    const cacheHitRate = 0; // TODO: Implement cache hit rate tracking

    return {
      users: {
        total: totalUsers,
        farmers,
        distributors,
        retailers,
      },
      activity: {
        todayOrders,
        todayRevenue: Math.round(todayRevenue * 100) / 100, // Round to 2 decimal places
        activeShipments,
      },
      ai: {
        apiCallsToday,
        cacheHitRate,
        emailsSentToday,
      },
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    // Return default values on error
    return {
      users: {
        total: 0,
        farmers: 0,
        distributors: 0,
        retailers: 0,
      },
      activity: {
        todayOrders: 0,
        todayRevenue: 0,
        activeShipments: 0,
      },
      ai: {
        apiCallsToday: 0,
        cacheHitRate: 0,
        emailsSentToday: 0,
      },
    };
  }
}
