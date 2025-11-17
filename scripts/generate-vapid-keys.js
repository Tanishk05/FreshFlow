#!/usr/bin/env node

const webpush = require("web-push");

console.log("Generating VAPID Keys for Push Notifications...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("Add these to your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log("\nMake sure to update the email in notificationActions.ts:");
console.log('webpush.setVapidDetails("mailto:your-email@example.com", ...)\n');
