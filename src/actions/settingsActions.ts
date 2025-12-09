"use server";

import { auth } from "@/auth";
import client from "@/lib/db";

// System settings interface for database (with Date)
interface SystemSettingsDB {
  _id?: any;
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
  updatedAt: Date;
  updatedBy: string;
}

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

async function getSettingsCollection() {
  const dbClient = await client;
  const db = dbClient.db(process.env.MONGODB_DB);
  return db.collection<SystemSettingsDB>("system_settings");
}

// Get system settings
export async function getSystemSettings(): Promise<SystemSettings> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const settingsCollection = await getSettingsCollection();
  let settings = await settingsCollection.findOne({});

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
      updatedBy: session.user.email || "system",
    };

    await settingsCollection.insertOne(defaultSettings);
    // Fetch the inserted document to get the _id
    settings = await settingsCollection.findOne({});
  }

  if (!settings) {
    throw new Error("Failed to create or retrieve system settings");
  }

  // Serialize for client components: convert ObjectId to string and Date to ISO string
  return {
    _id: settings._id?.toString(),
    aiFeatures: settings.aiFeatures,
    emailNotifications: settings.emailNotifications,
    features: settings.features,
    apiLimits: settings.apiLimits,
    maintenance: settings.maintenance,
    updatedAt: settings.updatedAt instanceof Date 
      ? settings.updatedAt.toISOString() 
      : typeof settings.updatedAt === 'string' 
        ? settings.updatedAt 
        : new Date().toISOString(),
    updatedBy: settings.updatedBy,
  } as SystemSettings;
}

// Update system settings (admin only)
export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  // Check if admin
  const { isAdmin } = await import("./adminActions");
  if (!(await isAdmin())) {
    return { success: false, message: "Admin access required" };
  }

  try {
    const settingsCollection = await getSettingsCollection();

    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: session.user.email || "admin",
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      return { success: true, message: "Settings updated successfully" };
    } else {
      return { success: false, message: "No changes made" };
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, message: "Failed to update settings" };
  }
}

// Toggle AI features
export async function toggleAIFeature(
  feature: keyof SystemSettings["aiFeatures"],
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const { isAdmin } = await import("./adminActions");
  if (!(await isAdmin())) {
    return { success: false, message: "Admin access required" };
  }

  try {
    const settingsCollection = await getSettingsCollection();

    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          [`aiFeatures.${feature}`]: enabled,
          updatedAt: new Date(),
          updatedBy: session.user.email || "admin",
        },
      }
    );

    if (result.modifiedCount > 0) {
      return {
        success: true,
        message: `AI feature ${feature} ${enabled ? "enabled" : "disabled"}`,
      };
    } else {
      return { success: false, message: "Failed to update feature" };
    }
  } catch (error) {
    console.error("Error toggling AI feature:", error);
    return { success: false, message: "Failed to toggle AI feature" };
  }
}

// Toggle email notifications
export async function toggleEmailNotifications(
  type: keyof SystemSettings["emailNotifications"],
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const { isAdmin } = await import("./adminActions");
  if (!(await isAdmin())) {
    return { success: false, message: "Admin access required" };
  }

  try {
    const settingsCollection = await getSettingsCollection();

    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          [`emailNotifications.${type}`]: enabled,
          updatedAt: new Date(),
          updatedBy: session.user.email || "admin",
        },
      }
    );

    if (result.modifiedCount > 0) {
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
    console.error("Error toggling email notifications:", error);
    return { success: false, message: "Failed to toggle notifications" };
  }
}

// Toggle maintenance mode
export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const { isAdmin } = await import("./adminActions");
  if (!(await isAdmin())) {
    return { success: false, message: "Admin access required" };
  }

  try {
    const settingsCollection = await getSettingsCollection();

    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          "maintenance.enabled": enabled,
          "maintenance.message": message || "",
          updatedAt: new Date(),
          updatedBy: session.user.email || "admin",
        },
      }
    );

    if (result.modifiedCount > 0) {
      return {
        success: true,
        message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      };
    } else {
      return { success: false, message: "Failed to update maintenance mode" };
    }
  } catch (error) {
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
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { isAdmin } = await import("./adminActions");
  if (!(await isAdmin())) {
    throw new Error("Admin access required");
  }

  try {
    const dbClient = await client;
    const db = dbClient.db(process.env.MONGODB_DB);

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
