# Avatar Upload Setup

This project uses Cloudinary for avatar image storage instead of storing base64 data in the database.

## Why Cloudinary?

- ✅ Prevents oversized JWT tokens (HTTP 431 errors)
- ✅ Automatic image optimization and CDN delivery
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Auto-resize and face-detection cropping

## Setup Instructions

1. **Create a free Cloudinary account:**

   - Go to https://cloudinary.com
   - Sign up for a free account

2. **Get your credentials:**

   - After signup, you'll see your Dashboard
   - Copy these values:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to `.env.local`:**

   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## How It Works

1. User selects an avatar on the profile page
2. File uploads to `/api/upload-avatar`
3. API uploads to Cloudinary with automatic:
   - Resize to 400×400px
   - Face-detection cropping
   - Format optimization (WebP where supported)
4. Cloudinary URL is stored in user's `image` field
5. Avatar loads from CDN (fast, globally distributed)

## Features

- Max file size: 5MB
- Supported formats: JPG, PNG, GIF, WebP
- Auto-overwrite: Each user has one avatar (no orphaned files)
- Folder structure: `freshflow/avatars/user_{userId}`

## Alternative: Local Storage (Not Recommended)

If you don't want to use Cloudinary, you can:

- Store avatars in `/public/uploads/avatars/`
- Serve via Next.js static file serving
- **Warning:** Not scalable, no CDN, manual cleanup needed
