# Admin Panel - Quick Start Guide

## 🎯 What You Got

A complete admin panel for FreshFlow with full control over users, AI features, and system settings.

## 🔗 Access

Navigate to: **`http://localhost:3000/admin`**

Your email (`tanishkshrivastava6@gmail.com`) is already configured as admin.

## 📱 Pages

### 1. Dashboard (`/admin`)

- System health status
- User statistics (total, by role, verified)
- Quick action buttons
- Visual user distribution

### 2. User Management (`/admin/users`)

- View all users (paginated, 20 per page)
- Search by name/email/username
- Filter by role (farmer/distributor/retailer)
- Actions per user:
  - ✏️ **Edit Role**: Change user type
  - ✅ **Verify Email**: Manually verify
  - 🚫 **Ban/Unban**: Disable account
  - 🗑️ **Delete**: Remove permanently

### 3. System Settings (`/admin/settings`)

- **AI Features**: Toggle all AI features individually
  - Dynamic Pricing
  - Market Intelligence
  - Personalized Insights
  - Demand Forecasting
- **Email Notifications**: Control email types
  - Critical Alerts
  - Warning Alerts
  - Info Alerts
- **Platform Features**: Enable/disable core features
  - User Registration
  - Public Marketplace
  - Order Tracking
  - Inventory Management
- **API Limits**: Configure quotas
  - Gemini Daily/Rate Limits
  - Email Daily Limit
- **Maintenance Mode**: Put system in maintenance

## 🎨 Features

- ✅ Beautiful UI matching FreshFlow design
- ✅ Collapsible sidebar navigation
- ✅ Real-time stats and metrics
- ✅ Animated transitions with Framer Motion
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Search and filter functionality
- ✅ Audit trail (updatedBy, updatedAt)

## 🔧 Add More Admins

Edit `src/actions/adminActions.ts`:

```typescript
const ADMIN_EMAILS = [
  "tanishkshrivastava6@gmail.com",
  "another-admin@example.com", // Add here
];
```

## 📁 Files Created

```
src/
├── app/admin/
│   ├── layout.tsx              # Sidebar layout
│   ├── page.tsx                # Dashboard
│   ├── users/page.tsx          # User management
│   └── settings/page.tsx       # Settings
├── actions/
│   ├── adminActions.ts         # User CRUD (8 functions)
│   └── settingsActions.ts      # Settings management (7 functions)
└── ADMIN_PANEL.md              # Full documentation
```

## 🚀 Try It Now

1. **Start your dev server** (if not running):

   ```bash
   npm run dev
   ```

2. **Navigate to admin panel**:

   ```
   http://localhost:3000/admin
   ```

3. **Explore the features**:
   - View dashboard statistics
   - Browse and search users
   - Toggle AI features on/off
   - Configure email notifications
   - Test maintenance mode

## 💡 Common Tasks

### Disable an AI Feature

1. Go to `/admin/settings`
2. Scroll to "AI Features" section
3. Toggle the specific feature off
4. Changes save automatically

### Ban a User

1. Go to `/admin/users`
2. Search for the user
3. Click "Edit" button
4. Click "Ban User"
5. Close modal (saved automatically)

### Put System in Maintenance

1. Go to `/admin/settings`
2. Scroll to "Maintenance Mode"
3. Toggle "Maintenance Mode" on
4. Edit the message (optional)
5. Click "Update Message"
6. Only admins can access site now

### Change User Role

1. Go to `/admin/users`
2. Find the user
3. Click "Edit"
4. Select new role from dropdown
5. Click "Update Role"

## 🎉 What's Included

**Backend (Complete)**:

- ✅ User management actions (8 functions)
- ✅ Settings management actions (7 functions)
- ✅ MongoDB integration
- ✅ TypeScript type safety
- ✅ Error handling

**Frontend (Complete)**:

- ✅ Dashboard overview page
- ✅ User management UI with table/modal
- ✅ Settings UI with all toggles
- ✅ Sidebar navigation
- ✅ Admin auth guard
- ✅ Loading states
- ✅ Animations

**Documentation (Complete)**:

- ✅ Full guide (ADMIN_PANEL.md)
- ✅ Quick start (this file)
- ✅ API reference
- ✅ Best practices
- ✅ Troubleshooting

## 🔒 Security

- Admin access controlled by email whitelist
- Non-admins automatically redirected
- Session validation on every page
- Audit trail for all changes

## 📚 Full Documentation

See **`ADMIN_PANEL.md`** for:

- Detailed API reference
- Database schema
- Component documentation
- Troubleshooting guide
- Future enhancements

---

**Your admin panel is ready to use! 🎉**

Visit `/admin` to start managing your FreshFlow system.
