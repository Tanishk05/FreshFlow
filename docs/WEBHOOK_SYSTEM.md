# Webhook & Real-Time Notification System

## Overview

FreshFlow now includes a comprehensive webhook and notification system that provides instant alerts and email notifications for all order lifecycle events.

## Features

### 🔔 Real-Time Notifications

- Instant in-app notifications for all stakeholders
- Push notifications to the notification bell
- Role-based notification targeting
- Priority levels (low, medium, high)

### 📧 Email Alerts

- Automated email notifications for critical events
- Professional HTML email templates
- Role-specific email content
- Broadcast emails to all distributors for new jobs

### ⚡ Webhook Events

The system triggers on these order lifecycle events:

1. **`order.created`** - Retailer places an order

   - Notifies: Farmer (in-app + email)
   - Email: "New Order Received"

2. **`order.approved`** - Farmer approves the order

   - Notifies: Retailer (in-app + email)
   - Broadcast: All distributors (in-app + email)
   - Email: "Order Approved" / "New Delivery Job Available"

3. **`order.assigned`** - Distributor accepts the job

   - Notifies: Farmer, Retailer, Distributor (in-app + email)
   - Email: "Distributor Assigned" / "Job Accepted"

4. **`order.picked_up`** - Order picked up from farmer

   - Notifies: Retailer (in-app)
   - Email: "Order Picked Up"

5. **`order.in_transit`** - Delivery started

   - Notifies: Retailer (in-app + email)
   - Email: "Order In Transit"

6. **`order.delivered`** - Delivery completed

   - Notifies: Farmer, Retailer, Distributor (in-app + email)
   - Email: "Order Delivered" / "Delivery Payment"

7. **`order.cancelled`** - Order cancelled by farmer

   - Notifies: Retailer (in-app)
   - Email: "Order Cancelled"

8. **`order.rejected`** - Order rejected by farmer
   - Notifies: Retailer (in-app)
   - Email: "Order Rejected"

## Implementation

### Webhook System Architecture

```
Order Action
    ↓
triggerOrderWebhook()
    ↓
    ├─→ sendNotificationsByEvent() → In-app notifications
    └─→ sendEmailsByEvent() → Email notifications
```

### Key Files

1. **`/src/lib/webhooks.ts`** - Core webhook engine

   - Event handling logic
   - Notification routing
   - Email templates

2. **`/src/actions/webhookActions.ts`** - Server action wrapper

   - User data fetching
   - Webhook payload construction

3. **`/src/actions/orderActions.ts`** - Order lifecycle integration

   - Triggers webhooks on order status changes

4. **`/src/lib/email.ts`** - Email sending utility
   - SMTP configuration
   - Email delivery

## Setup

### 1. Configure Email Service

Add to your `.env.local`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FreshFlow <noreply@freshflow.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Gmail:**

1. Enable 2-factor authentication
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the App Password as `EMAIL_PASS`

### 2. Install Dependencies

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 3. Test the System

The webhooks are automatically triggered on order actions. Test by:

1. **Create Order**: Retailer places order → Farmer gets email
2. **Approve Order**: Farmer approves → Retailer gets email, distributors get broadcast
3. **Accept Job**: Distributor accepts → All parties get emails
4. **Update Status**: Each status change triggers notifications

## Notification Flow Examples

### Example 1: New Order Flow

```
Retailer places order
    ↓
order.created webhook
    ↓
├─→ Farmer receives notification: "🎉 New Order Received!"
└─→ Farmer receives email with order details
```

### Example 2: Order Approval Flow

```
Farmer approves order
    ↓
order.approved webhook
    ↓
├─→ Retailer receives notification: "✅ Order Approved!"
├─→ Retailer receives email confirmation
├─→ All distributors receive notification: "🚚 New Delivery Job Available!"
└─→ All distributors receive email about new job
```

### Example 3: Distributor Acceptance Flow

```
Distributor accepts job
    ↓
order.assigned webhook
    ↓
├─→ Farmer: "🚛 Distributor Assigned!" (in-app + email)
├─→ Retailer: "🚛 Delivery Assigned!" (in-app + email)
└─→ Distributor: "✅ Job Accepted!" (in-app + email)
```

## Notification Details

### In-App Notifications

Each notification includes:

- **Title**: Emoji + descriptive title
- **Message**: Details about the order/event
- **Link**: Deep link to relevant dashboard
- **Priority**: Controls notification styling and position
- **Type**: Categorizes the notification (order, shipment, payment, alert)

### Email Notifications

Email features:

- **HTML formatted** with brand colors
- **Action buttons** linking to dashboard
- **Order details** in structured format
- **Role-specific content** and language
- **Professional templates** with consistent styling

## Customization

### Add New Webhook Events

1. Add event type to `/src/lib/webhooks.ts`:

```typescript
export type WebhookEvent = "order.created" | "your.new.event";
```

2. Add handler in `sendNotificationsByEvent()`:

```typescript
case "your.new.event":
  await createNotification({...});
  break;
```

3. Add email template in `sendEmailsByEvent()`:

```typescript
case "your.new.event":
  await sendEmail({...});
  break;
```

4. Trigger from action:

```typescript
await triggerOrderWebhook({
  event: "your.new.event",
  ...
});
```

### Customize Email Templates

Edit the HTML in `/src/lib/webhooks.ts` → `sendEmailsByEvent()`:

```typescript
html: `
  <h2>Your Custom Title</h2>
  <p>Your custom message</p>
  <a href="..." style="...">Action Button</a>
`;
```

### Disable Emails (Keep In-App Only)

Set in `.env.local`:

```env
EMAIL_HOST=
EMAIL_USER=
```

Webhooks will still trigger in-app notifications, but skip email sending.

## Monitoring

### Logs

Webhook activity is logged:

```
[Webhook] Event triggered: order.created
[Webhook] Error triggering webhook: ...
[Email] Sent to user@example.com: New Order Alert
[Email] Error sending email: ...
```

### Error Handling

- Email failures don't break the workflow
- Webhook errors are logged but don't throw
- Failed emails won't prevent order processing

## Performance

### Optimization Features

1. **Parallel Execution**: Notifications and emails sent concurrently
2. **Non-Blocking**: Webhook failures don't block order actions
3. **Dynamic Imports**: Modules loaded on-demand to reduce bundle size
4. **Batch Operations**: Multiple distributors notified in parallel

### Best Practices

- ✅ Webhooks trigger after successful database operations
- ✅ Email sending is async and non-blocking
- ✅ User data cached per webhook event
- ✅ Revalidation paths ensure UI updates

## Security

### Data Privacy

- Only necessary order data included in webhooks
- User emails fetched securely from database
- No sensitive data in webhook logs
- SMTP credentials stored in environment variables

### Access Control

- Notifications only sent to authorized users
- Role validation before notification creation
- Order ownership verified before triggering webhooks

## Troubleshooting

### Emails Not Sending

1. Check `.env.local` has correct EMAIL\_\* variables
2. Verify SMTP credentials with your email provider
3. For Gmail, ensure App Password is generated
4. Check server logs for email errors

### Notifications Not Appearing

1. Verify `notificationActions.ts` is working
2. Check user IDs are correct in webhook payload
3. Ensure database has notification collection
4. Check browser console for client errors

### Distributors Not Receiving Job Alerts

1. Verify distributor users have `role: "distributor"` in database
2. Check distributor email addresses exist in user records
3. Look for broadcast errors in server logs

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] WhatsApp notifications via WhatsApp Business API
- [ ] Slack/Discord webhooks for team notifications
- [ ] Custom webhook URLs for external integrations
- [ ] Notification preferences per user
- [ ] Email digest options (daily/weekly summaries)
- [ ] Real-time WebSocket notifications
- [ ] Push notifications for mobile apps

## API Reference

### triggerOrderWebhook()

```typescript
await triggerOrderWebhook({
  event: WebhookEvent,
  orderId: string,
  farmerId: string,
  retailerId: string,
  distributorId: string,
  produceName: string,
  quantity: number,
  unit: string,
  status: string,
  deliveryFee: number,
  destination: string,
});
```

Returns: `Promise<{ success: boolean; error?: string }>`

### sendEmail()

```typescript
await sendEmail({
  to: string,
  subject: string,
  html: string,
});
```

Returns: `Promise<void>`

---

**Questions or issues?** Check the server logs for detailed webhook execution traces.
