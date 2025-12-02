# Google Maps API Security Guide

## Why Public Keys Are Safe

Google Maps API keys are **designed** to be used in client-side code (browsers). This is the standard and recommended approach by Google.

## How to Secure Your Google Maps API Keys

### 1. **Client-Side Key** (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

This key is visible in browser code - that's intentional and safe when properly restricted.

**Go to Google Cloud Console → APIs & Services → Credentials:**

#### Set Application Restrictions:

- Choose **HTTP referrers (web sites)**
- Add your domains:
  ```
  localhost:3000/*
  localhost:3001/*
  yourdomain.com/*
  *.yourdomain.com/*
  ```

#### Set API Restrictions:

Enable only these APIs:

- Maps JavaScript API
- Places API
- Geocoding API

#### Set Usage Quotas:

- Go to "Quotas" section
- Set daily request limits (e.g., 1000 requests/day for development)
- Set up billing alerts

### 2. **Server-Side Key** (GOOGLE_MAPS_SERVER_API_KEY)

This key is used only in server-side code and never exposed to browsers.

**Go to Google Cloud Console → APIs & Services → Credentials:**

#### Set Application Restrictions:

- Choose **IP addresses (web servers, cron jobs, etc.)**
- Add your server IP addresses:

  ```
  # For development
  0.0.0.0/0 (or your specific dev IP)

  # For production
  your.server.ip.address
  ```

#### Set API Restrictions:

Enable only:

- Distance Matrix API
- Directions API (if needed)
- Geocoding API (if needed for server-side)

## Current Setup

Your `.env.local` has two keys:

```env
# Client-side (exposed in browser - SAFE when restricted)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Server-side (never exposed to browser)
GOOGLE_MAPS_SERVER_API_KEY=AIzaSy...
```

## Best Practices

1. ✅ **Use separate keys** for client and server
2. ✅ **Always set HTTP referrer restrictions** for client keys
3. ✅ **Always set IP restrictions** for server keys
4. ✅ **Enable only the APIs you need**
5. ✅ **Set usage quotas** to prevent unexpected charges
6. ✅ **Enable billing alerts** in Google Cloud Console
7. ✅ **Regularly rotate keys** (every 90 days)
8. ✅ **Never commit production keys** to version control

## For Production Deployment

When deploying to Vercel/Netlify/etc:

1. **Client Key**: Add HTTP referrer restrictions for your production domain
2. **Server Key**: Add your production server's IP address restriction
3. Set environment variables in your hosting platform's dashboard
4. Test thoroughly before going live

## Monitoring

Check your API usage regularly:

- Google Cloud Console → APIs & Services → Dashboard
- Look for unusual spikes
- Review the "Metrics" tab for each API

## If Your Key Is Compromised

1. Immediately delete the key in Google Cloud Console
2. Create a new key with proper restrictions
3. Update your environment variables
4. Review billing for any unexpected charges
5. Report to Google if you see fraudulent usage

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
