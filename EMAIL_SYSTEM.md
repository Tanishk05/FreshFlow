# 📧 Email Alert System Documentation

## Overview

Automated email notification system that sends beautiful, role-specific HTML emails to users whenever critical or warning alerts are generated.

---

## Features

### ✅ Automated Alert Emails

- **Trigger**: Automatically sent when critical or warning alerts are created
- **Timing**: Real-time delivery when alerts are generated
- **Content**: Beautiful HTML emails with alert details

### 🎨 Beautiful HTML Templates

- **Role-Specific Branding**:
  - Farmers: Green gradient (🌾)
  - Distributors: Blue gradient (🚚)
  - Retailers: Purple gradient (🛒)
- **Alert Categories**: Color-coded by severity (critical, warning, info)
- **Responsive Design**: Works on desktop and mobile email clients
- **Dark Mode Support**: Optimized for both light and dark themes

### 📊 Alert Summary

- **Visual Counters**: Shows count of critical, warning, and info alerts
- **Detailed List**: Full details for each alert with icons
- **Product Info**: Displays affected products
- **Timestamps**: Shows when each alert was created

### 🔗 Quick Actions

- **Dashboard Link**: Direct button to view full dashboard
- **Settings Link**: Manage notification preferences
- **One-Click Access**: No login required (authenticated links)

---

## Setup Instructions

### 1. Email Provider Configuration

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:

   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FreshFlow" and click "Generate"
   - Copy the 16-character password

3. **Add to `.env.local`**:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

#### Option B: Custom SMTP Server

```env
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false  # true for port 465
EMAIL_USER=your-email@yourprovider.com
EMAIL_PASSWORD=your-password
```

#### Option C: Production Email Services

**SendGrid**:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**AWS SES**:

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

**Mailgun**:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application URL (for links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_APP_URL=https://yourapp.com  # Production
```

### 3. Restart Development Server

After adding environment variables:

```bash
npm run dev
```

---

## Testing the Email System

### Method 1: Dashboard Settings (UI)

1. Navigate to any dashboard
2. Add the `EmailSettingsCard` component
3. Click "Check Configuration" to verify setup
4. Click "Send Test Email" to receive a test email

Example integration:

```tsx
import EmailSettingsCard from "@/components/dashboard/shared/EmailSettingsCard";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <EmailSettingsCard />
    </div>
  );
}
```

### Method 2: Server Actions (Programmatic)

```typescript
import { sendTestAlertEmail, checkEmailConfig } from "@/actions/emailActions";

// Check configuration
const config = await checkEmailConfig();
console.log(config);
// Output: { configured: true, verified: true, message: "..." }

// Send test email
const result = await sendTestAlertEmail();
console.log(result);
// Output: { success: true, message: "Test email sent to user@example.com" }
```

---

## How It Works

### Alert Generation Flow

```
1. Alert Created (e.g., produce expiring)
   ↓
2. alertActions.ts → getMyAlerts()
   ↓
3. processNewAlerts() called
   ↓
4. Filters for critical/warning alerts
   ↓
5. Creates in-app notification
   ↓
6. Sends email via sendAlertEmail()
   ↓
7. User receives email notification
```

### Code Architecture

```
src/
├── lib/
│   └── email.ts                    # Email service & templates
├── actions/
│   ├── alertActions.ts             # Alert generation & processing
│   └── emailActions.ts             # Email testing & config actions
└── components/
    └── dashboard/
        └── shared/
            └── EmailSettingsCard.tsx  # Settings UI
```

### Key Functions

**`sendAlertEmail(email, name, role, alerts)`**

- Sends HTML email with alert details
- Returns: `Promise<boolean>` - success status

**`sendBulkAlertEmails(recipients)`**

- Sends emails to multiple users
- Returns: `{ success: number, failed: number }`

**`verifyEmailConfig()`**

- Validates SMTP connection
- Returns: `Promise<boolean>` - verification status

**`isEmailConfigured()`**

- Checks if env variables are set
- Returns: `boolean`

---

## Email Templates

### HTML Email Structure

```
┌─────────────────────────────────┐
│   Header (Role-specific color) │
│   🌾/🚚/🛒 FreshFlow Alerts     │
│   Date                          │
├─────────────────────────────────┤
│   Greeting: Hello [Name]        │
│                                 │
│   Alert Summary Cards:          │
│   ┌───┐ ┌───┐ ┌───┐           │
│   │⚠️│ │⏰│ │ℹ️│             │
│   │ 2 │ │ 3 │ │ 1 │           │
│   └───┘ └───┘ └───┘           │
│                                 │
│   Alert Details:                │
│   ┌──────────────────────────┐ │
│   │ ⚠️ Critical Alert        │ │
│   │ Message details...       │ │
│   │ 📦 Product: Tomatoes     │ │
│   │ Time: Nov 18, 2:30 PM    │ │
│   └──────────────────────────┘ │
│                                 │
│   [View Dashboard Button]      │
├─────────────────────────────────┤
│   Footer                        │
│   FreshFlow © 2025              │
│   Manage preferences            │
└─────────────────────────────────┘
```

### Plain Text Fallback

For email clients that don't support HTML:

```
FreshFlow Alert Notification

Hello John Doe,

You have 3 new alerts requiring your attention:

⚠️ CRITICAL: Produce Expired
Tomatoes have expired. Remove from inventory.
Product: Tomatoes
Time: Nov 18, 2025, 2:30 PM
---

⏰ WARNING: Produce Expiring Soon
Lettuce will expire in 2 day(s).
Product: Lettuce
Time: Nov 18, 2025, 2:30 PM
---

View your dashboard: http://localhost:3000/dashboard/farmer
```

---

## Customization

### 1. Email Styling

Edit `src/lib/email.ts`:

```typescript
// Change role colors
const roleColors = {
  farmer: "#10b981", // Green
  distributor: "#3b82f6", // Blue
  retailer: "#a855f7", // Purple
};

// Change alert severity colors
const alertTypeColors = {
  critical: "#ef4444", // Red
  warning: "#f59e0b", // Amber
  info: "#3b82f6", // Blue
  reminder: "#6b7280", // Gray
};
```

### 2. Email Content

Modify the email template in `getAlertEmailHtml()`:

```typescript
// Add custom sections
const customSection = `
  <div style="padding: 16px;">
    <h3>Quick Tips:</h3>
    <ul>
      <li>Check inventory daily</li>
      <li>Monitor temperature</li>
    </ul>
  </div>
`;
```

### 3. Alert Filtering

In `alertActions.ts`, customize which alerts trigger emails:

```typescript
// Only send emails for critical alerts
const importantAlerts = alerts.filter(
  (alert) => alert.type === "critical" // Remove || alert.type === "warning"
);
```

### 4. Email Frequency

Implement throttling to avoid spam:

```typescript
// In processNewAlerts()
const lastEmailSent = await getLastEmailTimestamp(userId);
const hoursSinceLastEmail = (Date.now() - lastEmailSent) / (1000 * 60 * 60);

if (hoursSinceLastEmail < 1) {
  console.log("Skipping email - sent within last hour");
  return;
}
```

---

## Troubleshooting

### Issue: "Email not configured" error

**Solution**: Check `.env.local` has all required variables:

```bash
# Verify variables are set
echo $EMAIL_HOST
echo $EMAIL_USER
```

If empty, restart your dev server after adding them.

---

### Issue: "Authentication failed" error

**Solutions**:

1. **Gmail Users**:

   - Use App Password, not regular password
   - Enable 2FA first
   - Generate new App Password

2. **Other Providers**:
   - Verify username/password
   - Check if "less secure apps" is enabled
   - Confirm SMTP settings match provider docs

---

### Issue: "Connection timeout" error

**Solutions**:

1. Check firewall/antivirus blocking port 587
2. Try alternative port (465 with `EMAIL_SECURE=true`)
3. Verify SMTP host is correct
4. Check internet connection

---

### Issue: Emails go to spam

**Solutions**:

1. **Add SPF record** to your domain:

   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Add DKIM** signature (provider-specific)

3. **Use verified domain** in production (not Gmail)

4. **Warm up IP** - start with low volume, gradually increase

5. **Add to contacts** - ask users to add your email to contacts

---

### Issue: Email not received

**Debugging steps**:

1. Check spam/junk folder
2. Verify email address is correct
3. Check server logs for errors
4. Test with different email provider
5. Use "Send Test Email" button to verify setup

---

## Production Deployment

### 1. Use Professional Email Service

Don't use Gmail in production. Use:

- **SendGrid** (99% delivery rate, 100 emails/day free)
- **AWS SES** (Very cheap, $0.10 per 1000 emails)
- **Mailgun** (Good for high volume)
- **Postmark** (Fast delivery, transactional focus)

### 2. Domain Authentication

Set up SPF, DKIM, and DMARC records:

```dns
# SPF Record
TXT @ v=spf1 include:sendgrid.net ~all

# DKIM Record (from provider)
TXT em123._domainkey.yourdomain.com "k=rsa; p=MIGfMA0GCS..."

# DMARC Record
TXT _dmarc.yourdomain.com "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### 3. Email Rate Limiting

Implement rate limiting to avoid throttling:

```typescript
// lib/email.ts
let emailsSentThisMinute = 0;
let lastResetTime = Date.now();

export async function sendAlertEmail(...) {
  // Reset counter every minute
  if (Date.now() - lastResetTime > 60000) {
    emailsSentThisMinute = 0;
    lastResetTime = Date.now();
  }

  // Limit: 10 emails per minute
  if (emailsSentThisMinute >= 10) {
    console.warn("Rate limit reached, queueing email");
    // Queue for later or skip
    return false;
  }

  emailsSentThisMinute++;
  // Send email...
}
```

### 4. Monitoring & Logging

Track email delivery:

```typescript
// Create email_logs collection in MongoDB
const emailLog = {
  userId: userId,
  email: userEmail,
  alertCount: alerts.length,
  status: "sent" | "failed",
  timestamp: new Date(),
  provider: "sendgrid",
  messageId: info.messageId,
};

await emailLogsCollection.insertOne(emailLog);
```

### 5. Environment Variables (Production)

```env
# Production Email (SendGrid example)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx

# Production App URL
NEXT_PUBLIC_APP_URL=https://freshflow.app

# Optional: Email notifications ON/OFF
EMAIL_NOTIFICATIONS_ENABLED=true
```

---

## Performance Optimization

### 1. Batch Email Sending

Instead of sending one email per alert:

```typescript
// Group alerts by user
const alertsByUser = new Map<string, Alert[]>();

for (const alert of allAlerts) {
  const userAlerts = alertsByUser.get(userId) || [];
  userAlerts.push(alert);
  alertsByUser.set(userId, userAlerts);
}

// Send one email per user with all their alerts
for (const [userId, alerts] of alertsByUser) {
  await sendAlertEmail(userEmail, userName, userRole, alerts);
}
```

### 2. Background Job Queue

For large volumes, use a queue:

```typescript
// Install: npm install bull
import Queue from "bull";

const emailQueue = new Queue("email-alerts", {
  redis: { host: "localhost", port: 6379 },
});

// Add to queue instead of sending immediately
emailQueue.add({
  email: userEmail,
  name: userName,
  role: userRole,
  alerts: alerts,
});

// Process queue
emailQueue.process(async (job) => {
  await sendAlertEmail(
    job.data.email,
    job.data.name,
    job.data.role,
    job.data.alerts
  );
});
```

### 3. Template Caching

Cache compiled templates:

```typescript
const templateCache = new Map<string, string>();

function getEmailTemplate(role: string): string {
  if (templateCache.has(role)) {
    return templateCache.get(role)!;
  }

  const template = compileTemplate(role);
  templateCache.set(role, template);
  return template;
}
```

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use `.env.example` for documentation
- ✅ Rotate credentials regularly

### 2. Email Validation

```typescript
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 3. Rate Limiting

- Limit emails per user per day
- Implement exponential backoff
- Monitor for abuse

### 4. Unsubscribe Links

Add to footer:

```html
<a href="https://yourapp.com/unsubscribe?token=xxx">
  Unsubscribe from email alerts
</a>
```

---

## Analytics & Tracking

Track email performance:

```typescript
// Add tracking pixel
const trackingPixel = `<img src="${NEXT_PUBLIC_APP_URL}/api/email-opened?userId=${userId}&alertId=${alertId}" width="1" height="1" />`;

// Add UTM parameters to links
const dashboardLink = `${NEXT_PUBLIC_APP_URL}/dashboard/${role}?utm_source=email&utm_medium=alert&utm_campaign=alert_notification`;
```

---

## FAQ

**Q: How much does it cost?**

- Gmail: Free (100 emails/day)
- SendGrid: Free tier (100 emails/day), $15/month (40K emails)
- AWS SES: $0.10 per 1000 emails

**Q: Can I disable emails for certain users?**

- Yes, add a user preference field in the database
- Check preference before sending: `if (user.emailAlertsEnabled)`

**Q: How do I customize the sender name?**

```typescript
from: `"FreshFlow Alerts 🌾" <${process.env.EMAIL_USER}>`;
```

**Q: Can I add attachments?**

```typescript
await transporter.sendMail({
  // ...
  attachments: [
    {
      filename: "report.pdf",
      path: "/path/to/report.pdf",
    },
  ],
});
```

**Q: How do I test without sending real emails?**
Use Ethereal Email (automatic test accounts):

```typescript
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransporter({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

---

## Next Steps

1. ✅ Configure email provider
2. ✅ Test with "Send Test Email" button
3. ✅ Add EmailSettingsCard to your dashboard
4. ✅ Generate some alerts to test automatic emails
5. ✅ Monitor email delivery logs
6. ✅ Plan for production email service
7. ✅ Set up domain authentication

---

## Support

- **Nodemailer Docs**: https://nodemailer.com/
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Setup**: https://docs.sendgrid.com/
- **AWS SES Setup**: https://docs.aws.amazon.com/ses/

---

**Last Updated**: November 18, 2025
**Status**: Production Ready 🚀
