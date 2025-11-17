# 🔔 Notification System - Quick Start

## ⚡ Fast Setup (5 minutes)

### Step 1: Add Environment Variables

Copy these lines to your `.env` file:

```env
# Push Notification Keys (already generated)
VAPID_PUBLIC_KEY=BJQEdVrZIlNDdoWymqOOt-evDGFT-YIStso0TqmIvULFPeY7AyXsCpffHFCO4lEdHp1icO_SEDI23kUz5rd6ePA
VAPID_PRIVATE_KEY=a0bAWxqKTAXd-oi8H8jpSisbrWMqo3zE1zrJ7_uE9bA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJQEdVrZIlNDdoWymqOOt-evDGFT-YIStso0TqmIvULFPeY7AyXsCpffHFCO4lEdHp1icO_SEDI23kUz5rd6ePA
```

### Step 2: Update Email

Open `src/actions/notificationActions.ts` (line 14) and change:

```typescript
"mailto:your-email@example.com";
// TO ↓
"mailto:youremail@freshflow.com";
```

### Step 3: Add Icons

Create two PNG files in the `public/` folder:

- `icon-192x192.png` (192x192px - your app icon)
- `badge-72x72.png` (72x72px - monochrome badge)

**Quick tip**: Use any square image, resize it online at https://squoosh.app/

### Step 4: Test!

```bash
npm run dev
```

1. Go to your dashboard
2. Click "Enable" when notification popup appears
3. Allow notifications in browser prompt
4. Check the bell icon 🔔 in header

## ✨ What You'll See

### 1. Permission Prompt

A beautiful card will appear asking to enable notifications:

```
🔔 Enable Notifications
Get instant alerts about critical updates,
expiring produce, and pending orders.

[Enable] [Not Now]
```

### 2. Notification Bell

In the dashboard header, you'll see:

```
🔔 ← Bell icon
  3 ← Red badge with unread count
```

### 3. Notification Panel

Click the bell to see:

```
Notifications                    [X]
[Mark all as read]

⚠️ Produce Expired
   Tomatoes has expired. Remove from...
   5m ago

⏰ Produce Expiring Soon
   Lettuce will expire in 2 day(s).
   1h ago

📦 Low Stock
   Carrots stock is low (15 kg).
   2h ago
```

### 4. Browser Notifications

When new alerts appear, you'll get:

```
┌─────────────────────────────┐
│ 🔔 FreshFlow                │
│                             │
│ ⚠️ Produce Expired          │
│ Tomatoes has expired.       │
│ Remove from inventory.      │
└─────────────────────────────┘
```

## 🎯 How to Trigger Test Notifications

### Method 1: Wait for Real Alerts

The system automatically creates notifications when:

- ✅ Produce expires
- ✅ Produce will expire in ≤2 days
- ✅ Stock is low (<20 units)
- ✅ Orders are pending
- ✅ Truck temperature is high (>4°C)

### Method 2: Use Test Script

```bash
# Get your user ID from MongoDB
# Then run:
node scripts/test-notification.js <your-user-id>
```

### Method 3: Create Test Data

Add produce with short shelf life:

1. Go to Farmer Dashboard
2. Add produce with harvest date = today
3. Set shelf life = 1 day
4. Wait for system to detect expiry

## 🐛 Troubleshooting

### "No notifications appearing"

1. Check browser permissions: Settings → Site Settings → Notifications
2. Make sure you're on HTTPS or localhost
3. Check browser console for errors

### "Bell icon not showing"

- Refresh the page
- Check DashboardHeader is imported correctly

### "Permission prompt not appearing"

- Check if permission was previously denied
- Clear site data and try again
- Some browsers block after 3 denials

### "Push notifications not sending"

1. Verify VAPID keys in `.env`
2. Check MongoDB connection
3. Ensure web-push is installed: `npm list web-push`

## 📱 Browser Compatibility

| Browser | Desktop    | Mobile     |
| ------- | ---------- | ---------- |
| Chrome  | ✅         | ✅         |
| Firefox | ✅         | ✅         |
| Safari  | ✅ (16.1+) | ✅ (16.4+) |
| Edge    | ✅         | ✅         |
| Opera   | ✅         | ✅         |

## 📚 More Info

- Full setup guide: `NOTIFICATION_SETUP.md`
- Implementation details: `NOTIFICATION_IMPLEMENTATION.md`
- Web Push API docs: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

## 🎉 You're Done!

Your notification system is ready to use! Users will now receive:

- 🔔 Real-time browser notifications
- 📱 Notifications on all their devices
- 📋 Persistent notification history
- 🔴 Visual unread badges

Enjoy your new notification system! 🚀
