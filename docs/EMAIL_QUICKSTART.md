# 🚀 Quick Start: Email Alert System

## 5-Minute Setup Guide

### Step 1: Configure Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" → "Other (Custom name)" → Type "FreshFlow"
   - Click **Generate** and copy the 16-character password

### Step 2: Update Environment Variables

Add to your `.env.local` file:

```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your 16-char app password

# App URL (for links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test the System

Add this component to any dashboard:

```tsx
import EmailSettingsCard from "@/components/dashboard/shared/EmailSettingsCard";

export default function TestPage() {
  return (
    <div className="p-6">
      <EmailSettingsCard />
    </div>
  );
}
```

Then:

1. Click **"Check Configuration"** - Should show ✅ configured
2. Click **"Send Test Email"** - Check your inbox!

### Step 5: Generate Real Alerts

The system automatically sends emails when:

- ❌ Produce expires (critical alert)
- ⏰ Produce expiring soon (warning alert)
- 📦 Low stock levels (warning alert)
- 🚚 Delivery issues (warning alert)

---

## What You Get

### Beautiful HTML Emails 📧

```
┌─────────────────────────────┐
│  🌾 FreshFlow Alerts        │  ← Role-specific color
│  November 18, 2025          │
├─────────────────────────────┤
│  Hello John,                │
│                             │
│  You have 3 new alerts:     │
│                             │
│  ┌───┐ ┌───┐ ┌───┐        │
│  │⚠️│ │⏰│ │ℹ️│          │
│  │ 2 │ │ 3 │ │ 1 │        │
│  └───┘ └───┘ └───┘        │
│                             │
│  ⚠️ Produce Expired         │
│  Tomatoes have expired      │
│  📦 Product: Tomatoes       │
│  🕐 2:30 PM                 │
│                             │
│  [View Dashboard]           │
└─────────────────────────────┘
```

### Features:

- ✅ Instant delivery (< 1 second)
- ✅ Mobile-friendly design
- ✅ Dark mode support
- ✅ Direct dashboard links
- ✅ Color-coded by severity

---

## Troubleshooting

### "Email not configured" error

- Make sure `.env.local` has all EMAIL\_ variables
- Restart dev server after adding variables

### "Authentication failed" error

- Use **App Password**, not your regular password
- Enable 2FA on Google account first
- Generate new App Password

### Email not received

- Check spam/junk folder
- Verify email address in user profile
- Check server console for errors

---

## Production Setup

For production, use a professional service:

**SendGrid** (Recommended):

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-api-key
```

**AWS SES** (Cheapest):

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASSWORD=your-smtp-pass
```

---

## Example Integration

Add email settings to your farmer dashboard:

```tsx
// src/app/dashboard/farmer/page.tsx
import EmailSettingsCard from "@/components/dashboard/shared/EmailSettingsCard";

export default function FarmerDashboard() {
  return (
    <div>
      {/* Other dashboard components */}

      {/* Email Settings Section */}
      <div className="mt-6">
        <EmailSettingsCard />
      </div>
    </div>
  );
}
```

---

## Testing Alert Generation

Manually trigger alerts:

```typescript
// Create test produce with short shelf life
await createProduce({
  name: "Test Tomatoes",
  harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  shelfLifeDays: 2, // Should be expired now
});

// Visit dashboard - alerts will be generated
// Email will be sent automatically!
```

---

## Features Demo

1. **Role-Specific Branding**:

   - Farmer: 🌾 Green theme
   - Distributor: 🚚 Blue theme
   - Retailer: 🛒 Purple theme

2. **Alert Categories**:

   - ⚠️ Critical (red) - Immediate action needed
   - ⏰ Warning (amber) - Attention required
   - ℹ️ Info (blue) - FYI

3. **Smart Filtering**:
   - Only critical/warning alerts trigger emails
   - Info alerts shown in dashboard only
   - No spam - emails grouped by user

---

## Next Steps

1. ✅ Set up Gmail App Password (2 minutes)
2. ✅ Add to `.env.local` (1 minute)
3. ✅ Restart server (10 seconds)
4. ✅ Test with EmailSettingsCard (1 minute)
5. ✅ Generate real alerts (automatic)
6. 🎉 Enjoy beautiful alert emails!

---

## Support

Need help? Check:

- `EMAIL_SYSTEM.md` - Complete documentation
- `TROUBLESHOOTING.md` - Common issues
- Console logs - Real-time debugging
- Test button - Quick verification

---

**Time to Setup**: 5 minutes
**Difficulty**: Easy ⭐
**Dependencies**: None (nodemailer already installed)
**Status**: Production Ready 🚀
