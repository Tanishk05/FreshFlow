/**
 * Settings Repository
 * Single Responsibility: Handle all database operations for system settings
 * Dependency Inversion: Provides abstraction over database access
 */

import client from "@/lib/db";
import { DatabaseConfig } from "@/lib/config";

export interface SystemSettingsDB {
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

export class SettingsRepository {
  private async getCollection() {
    const dbClient = await client;
    const db = dbClient.db(DatabaseConfig.defaultDatabase);
    return db.collection<SystemSettingsDB>("system_settings");
  }

  async findOne(): Promise<SystemSettingsDB | null> {
    const collection = await this.getCollection();
    return collection.findOne({});
  }

  async create(settings: SystemSettingsDB): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(settings);
  }

  async update(
    updates: Partial<SystemSettingsDB> | Record<string, any>
  ): Promise<{ success: boolean; modifiedCount: number; upsertedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );
    
    return {
      success: result.modifiedCount > 0 || result.upsertedCount > 0,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    };
  }

  async updateField(
    field: string,
    value: any
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      {},
      { $set: { [field]: value } }
    );
    
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }
}

// Export singleton instance
export const settingsRepository = new SettingsRepository();

