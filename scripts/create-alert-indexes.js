const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error("Missing MONGODB_URI or MONGODB_DB environment variables");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Create alertEmails collection indexes
    const alertEmails = db.collection("alertEmails");

    // Create compound unique index to prevent duplicate alert emails
    await alertEmails.createIndex({ userId: 1, alertId: 1 }, { unique: true });
    console.log(
      "✓ Created unique compound index for userId + alertId on alertEmails"
    );

    // Create index for cleanup queries
    await alertEmails.createIndex({ sentAt: 1 });
    console.log("✓ Created index for sentAt on alertEmails");

    console.log("\n✅ Alert email indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();
