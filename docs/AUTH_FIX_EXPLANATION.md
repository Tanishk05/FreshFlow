# Authentication Redirect Fix

## Problem

Users with a `distributor` (or any role) were getting stuck on `/complete-signup` page instead of being redirected to their dashboard.

## Root Cause

There were **two issues**:

### 1. JWT Token Not Updating After Role Assignment

- User logs in → JWT token created (no role yet)
- User fills complete-signup form → **Database updated with role**
- User redirected → **BUT JWT token still has no role**
- Middleware checks JWT → sees no role → forces back to /complete-signup

**Solution**: Updated `auth.config.ts` JWT callback to fetch the role from database when:

- Token exists but has no role
- This ensures the token gets updated after signup completion

### 2. Complete-Signup Page Had No Client-Side Redirect Logic

- Even if the user somehow got to /complete-signup with a role, the page would still render the form
- There was no check to redirect users who already had a role

**Solution**: Added a `useEffect` hook in `complete-signup/page.tsx` that:

- Checks if user has a role in their session
- Automatically redirects to their dashboard if they do

## Changes Made

### 1. `/src/auth.config.ts`

```typescript
// JWT callback now:
// 1. Returns immediately if user is signing in (has role from DB)
// 2. Returns immediately if token already has a role (cached)
// 3. Fetches from DB if token has no role (after signup completion)

async jwt({ token, user, account }) {
  if (user) {
    // Initial sign-in
    token.id = user.id;
    token.provider = account?.provider;
    const dbUser = user as DbUser;
    token.role = dbUser.role;
    return token;
  }

  if (token.role) {
    // Already has role, return cached
    return token;
  }

  if (token.id) {
    // No role in token, fetch from database
    const usersCollection = await getUsersCollection();
    const dbUser = await usersCollection.findOne({
      _id: new ObjectId(token.id as string)
    });
    if (dbUser?.role) {
      token.role = dbUser.role;
    }
  }

  return token;
}
```

### 2. `/src/app/complete-signup/page.tsx`

```typescript
// Added redirect logic for users who already have a role
React.useEffect(() => {
  if (status === "authenticated" && session?.user?.role) {
    router.push(`/dashboard/${session.user.role}`);
  }
}, [status, session?.user?.role, router]);

// Show loading state while redirecting
if (session?.user?.role) {
  return <div className="p-8">Redirecting to dashboard...</div>;
}
```

## How It Works Now

### First-Time User Flow

1. User logs in → No role in database
2. JWT created with `role: null`
3. Middleware sees no role → allows /complete-signup
4. User fills form → Database updated with role
5. Form redirects to /dashboard/[role]
6. Middleware runs again:
   - JWT callback checks: "No role in token but user has ID"
   - Fetches from database: "User now has role!"
   - Updates JWT with role
7. Middleware sees role → allows /dashboard/[role]
8. User successfully lands on dashboard

### Returning User Flow

1. User logs in → Has role in database
2. JWT created with `role: "distributor"`
3. Middleware sees role → redirects from / to /dashboard/distributor
4. User lands directly on dashboard

### Edge Case: User Manually Navigates to /complete-signup

1. User with role visits /complete-signup
2. Client-side useEffect detects role in session
3. Automatically redirects to dashboard
4. No form shown

## Performance Optimization

- JWT callback only fetches from database **when token has no role**
- Most requests use cached role from JWT
- Database query only happens:
  - Right after signup completion (once)
  - If JWT somehow loses the role (rare edge case)

## Testing

To test the fix:

1. Clear your cookies/session
2. Log in as a new user
3. Complete signup with "Distributor" role
4. Should automatically redirect to /dashboard/distributor
5. Try visiting /complete-signup manually → should redirect back to dashboard

## Notes

- This fix maintains performance while ensuring JWT stays in sync with database
- No need for users to log out and log back in
- Works for all roles (farmer, distributor, retailer)
