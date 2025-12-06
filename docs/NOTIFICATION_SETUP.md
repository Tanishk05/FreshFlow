# Notification System Setup

This guide will help you set up the push notification system for FreshFlow.

## Features

- 🔔 **Real-time Browser Notifications**: Users get instant push notifications for critical alerts
- 📱 **Cross-Device Support**: Works on desktop and mobile browsers that support Web Push API
- 🔐 **Secure**: Uses VAPID keys for authenticated push notifications
- 💾 **Persistent**: Notifications are stored in MongoDB for history
- 🎯 **Smart Alerts**: Only sends notifications for critical and warning level alerts
- 🔕 **User Control**: Users can enable/disable notifications anytime

## Setup Instructions

### 1. Add VAPID Keys to Environment Variables

The VAPID keys have been generated. Add them to your `.env` file:

```env
VAPID_PUBLIC_KEY=BJQEdVrZIlNDdoWymqOOt-evDGFT-YIStso0TqmIvULFPeY7AyXsCpffHFCO4lEdHp1icO_SEDI23kUz5rd6ePA
VAPID_PRIVATE_KEY=a0bAWxqKTAXd-oi8H8jpSisbrWMqo3zE1zrJ7_uE9bA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJQEdVrZIlNDdoWymqOOt-evDGFT-YIStso0TqmIvULFPeY7AyXsCpffHFCO4lEdHp1icO_SEDI23kUz5rd6ePA
```

### 2. Update Email in notificationActions.ts

Open `/src/actions/notificationActions.ts` and update the email address:

```typescript
webpush.setVapidDetails(
  "mailto:your-email@freshflow.com", // Change this to your actual email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

### 3. Create Notification Icons

Create the following icon files in the `/public` directory:

- `icon-192x192.png` - 192x192px app icon
- `badge-72x72.png` - 72x72px badge icon (monochrome, transparent background)

### 4. Test the Notification System

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Login to your dashboard**

3. **Enable notifications**:

   - A popup will appear asking to enable notifications
   - Click "Enable" and allow notifications in your browser

4. **Test notifications**:
   - The system automatically creates notifications for:
     - Critical alerts (expired produce, temperature issues)
     - Warning alerts (expiring soon, low stock, pending orders)
5. **Check notification history**:
   - Click the bell icon 🔔 in the dashboard header
   - View all past notifications
   - Mark notifications as read

## How It Works

### Alert Detection

- When `getMyAlerts()` is called, it checks for new critical/warning alerts
- New alerts automatically trigger notification creation

### Notification Flow

1. **Server**: Alert detected → Notification saved to MongoDB
2. **Push**: Web Push API sends notification to user's devices
3. **Client**: Service Worker displays browser notification
4. **User**: Clicks notification → Redirected to dashboard

### Components

- **NotificationManager**: Handles permission requests and service worker registration
- **NotificationBell**: Shows unread count and opens notification panel
- **NotificationPanel**: Displays notification history

### Database Collections

- `notifications`: Stores all user notifications
- `push_subscriptions`: Stores user device push subscriptions

## Browser Support

Works on:

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (macOS 16.1+, iOS 16.4+)
- ✅ Opera (Desktop & Android)

## Troubleshooting

### Notifications not appearing?

1. **Check browser permissions**:

   - Open browser settings
   - Ensure notifications are allowed for your site

2. **Check service worker**:

   - Open DevTools → Application → Service Workers
   - Verify sw.js is registered and active

3. **Check VAPID keys**:

   - Ensure all three env variables are set
   - Keys must match between client and server

4. **Check MongoDB**:
   - Verify `notifications` collection is created
   - Check `push_subscriptions` collection for your device

### Re-generate VAPID Keys

If needed, run:

```bash
node scripts/generate-vapid-keys.js
```

## API Reference

### Server Actions

```typescript
// Get user notifications
const notifications = await getMyNotifications(limit);

// Get unread count
const count = await getUnreadCount();

// Mark as read
await markAsRead(notificationId);

// Mark all as read
await markAllAsRead();

// Subscribe to push
await subscribeToPush(subscription);

// Unsubscribe
await unsubscribeFromPush(endpoint);
```

### Client Components

```tsx
// Enable notifications prompt
<NotificationManager />

// Notification bell with badge
<NotificationBell />

// Notification history panel
<NotificationPanel
  onClose={() => {}}
  onMarkAllRead={() => {}}
  onUpdate={() => {}}
/>
```

## Production Deployment

### Vercel/Netlify

- Add env variables in dashboard
- Ensure service worker is served from root (`/sw.js`)

### Custom Server

- Configure HTTPS (required for push notifications)
- Set proper CORS headers
- Ensure service worker has correct scope

## Security

- ✅ VAPID keys authenticate your server
- ✅ Subscriptions tied to user accounts
- ✅ Server validates all requests
- ✅ Push notifications work over HTTPS only

## Future Enhancements

- [ ] Email notifications as fallback
- [ ] SMS notifications for critical alerts
- [ ] Notification preferences per category
- [ ] Quiet hours (don't disturb mode)
- [ ] Push notification analytics

---

Need help? Check the [Web Push API docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
