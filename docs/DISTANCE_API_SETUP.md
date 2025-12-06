# Distance Calculation API Setup Guide

This guide will help you set up real-world distance calculation for accurate delivery fees.

## 🌟 Recommended: OpenRouteService (FREE)

### Why OpenRouteService?

- ✅ **FREE** - 2000 requests/day (plenty for most applications)
- ✅ **No credit card required**
- ✅ **Accurate road distances**
- ✅ **Easy to set up**

### Setup Steps:

1. **Sign Up**

   - Go to: https://openrouteservice.org/dev/#/signup
   - Create a free account
   - Verify your email

2. **Get API Key**

   - Log in to your account
   - Go to: https://openrouteservice.org/dev/#/home
   - Click "Request a Token"
   - Copy your API key

3. **Add to Environment**

   ```bash
   # In your .env.local file
   OPENROUTESERVICE_API_KEY=your-api-key-here
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

### Usage Limits:

- **Free Tier**: 2000 requests/day
- **Rate Limit**: 40 requests/minute
- **Sufficient for**: Small to medium applications

---

## 💎 Alternative: Google Maps Distance Matrix API (PAID)

### Why Google Maps?

- ✅ **Most accurate** road distance calculations
- ✅ **Real-time traffic data** (optional)
- ✅ **Multiple transport modes** (driving, walking, cycling)
- ❌ **Requires billing** (credit card needed)
- 💰 **Cost**: $5 per 1000 requests (first $200/month free credits)

### Setup Steps:

1. **Enable API**

   - Go to: https://console.cloud.google.com/
   - Create a project (or select existing)
   - Enable "Distance Matrix API"
   - Enable billing (required even for free tier)

2. **Create API Key**

   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

3. **Add to Environment**

   ```bash
   # In your .env.local file
   GOOGLE_MAPS_API_KEY=your-api-key-here
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

### Pricing:

- **First $200/month**: FREE (≈40,000 requests)
- **After that**: $5 per 1000 requests
- **Monthly bill cap**: Set in Google Cloud Console

---

## 🔄 Fallback: No API Key (FREE)

If you don't add any API key, the system will:

- Use **Haversine formula** (straight-line distance)
- Add **30% adjustment** for road curves
- Still provide **reasonable estimates**

### Pros:

- ✅ **100% Free**
- ✅ **No signup required**
- ✅ **No request limits**

### Cons:

- ❌ **Less accurate** (can be off by 20-40%)
- ❌ **Doesn't account for** actual roads, traffic, terrain

---

## 📊 Comparison

| Feature         | OpenRouteService | Google Maps        | Haversine + 30% |
| --------------- | ---------------- | ------------------ | --------------- |
| **Cost**        | FREE             | $5/1000 after $200 | FREE            |
| **Accuracy**    | ★★★★☆            | ★★★★★              | ★★★☆☆           |
| **Setup Time**  | 5 minutes        | 10 minutes         | 0 minutes       |
| **Rate Limit**  | 2000/day         | Unlimited\*        | None            |
| **Credit Card** | No               | Yes                | No              |
| **Best For**    | Production       | Enterprise         | Development     |

\*Unlimited with paid plan

---

## 🚀 Quick Start (Recommended)

### For Development:

```bash
# No setup needed - use Haversine fallback
npm run dev
```

### For Production:

```bash
# 1. Sign up for OpenRouteService (5 minutes)
# 2. Get API key
# 3. Add to .env.local
echo "OPENROUTESERVICE_API_KEY=your-key-here" >> .env.local

# 4. Restart server
npm run dev
```

---

## 🧪 Testing Distance Calculation

After setup, test with these sample coordinates:

### Mumbai to Pune (India)

- **From**: 19.0760, 72.8777 (Mumbai)
- **To**: 18.5204, 73.8567 (Pune)
- **Expected Distance**: ~148 km (driving)
- **Haversine + 30%**: ~154 km
- **Straight line**: ~118 km

### Delhi to Agra (India)

- **From**: 28.6139, 77.2090 (Delhi)
- **To**: 27.1767, 78.0081 (Agra)
- **Expected Distance**: ~233 km (driving)
- **Haversine + 30%**: ~245 km
- **Straight line**: ~188 km

---

## 🔍 How It Works

### Priority Order:

1. **Google Maps API** (if key available) - Most accurate
2. **OpenRouteService API** (if key available) - Very accurate, free
3. **Haversine + 30%** (fallback) - Good approximation

### Distance to Delivery Fee:

```
Base Fee = ₹50
Distance Fee = Distance (km) × ₹10/km

Example: 25 km drive
Delivery Fee = ₹50 + (25 × ₹10) = ₹300
```

---

## 💡 Tips

1. **For MVP/Testing**: Use Haversine fallback (no setup)
2. **For Production**: Use OpenRouteService (free & accurate)
3. **For Enterprise**: Use Google Maps (best accuracy)
4. **Cache Results**: API responses are cached for 1 hour
5. **Monitor Usage**: Check API dashboard regularly

---

## 🐛 Troubleshooting

### "Distance shows random values"

- ✅ Users haven't added coordinates in signup
- ✅ API key not added to .env.local
- ✅ Server not restarted after adding key

### "API Error in console"

- ✅ Invalid API key
- ✅ Rate limit exceeded (wait or upgrade)
- ✅ API not enabled (Google Maps only)

### "Distance seems wrong"

- ✅ Coordinates swapped (lat/lon order)
- ✅ Using decimal degrees (not DMS format)
- ✅ API returns straight-line instead of driving

---

## 📞 Support

- **OpenRouteService**: https://ask.openrouteservice.org/
- **Google Maps**: https://developers.google.com/maps/support

---

## ✅ Recommendation

For most users:

1. Start with **Haversine fallback** (no setup)
2. Add **OpenRouteService** when going live (5 min setup)
3. Upgrade to **Google Maps** if needed (enterprise only)

**Total setup time**: 5 minutes
**Total cost**: $0
**Accuracy**: ★★★★☆
