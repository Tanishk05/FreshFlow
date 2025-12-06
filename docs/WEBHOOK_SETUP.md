# Quick Setup Guide: Webhooks & Email Notifications

## ✅ What's Been Implemented

Your FreshFlow platform now has a complete webhook and notification system with:

1. **Real-time in-app notifications** for all order lifecycle events
2. **Automated email alerts** for farmers, retailers, and distributors
3. **Instant notifications** when:
   - Retailers place orders (farmers notified)
   - Farmers approve orders (retailers + all distributors notified)
   - Distributors accept jobs (all parties notified)
   - Orders are picked up, in transit, delivered
   - Orders are cancelled or rejected

## 🚀 Quick Start (5 minutes)

### Step 1: Configure Email Service

Add these variables to your `.env.local` file:

```env
# For Gmail (recommended for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FreshFlow <noreply@freshflow.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Get Gmail App Password

1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Security → App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Use it as `EMAIL_PASS` in your `.env.local`

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test It!

**Test Flow:**

1. Login as a retailer
2. Place an order from marketplace
3. Check: Farmer should receive email + in-app notification
4. Login as farmer → Approve the order
5. Check: Retailer gets email, all distributors get email + notification
6. Login as distributor → Accept the job
7. Check: All parties get emails about assignment

## 📧 Email Examples

### Farmer Receives (on new order):

```
Subject: 🎉 New Order Received - FreshFlow
Body: You have received a new order for 100kg of Tomatoes from RetailerCo.
      [View Order Button]
```

### Distributors Receive (on approved order):

```
Subject: 🚚 New Delivery Job Available - FreshFlow
Body: A new delivery job is available for 100kg of Tomatoes.
      [View Available Jobs Button]
```

### Retailer Receives (on distributor acceptance):

```
Subject: 🚛 Delivery Assigned - FreshFlow
Body: Your order has been assigned to a distributor.
      [Track Order Button]
```

## 🔔 In-App Notifications

Users see notifications in the notification bell (top right):

- **Red badge** shows unread count
- **Click** to see all notifications
- **Notifications auto-update** in real-time

## ⚙️ Configuration Options

### Use Different Email Provider

**For SendGrid:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**For Mailgun:**

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-user
EMAIL_PASS=your-mailgun-smtp-password
```

**For AWS SES:**

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASS=your-aws-smtp-password
```

### Disable Emails (Keep Notifications Only)

Remove or comment out EMAIL\_\* variables:

```env
# EMAIL_HOST=
# EMAIL_USER=
# EMAIL_PASS=
```

Webhooks will still trigger in-app notifications!

## 📊 Monitoring

### Check Logs

Development server logs show webhook activity:

```
[Webhook] Event triggered: order.created
[Email] Sent to farmer@example.com: New Order Alert
```

### Troubleshooting

**Emails not sending?**

- Check `.env.local` has correct credentials
- Verify Gmail App Password is correct
- Check server console for errors

**Notifications not appearing?**

- Refresh the page
- Check browser console for errors
- Verify MongoDB is running

## 🎯 What Happens When

| User Action               | Farmer                      | Retailer                    | Distributor                                   |
| ------------------------- | --------------------------- | --------------------------- | --------------------------------------------- |
| **Retailer places order** | ✉️ Email<br>🔔 Notification | -                           | -                                             |
| **Farmer approves**       | -                           | ✉️ Email<br>🔔 Notification | ✉️ Email (broadcast)<br>🔔 Notification (all) |
| **Distributor accepts**   | ✉️ Email<br>🔔 Notification | ✉️ Email<br>🔔 Notification | ✉️ Email<br>🔔 Notification                   |
| **Order picked up**       | -                           | 🔔 Notification             | -                                             |
| **Order in transit**      | -                           | ✉️ Email<br>🔔 Notification | -                                             |
| **Order delivered**       | ✉️ Email<br>🔔 Notification | ✉️ Email<br>🔔 Notification | ✉️ Email (with earnings)<br>🔔 Notification   |

## 🔐 Security Notes

- Email credentials stored in `.env.local` (never commit!)
- Emails sent securely via TLS/STARTTLS
- User data fetched only when authorized
- No sensitive data in logs

## 🚦 Production Deployment

For production, set these in your hosting platform (Vercel, etc.):

```env
EMAIL_HOST=your-production-smtp-host
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
NEXT_PUBLIC_APP_URL=https://yourproductiondomain.com
```

## 📚 Full Documentation

See `WEBHOOK_SYSTEM.md` for:

- Complete event list
- Customization guide
- API reference
- Advanced configuration

---

**That's it!** Your webhook system is ready to use. 🎉
