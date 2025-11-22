"use server";

import { auth } from "@/auth";
import client from "@/lib/db";

// System settings interface
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
  updatedAt: Date;
  updatedBy: string;
}

async function getSettingsCollection() {
  const dbClient = await client;
  const db = dbClient.db(process.env.MONGODB_DB);
  return db.collection<SystemSettings>("system_settings");
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
    const defaultSettings: SystemSettings = {
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
      updatedAt: new Date(),
      updatedBy: session.user.email || "system",
    };

    await settingsCollection.insertOne(defaultSettings);
    settings = { ...defaultSettings, _id: "" };
  }

  return settings as SystemSettings;
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

  // TODO: Implement actual statistics gathering
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
