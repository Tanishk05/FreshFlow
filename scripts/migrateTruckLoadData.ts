/**
 * Migration Script: Update Fleet and RetailerOrder Models
 *
 * This script migrates existing data to support the new truck load management system.
 *
 * Changes:
 * 1. Fleet collection:
 *    - Rename 'capacity' to 'capacityKg'
 *    - Add 'currentLoadKg' (default: 0)
 *    - Convert 'assignedOrderId' to 'assignedOrderIds' array
 *
 * 2. RetailerOrder collection:
 *    - Add 'totalWeightKg' field (set to quantity, assuming quantity is in kg)
 *
 * Run this script once to migrate existing data:
 * npx tsx scripts/migrateTruckLoadData.ts
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "freshflow";

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI environment variable is not set");
  console.error(
    "   Please ensure .env.local file exists with MONGODB_URI defined"
  );
  process.exit(1);
}

async function migrateTruckLoadData() {
  console.log("🚀 Starting truck load management data migration...\n");

  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(DB_NAME);

    // ==================== MIGRATE FLEET COLLECTION ====================
    console.log("📦 Migrating Fleet collection...");
    const fleetCollection = db.collection("fleet");

    // Get all fleet documents
    const fleetDocs = await fleetCollection.find({}).toArray();
    console.log(`   Found ${fleetDocs.length} fleet documents`);

    let fleetUpdated = 0;
    for (const fleet of fleetDocs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};

      // 1. Rename capacity to capacityKg (if exists)
      if (fleet.capacity !== undefined && fleet.capacityKg === undefined) {
        updates.capacityKg = fleet.capacity;
        updates.$unset = { capacity: "" };
      }

      // 2. Add currentLoadKg if not exists
      if (fleet.currentLoadKg === undefined) {
        updates.currentLoadKg = 0;
      }

      // 3. Convert assignedOrderId to assignedOrderIds array
      if (fleet.assignedOrderId !== undefined) {
        if (fleet.assignedOrderIds === undefined) {
          // Create array with the single order ID (only if not null)
          updates.assignedOrderIds = fleet.assignedOrderId
            ? [fleet.assignedOrderId]
            : [];
        }
        if (!updates.$unset) updates.$unset = {};
        updates.$unset.assignedOrderId = "";
      } else if (fleet.assignedOrderIds === undefined) {
        // No assigned order, initialize as empty array
        updates.assignedOrderIds = [];
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const setUpdates = { ...updates };
        delete setUpdates.$unset;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateDoc: any = {};
        if (Object.keys(setUpdates).length > 0) {
          updateDoc.$set = setUpdates;
        }
        if (updates.$unset) {
          updateDoc.$unset = updates.$unset;
        }

        await fleetCollection.updateOne({ _id: fleet._id }, updateDoc);
        fleetUpdated++;
      }
    }
    console.log(`   ✅ Updated ${fleetUpdated} fleet documents\n`);

    // ==================== MIGRATE RETAILER ORDER COLLECTION ====================
    console.log("📦 Migrating RetailerOrder collection...");
    const retailerOrderCollection = db.collection("retailerorders");

    // Get all retailer order documents
    const orderDocs = await retailerOrderCollection.find({}).toArray();
    console.log(`   Found ${orderDocs.length} retailer order documents`);

    let ordersUpdated = 0;
    for (const order of orderDocs) {
      // Add totalWeightKg if not exists
      if (order.totalWeightKg === undefined) {
        // Calculate total weight from items
        let totalWeight = 0;

        if (order.items && Array.isArray(order.items)) {
          // Sum up quantities from all items (assuming quantity is in kg)
          totalWeight = order.items.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          );
        } else if (order.quantity !== undefined) {
          // Fallback to order.quantity if items not structured properly
          totalWeight = order.quantity;
        }

        await retailerOrderCollection.updateOne(
          { _id: order._id },
          { $set: { totalWeightKg: totalWeight } }
        );
        ordersUpdated++;
      }
    }
    console.log(`   ✅ Updated ${ordersUpdated} order documents\n`);

    // ==================== VERIFICATION ====================
    console.log("🔍 Verifying migration...");

    // Check Fleet
    const migratedFleet = await fleetCollection.findOne({});
    if (migratedFleet) {
      console.log("   Sample Fleet document:");
      console.log(`     - capacityKg: ${migratedFleet.capacityKg}`);
      console.log(`     - currentLoadKg: ${migratedFleet.currentLoadKg}`);
      console.log(
        `     - assignedOrderIds: [${
          migratedFleet.assignedOrderIds?.length || 0
        } orders]`
      );
      console.log(
        `     - Old 'capacity' field removed: ${!migratedFleet.capacity}`
      );
      console.log(
        `     - Old 'assignedOrderId' field removed: ${!migratedFleet.assignedOrderId}`
      );
    }

    // Check RetailerOrder
    const migratedOrder = await retailerOrderCollection.findOne({});
    if (migratedOrder) {
      console.log("\n   Sample RetailerOrder document:");
      console.log(`     - totalWeightKg: ${migratedOrder.totalWeightKg}`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Fleet documents migrated: ${fleetUpdated}`);
    console.log(`   - RetailerOrder documents migrated: ${ordersUpdated}`);
    console.log("\n🎉 Truck load management system is ready to use!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateTruckLoadData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export default migrateTruckLoadData;
