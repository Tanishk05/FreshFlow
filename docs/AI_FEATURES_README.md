# 🤖 AI Features Setup Guide

This document explains how to set up and use the AI-powered features in FreshFlow.

## 🚀 Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Environment Variables

Add to your `.env.local` file:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. That's It!

The AI features will automatically activate when the API key is detected. If no key is provided, the system falls back to rule-based algorithms.

---

## 🎯 Implemented AI Features

### Feature #3: Dynamic Pricing Optimization

**Location:** Retailer Dashboard → AI Dynamic Pricing section

**What it does:**

- Analyzes inventory items (stock, expiry, demand)
- Generates optimal pricing to maximize revenue and minimize waste
- Considers market context, seasonality, and urgency

**How to use:**

1. Navigate to Retailer Dashboard
2. Scroll to "AI Dynamic Pricing" section
3. View AI-generated pricing suggestions
4. Click "Apply" to update prices

**AI Enhancement:**

- Uses Gemini 2.0 Flash to analyze multiple factors
- Provides confidence scores and expected impact
- Falls back to rule-based pricing if AI unavailable

**Files:**

- `/src/actions/aiPricingActions.ts` - AI pricing logic
- `/src/actions/dynamicPricingActions.ts` - Integration
- `/src/components/dashboard/retailer/DynamicPricingSuggestions.tsx` - UI

---

### Feature #6: Sentiment Analysis & Market Intelligence

**Location:** All Dashboards → Market Intelligence Card

**What it does:**

- Analyzes market sentiment from news, weather, policies
- Provides actionable intelligence alerts
- Generates market overviews and recommendations

**How to use:**

1. View the "AI Market Intelligence" card on your dashboard
2. Click on alerts to expand details
3. Review recommendations and act accordingly

**AI Enhancement:**

- Real-time market sentiment analysis
- India-specific insights (festivals, weather, policies)
- Role-specific recommendations (farmer/distributor/retailer)

**Files:**

- `/src/actions/sentimentAnalysisActions.ts` - Market analysis logic
- `/src/components/dashboard/shared/MarketIntelligence.tsx` - UI component

---

### Feature #9: Personalized AI Insights

**Location:** All Dashboards → AI Insights Card

**What it does:**

- Generates personalized insights based on your activity
- Identifies opportunities, warnings, achievements, and tips
- Provides actionable recommendations with confidence scores

**How to use:**

1. View the "AI Insights for You" card on your dashboard
2. Review insights categorized by type (opportunity/warning/achievement/tip)
3. Click action buttons to navigate to relevant sections

**AI Enhancement:**

- Personalized to your specific data and performance
- Updates daily based on activity and market conditions
- Provides confidence scores for each insight

**Files:**

- `/src/actions/aiInsightsActions.ts` - Insights generation logic
- `/src/components/dashboard/shared/AIInsightsCard.tsx` - UI component

---

## 📊 Cost & Usage

### Gemini API Pricing (Free Tier)

**Free Tier Includes:**

- 1,500 requests per day
- 1 million tokens per month
- 15 requests per minute

**Estimated Usage for FreshFlow:**

| Feature               | Requests/Day | Cost     |
| --------------------- | ------------ | -------- |
| Dynamic Pricing       | ~50          | FREE     |
| Market Intelligence   | ~20          | FREE     |
| Personalized Insights | ~30          | FREE     |
| **Total**             | **~100/day** | **FREE** |

✅ Well within free tier limits!

**Paid Tier (if needed):**

- $0.000125 per 1K characters input
- $0.000375 per 1K characters output
- Estimated: $5-15/month for heavy usage

---

## 🔧 Integration with Dashboards

### Adding AI Features to Dashboards

#### Farmer Dashboard Example:

```tsx
import AIInsightsCard from "@/components/dashboard/shared/AIInsightsCard";
import MarketIntelligenceCard from "@/components/dashboard/shared/MarketIntelligence";

export default function FarmerDashboard() {
  return (
    <div className="grid gap-6">
      {/* Existing components */}
      <StatsGrid stats={stats} />
      <CropInventory crops={crops} />

      {/* Add AI Features */}
      <AIInsightsCard
        role="farmer"
        dashboardData={{
          stats: { totalCrops: crops.length },
          recentActivity: ["Harvested tomatoes", "Listed onions"],
        }}
      />

      <MarketIntelligenceCard
        role="farmer"
        userProducts={["tomatoes", "onions", "spinach"]}
      />
    </div>
  );
}
```

#### Distributor Dashboard Example:

```tsx
<AIInsightsCard
  role="distributor"
  dashboardData={{
    stats: { totalTrucks: fleet.length },
    recentActivity: ["Delivered to Store #123", "Optimized route"],
  }}
/>

<MarketIntelligenceCard
  role="distributor"
  userProducts={[]}
/>
```

#### Retailer Dashboard Example:

```tsx
<AIInsightsCard
  role="retailer"
  dashboardData={{
    stats: { inventoryCount: inventory.length },
    recentActivity: ["Applied pricing", "Restocked tomatoes"],
  }}
/>

<MarketIntelligenceCard
  role="retailer"
  userProducts={["tomatoes", "onions", "potatoes"]}
/>
```

---

## 🛡️ Fallback Mechanism

All AI features have intelligent fallbacks:

```typescript
// Automatically falls back to rule-based logic if:
// 1. GEMINI_API_KEY is not set
// 2. API rate limit exceeded
// 3. Network error
// 4. API response error

if (!isGeminiConfigured()) {
  return getRuleBasedPricing(item); // Fallback logic
}

try {
  return await generateAIPricing(item); // Try AI
} catch (error) {
  console.error("AI failed, using fallback");
  return getRuleBasedPricing(item); // Graceful degradation
}
```

**Benefits:**

- ✅ App works even without AI configured
- ✅ No hard dependency on external API
- ✅ Gradual enhancement (Progressive AI)
- ✅ Zero downtime if API fails

---

## 🔍 Testing AI Features

### Without API Key (Rule-Based Mode)

```bash
# Don't set GEMINI_API_KEY
npm run dev
```

- Pricing uses predefined rules (expiry-based discounts)
- Market intelligence shows static mock data
- Insights show role-specific templates

### With API Key (AI-Powered Mode)

```bash
# Add to .env.local
GEMINI_API_KEY=your-key-here
npm run dev
```

- Pricing uses real AI analysis
- Market intelligence fetches live insights
- Insights personalized to user data

---

## 📈 Monitoring & Debugging

### Check if AI is Active

```typescript
import { isGeminiConfigured } from "@/lib/gemini";

console.log("AI Configured:", isGeminiConfigured());
```

### View API Usage

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click on your API key
3. View "Usage" tab for request counts

### Debug AI Responses

Check browser console for:

- `"Gemini API not configured"` → Add API key
- `"AI pricing failed, falling back"` → Check API limits
- `"Error generating insights"` → Check network/API key

---

## 🚀 Performance Optimization

### 1. Caching (Future Enhancement)

```typescript
// Cache AI responses for 24 hours
const cachedInsights = await redis.get(`insights:${userId}`);
if (cachedInsights) return cachedInsights;

const freshInsights = await generateInsights(userId);
await redis.set(`insights:${userId}`, freshInsights, "EX", 86400);
```

### 2. Batch Processing

```typescript
// Process multiple items in one API call
const pricingPromises = items.map((item) => generatePricing(item));
const results = await Promise.all(pricingPromises);
```

### 3. Rate Limiting

```typescript
// Built into Gemini client
// Automatically handles rate limits
// Falls back on errors
```

---

## 🔐 Security Best Practices

### ✅ Do's

- ✅ Store API key in `.env.local` (never commit to git)
- ✅ Use server actions (`"use server"`) for AI calls
- ✅ Validate user authentication before AI requests
- ✅ Sanitize user input before sending to AI

### ❌ Don'ts

- ❌ Never expose API key in client-side code
- ❌ Don't send sensitive data (passwords, payment info) to AI
- ❌ Don't trust AI responses blindly (validate outputs)
- ❌ Don't commit `.env.local` to version control

---

## 📚 API Reference

### Gemini AI Library

```typescript
// Import Gemini utilities
import {
  generateJSON, // Generate structured JSON responses
  generateText, // Generate text responses
  isGeminiConfigured, // Check if API key is set
  callGemini, // Error-handling wrapper
  getGeminiModel, // Get model instance
} from "@/lib/gemini";
```

### Usage Examples

#### Generate JSON Response

```typescript
const analysis = await generateJSON<PricingAnalysis>(
  "Analyze this product and suggest optimal price...",
  "You are a pricing expert. Respond with JSON only."
);
```

#### Generate Text Response

```typescript
const summary = await generateText(
  "Summarize market conditions for farmers...",
  "You are a market analyst."
);
```

---

## 🆘 Troubleshooting

### Issue: "Gemini API not configured"

**Solution:** Add `GEMINI_API_KEY` to `.env.local`

### Issue: Rate limit exceeded

**Solution:**

- Wait for rate limit reset (resets per minute)
- Consider caching responses
- Upgrade to paid tier if needed

### Issue: AI responses not showing

**Solution:**

- Check browser console for errors
- Verify API key is valid
- Test with mock data first

### Issue: Incorrect AI responses

**Solution:**

- Review prompt engineering in action files
- Add more context to prompts
- Increase prompt specificity

---

## 🎓 Further Reading

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)
- [FreshFlow AI Strategy](/AI_INTEGRATION_STRATEGY.md)

---

## 📞 Support

For issues with AI features:

1. Check this documentation
2. Review error logs in browser console
3. Test with mock data first
4. Contact development team

**Happy AI-powered farming! 🚜🤖**
