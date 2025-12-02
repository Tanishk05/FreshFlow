// Script to create unique indexes for user fields
// Run this once to set up database constraints

import { getUsersCollection } from "@/models/User";
import { getAlertEmailCollection } from "@/models/AlertEmail";

export async function createUserIndexes() {
  try {
    const users = await getUsersCollection();

    // Create unique index for email (sparse to allow null values)
    await users.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("✓ Created unique index for email");

    // Create unique index for username (sparse to allow null values)
    await users.createIndex({ username: 1 }, { unique: true, sparse: true });
    console.log("✓ Created unique index for username");

    // Create unique index for phone (sparse to allow null values)
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log("✓ Created unique index for phone");

    console.log("\n✅ All indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    throw error;
  }
}

export async function createAlertEmailIndexes() {
  try {
    const alertEmails = await getAlertEmailCollection();

    // Create compound unique index to prevent duplicate alert emails
    await alertEmails.createIndex({ userId: 1, alertId: 1 }, { unique: true });
    console.log("✓ Created unique compound index for userId + alertId");

    // Create index for cleanup queries
    await alertEmails.createIndex({ sentAt: 1 });
    console.log("✓ Created index for sentAt");

    console.log("\n✅ Alert email indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating alert email indexes:", error);
    throw error;
  }
}

// If running this file directly
if (require.main === module) {
  Promise.all([createUserIndexes(), createAlertEmailIndexes()])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
