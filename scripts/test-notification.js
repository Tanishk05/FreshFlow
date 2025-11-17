/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Push Notification Script
 *
 * This script helps you test push notifications by sending a test notification
 * to all subscribed devices for a specific user.
 *
 * Usage:
 * 1. Get a user's MongoDB ObjectId
 * 2. Run: node scripts/test-notification.js <userId>
 */

const webpush = require("web-push");
const { MongoClient, ObjectId } = require("mongodb");

// Load environment variables
require("dotenv").config(); // Configure web-push
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendTestNotification(userId) {
  if (!userId) {
    console.error("Please provide a user ID");
    console.log("Usage: node scripts/test-notification.js <userId>");
    process.exit(1);
  }

  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);

    // Get user's push subscriptions
    const subscriptions = await db
      .collection("push_subscriptions")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    if (subscriptions.length === 0) {
      console.log("No push subscriptions found for this user.");
      console.log(
        "Make sure the user has enabled notifications in their browser."
      );
      return;
    }

    console.log(`Found ${subscriptions.length} subscription(s)`);

    // Prepare notification payload
    const payload = JSON.stringify({
      title: "🧪 Test Notification",
      body: "This is a test notification from FreshFlow!",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: "test",
      data: {
        url: "/dashboard",
      },
    });

    // Send to all devices
    let successCount = 0;
    let failCount = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );
        console.log(
          `✅ Sent to device: ${subscription.endpoint.slice(0, 50)}...`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to send: ${error.message}`);
        failCount++;

        // Remove invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          await db
            .collection("push_subscriptions")
            .deleteOne({ _id: subscription._id });
          console.log("  Removed invalid subscription");
        }
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);

    // Also create a notification in the database
    await db.collection("notifications").insertOne({
      userId: new ObjectId(userId),
      alertId: `test-${Date.now()}`,
      type: "info",
      category: "inventory",
      title: "🧪 Test Notification",
      message: "This is a test notification from FreshFlow!",
      read: false,
      createdAt: new Date(),
    });

    console.log("\n✅ Test notification also saved to database");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("\n👋 MongoDB connection closed");
    }
  }
}

// Get userId from command line arguments
const userId = process.argv[2];
sendTestNotification(userId);
