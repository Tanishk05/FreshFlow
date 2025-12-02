const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function cleanupOldAlertEmails() {
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
    const alertEmails = db.collection("alertEmails");

    // Delete alert email records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await alertEmails.deleteMany({
      sentAt: { $lt: thirtyDaysAgo },
    });

    console.log(`✓ Cleaned up ${result.deletedCount} old alert email records`);
    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

cleanupOldAlertEmails();
