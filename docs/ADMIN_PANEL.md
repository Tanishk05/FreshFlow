# FreshFlow Admin Panel

Complete administrative control panel for managing users, AI features, and system settings.

## 🚀 Quick Start

### Access the Admin Panel

1. **Admin Access**: Only authorized admin emails can access the panel
2. **Location**: Navigate to `/admin` in your browser
3. **Default Admin**: Your email (`tanishkshrivastava6@gmail.com`) is configured

### Admin Email Configuration

To add more admin emails, edit `src/actions/adminActions.ts`:

```typescript
const ADMIN_EMAILS = [
  "tanishkshrivastava6@gmail.com",
  "another-admin@example.com", // Add more here
];
```

## 📊 Features Overview

### 1. Admin Dashboard (`/admin`)

**Main landing page with system overview**

- **System Health**: Real-time status indicator (healthy/warning/critical)
- **Statistics Cards**:
  - Total Users
  - Active AI Features
  - Emails Sent Today
  - API Calls Today
- **User Distribution**: Visual breakdown by role (Farmers, Distributors, Retailers)
- **Email Verification Status**: Progress bar showing verified vs unverified users
- **Quick Actions**: Fast navigation to key admin functions

### 2. User Management (`/admin/users`)

**Complete CRUD operations for users**

#### Features:

- **Search**: Find users by name, email, or username
- **Filter**: Show all users or filter by role
- **Pagination**: 20 users per page
- **User Statistics**:
  - Total users count
  - Farmers count
  - Distributors count
  - Retailers count
  - Verified users count

#### User Actions:

- **Edit Role**: Change user role (farmer/distributor/retailer)
- **Verify Email**: Manually verify user email addresses
- **Ban/Unban**: Temporarily disable user accounts
- **Delete**: Permanently remove users from system

#### Usage Example:

```typescript
// Search for a user
1. Type in search box (e.g., "john@example.com")
2. Results update automatically after 300ms

// Edit a user
1. Click "Edit" button on user row
2. Modal opens with user details
3. Change role in dropdown
4. Click "Update Role" to save

// Ban a user
1. Click "Edit" on user
2. Click "Ban User" (or "Unban" if already banned)
3. User cannot log in when banned

// Delete a user
1. Click "Edit" on user
2. Click "Delete User"
3. Confirm action (irreversible!)
```

### 3. System Settings (`/admin/settings`)

**Granular control over all system features**

#### AI Features Section

Master control for all AI-powered features:

- **AI Features Enabled**: Master switch (disables all AI when off)
- **Dynamic Pricing**: AI-powered price suggestions
- **Market Intelligence**: Real-time market insights
- **Personalized Insights**: User-specific recommendations
- **Demand Forecasting**: Predict future demand patterns

**Note**: Individual features are disabled when master switch is off.

#### Email Notifications Section

Control email alert system:

- **Email Notifications Enabled**: Master switch for all emails
- **Critical Alerts**: System failures and urgent issues
- **Warning Alerts**: Important but non-critical issues
- **Info Alerts**: General information and updates

#### Platform Features Section

Enable/disable core platform functionality:

- **User Registration**: Allow new signups
- **Public Marketplace**: Make marketplace visible to all
- **Order Tracking**: Real-time order tracking system
- **Inventory Management**: Advanced inventory features

#### API Limits Section

Configure rate limits and quotas:

- **Gemini Daily Limit**: Max Gemini API calls per day (default: 1500)
- **Gemini Rate Limit**: Max requests per minute (default: 15)
- **Email Daily Limit**: Max emails sent per day (default: 1000)

**Important**: Changes to limits require clicking "Update Limits" button.

#### Maintenance Mode Section

Put system in maintenance mode:

- **Maintenance Mode Toggle**: When enabled, only admins can access site
- **Maintenance Message**: Custom message shown to users
- **Use Cases**:
  - System updates
  - Database migrations
  - Critical bug fixes
  - Scheduled maintenance

## 🔒 Security Features

### Admin Authentication

- **Email-based whitelist**: Only authorized emails can access
- **Automatic redirect**: Non-admins redirected to their dashboard
- **Session validation**: Admin status checked on every page load

### Audit Trail

All settings changes track:

- **updatedBy**: Email of admin who made change
- **updatedAt**: Timestamp of change
- **Changes saved**: MongoDB document history

## 🎨 UI Components

### Reusable Components

#### `SettingsCard`

Container for settings sections with icon and title:

```tsx
<SettingsCard title="AI Features" icon="🤖">
  {/* Content */}
</SettingsCard>
```

#### `ToggleSwitch`

Animated toggle for boolean settings:

```tsx
<ToggleSwitch
  label="Feature Name"
  description="What this feature does"
  checked={isEnabled}
  onChange={(checked) => handleChange(checked)}
  disabled={saving}
/>
```

#### `StatCard`

Animated statistics display:

```tsx
<StatCard
  title="Total Users"
  value={1234}
  icon="👥"
  color="blue"
  trend="+12%"
/>
```

#### `UserRoleBar`

Progress bar for user distribution:

```tsx
<UserRoleBar role="Farmers" count={450} total={1000} color="green" />
```

### Color Scheme

Matches main FreshFlow design:

- **Blue**: Primary admin color
- **Purple**: Secondary accent
- **Green**: Success/Farmers
- **Orange**: Warning/Activity
- **Red**: Errors/Critical

## 📁 File Structure

```
src/
├── app/admin/
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── page.tsx            # Dashboard overview
│   ├── users/
│   │   └── page.tsx        # User management
│   └── settings/
│       └── page.tsx        # System settings
├── actions/
│   ├── adminActions.ts     # User management actions
│   └── settingsActions.ts  # Settings management actions
```

## 🔧 API Reference

### Admin Actions (`adminActions.ts`)

#### `isAdmin()`

Check if current user is admin:

```typescript
const admin = await isAdmin();
// Returns: boolean
```

#### `getAllUsers(page, limit, search, role)`

Get paginated user list:

```typescript
const result = await getAllUsers(1, 20, "john", "farmer");
// Returns: { users: User[], total: number, pages: number }
```

#### `getUserStats()`

Get user statistics:

```typescript
const stats = await getUserStats();
// Returns: { total, farmers, distributors, retailers, verified }
```

#### `updateUserRole(userId, newRole)`

Change user role:

```typescript
await updateUserRole("507f1f77bcf86cd799439011", "distributor");
```

#### `verifyUserEmail(userId)`

Manually verify email:

```typescript
await verifyUserEmail("507f1f77bcf86cd799439011");
```

#### `toggleUserBan(userId, banned)`

Ban or unban user:

```typescript
await toggleUserBan("507f1f77bcf86cd799439011", true);
```

#### `deleteUser(userId)`

Permanently delete user:

```typescript
await deleteUser("507f1f77bcf86cd799439011");
```

### Settings Actions (`settingsActions.ts`)

#### `getSystemSettings()`

Get current settings:

```typescript
const settings = await getSystemSettings();
// Returns: SystemSettings object
```

#### `updateSystemSettings(updates)`

Update any settings (partial update):

```typescript
await updateSystemSettings({
  aiFeatures: { enabled: false },
  apiLimits: { geminiDailyLimit: 2000 },
});
```

#### `toggleAIFeature(feature, enabled)`

Toggle specific AI feature:

```typescript
await toggleAIFeature("dynamicPricing", true);
```

#### `toggleEmailNotifications(type, enabled)`

Control email notification types:

```typescript
await toggleEmailNotifications("criticalAlerts", false);
```

#### `toggleMaintenanceMode(enabled, message)`

Enable/disable maintenance mode:

```typescript
await toggleMaintenanceMode(true, "System update in progress");
```

#### `getSystemStats()`

Get system-wide statistics:

```typescript
const stats = await getSystemStats();
// Returns: { users, activity, ai }
```

## 📊 Database Schema

### `system_settings` Collection

Single document storing all settings:

```typescript
{
  _id: ObjectId,
  aiFeatures: {
    enabled: boolean,
    dynamicPricing: boolean,
    marketIntelligence: boolean,
    personalizedInsights: boolean,
    demandForecasting: boolean
  },
  emailNotifications: {
    enabled: boolean,
    criticalAlerts: boolean,
    warningAlerts: boolean,
    infoAlerts: boolean
  },
  features: {
    userRegistration: boolean,
    publicMarketplace: boolean,
    orderTracking: boolean,
    inventoryManagement: boolean
  },
  apiLimits: {
    geminiDailyLimit: number,
    geminiRateLimit: number,
    emailDailyLimit: number
  },
  maintenance: {
    enabled: boolean,
    message: string
  },
  updatedAt: Date,
  updatedBy: string
}
```

## 🚨 Best Practices

### Security

1. **Limit admin emails**: Only add trusted users to admin list
2. **Review audit logs**: Check who made changes and when
3. **Use maintenance mode**: During critical updates
4. **Test before production**: Try settings in development first

### User Management

1. **Verify before delete**: User deletion is permanent
2. **Ban temporarily**: Use ban instead of delete when possible
3. **Search efficiently**: Use specific search terms
4. **Check email verification**: Verify users manually if needed

### Settings Management

1. **Test AI features**: Toggle one at a time to test impact
2. **Monitor API limits**: Watch usage to avoid hitting limits
3. **Email carefully**: Disable info alerts if too many emails
4. **Maintenance message**: Be clear about downtime duration

### Performance

1. **Pagination**: Don't load all users at once
2. **Debounced search**: Prevents excessive queries
3. **Lazy loading**: Components load only when needed
4. **Optimistic updates**: UI updates before server confirms

## 🐛 Troubleshooting

### "Not authorized" error

- Check if your email is in `ADMIN_EMAILS` array
- Clear browser cache and re-login
- Verify session is valid

### Changes not saving

- Check browser console for errors
- Verify MongoDB connection is active
- Ensure settings document exists

### Users not loading

- Check MongoDB connection
- Verify User model schema matches
- Check pagination parameters

### AI features not working

- Verify Gemini API key in `.env.local`
- Check API limits haven't been exceeded
- Ensure `aiFeatures.enabled` is true

## 🔄 Future Enhancements

Potential additions to admin panel:

1. **Analytics Dashboard**: Charts and graphs for usage
2. **Activity Logs**: Full audit trail of all actions
3. **Bulk Operations**: Edit/delete multiple users at once
4. **Export Data**: CSV/JSON export of users and stats
5. **Email Templates**: Customize email notification designs
6. **Role Permissions**: Granular permissions per admin
7. **API Keys**: Manage API keys from admin panel
8. **Backup/Restore**: Database backup functionality

## 📞 Support

For issues or questions:

1. Check this documentation first
2. Review console logs for errors
3. Verify MongoDB connection
4. Check email configuration in `.env.local`

## 🎉 Summary

The admin panel provides complete control over:

- ✅ User accounts (view, edit, delete)
- ✅ AI features (toggle on/off)
- ✅ Email notifications (control types)
- ✅ Platform features (enable/disable)
- ✅ API limits (configure quotas)
- ✅ Maintenance mode (system-wide)

All with a modern, intuitive UI matching FreshFlow's design language!
