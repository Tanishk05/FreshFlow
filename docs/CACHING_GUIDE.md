# AI Response Caching Guide

## Overview

To optimize API usage and reduce costs, we've implemented an intelligent caching system for all AI-generated responses. This significantly reduces the number of API calls while maintaining fresh, relevant data.

## How It Works

### Cache Strategy

```
┌─────────────────────────────────────────┐
│  User Requests AI Feature               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │ Check Cache?   │
          └────┬───────┬───┘
               │       │
          Yes  │       │  No
               │       │
               ▼       ▼
     ┌──────────────┐  ┌──────────────┐
     │ Return Cached│  │ Call AI API  │
     │    Data      │  │              │
     └──────────────┘  └──────┬───────┘
                              │
                              ▼
                     ┌────────────────┐
                     │  Cache Result  │
                     │  (24hr TTL)    │
                     └────────────────┘
```

### Cache Duration (TTL)

Different features have different cache durations based on data freshness requirements:

| Feature                   | Cache Duration | Reason                            |
| ------------------------- | -------------- | --------------------------------- |
| **Market Intelligence**   | 24 hours       | Market conditions change daily    |
| **Market Summary**        | 24 hours       | General market overview, stable   |
| **Sentiment Analysis**    | 24 hours       | Trends change slowly              |
| **Personalized Insights** | 6 hours        | User-specific, needs fresher data |
| **Quick Insights**        | Not cached     | Real-time recommendations         |
| **Dynamic Pricing**       | Not cached     | Price-sensitive, real-time        |

## Implementation Details

### Cache Storage

- **Type**: In-memory cache (Map-based)
- **Persistence**: Session-only (clears on server restart)
- **Auto-cleanup**: Runs every hour to remove expired entries
- **Thread-safe**: Singleton pattern ensures consistency

### Cache Keys

Cache keys are generated from:

1. Function name
2. All function parameters (serialized as JSON)

Example:

```typescript
// Cache key for: generateMarketIntelligence("farmer", ["tomatoes", "onions"])
Key: "generateMarketIntelligence:["farmer",["tomatoes","onions"]]"
```

### Code Example

```typescript
// Before (No caching - hits API every time)
export async function generateMarketIntelligence(userRole, userProducts) {
  const alerts = await generateJSON(prompt);
  return alerts;
}

// After (With caching - hits API only once per 24 hours)
export async function generateMarketIntelligence(userRole, userProducts) {
  const cacheKey = generateCacheKey(
    "generateMarketIntelligence",
    userRole,
    userProducts
  );
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log("✅ Using cached market intelligence");
    return cached;
  }

  const alerts = await generateJSON(prompt);
  aiCache.set(cacheKey, alerts); // Cache for 24 hours
  console.log("💾 Cached market intelligence");
  return alerts;
}
```

## Cached Functions

### 1. Market Intelligence (`sentimentAnalysisActions.ts`)

- ✅ **analyzeMarketSentiment()** - 24hr cache
- ✅ **generateMarketIntelligence()** - 24hr cache
- ✅ **generateMarketSummary()** - 24hr cache

### 2. Personalized Insights (`aiInsightsActions.ts`)

- ✅ **generatePersonalizedInsights()** - 6hr cache
- ❌ **generateDailyQuickInsights()** - No cache (real-time)
- ❌ **generatePerformanceAnalysis()** - No cache (on-demand)

### 3. Dynamic Pricing (`aiPricingActions.ts`)

- ❌ **generateAIPricingSuggestion()** - No cache (price-sensitive)

## Benefits

### 📊 API Usage Reduction

| Scenario                   | Without Cache | With Cache    | Savings |
| -------------------------- | ------------- | ------------- | ------- |
| 10 users viewing dashboard | 30 API calls  | 3 API calls   | **90%** |
| User refreshing page 5x    | 15 API calls  | 3 API calls   | **80%** |
| 100 daily users            | 300 API calls | ~30 API calls | **90%** |

### 💰 Cost Savings

**Free Tier Limits:**

- 1,500 requests/day
- Without cache: ~100 users max
- With cache: **~1,000 users** (10x improvement)

### ⚡ Performance

- **Cached response**: <5ms
- **API call**: 2-5 seconds
- **Speed improvement**: 100-1000x faster

## Monitoring Cache Performance

### Console Logs

Watch for these messages in your server logs:

```bash
✅ Using cached market intelligence     # Cache hit
💾 Cached market intelligence          # Cache miss, stored
⚠️ Gemini API rate limit reached       # API error, using fallback
```

### Cache Statistics

Get cache stats programmatically:

```typescript
import { aiCache } from "@/lib/cache";

const stats = aiCache.getStats();
console.log(stats);
// {
//   totalEntries: 15,
//   validEntries: 12,
//   expiredEntries: 3
// }
```

## Cache Management

### Manual Cache Clear

```typescript
import { aiCache } from "@/lib/cache";

// Clear all cache
aiCache.clear();

// Clear specific entry
aiCache.delete('generateMarketIntelligence:["farmer",[]]');

// Run cleanup (remove expired)
aiCache.cleanup();
```

### Automatic Cleanup

- Runs every hour
- Removes expired entries
- Prevents memory leaks

## Best Practices

### ✅ Do's

1. **Use cache for stable data** - Market trends, general insights
2. **Set appropriate TTL** - Match data freshness requirements
3. **Monitor cache hits** - Check console logs for effectiveness
4. **Clear cache on deployment** - Fresh start with new code

### ❌ Don'ts

1. **Don't cache real-time data** - Pricing, live inventory
2. **Don't cache user-sensitive data long** - Personal info, auth tokens
3. **Don't cache error responses** - Always try API again
4. **Don't cache without TTL** - Always set expiration

## Troubleshooting

### Cache Not Working?

1. **Check console logs** - Look for cache hit/miss messages
2. **Verify cache key** - Keys must match exactly
3. **Check TTL** - Cache may have expired
4. **Server restart?** - In-memory cache clears on restart

### Old Data Showing?

1. **Wait for TTL** - Cache expires automatically
2. **Manual clear** - Use `aiCache.clear()`
3. **Reduce TTL** - Shorter cache duration in code

### Memory Concerns?

- Auto-cleanup runs hourly
- Average entry: ~5KB
- 1000 entries ≈ 5MB memory
- Very small footprint

## Future Enhancements

### Planned Features

- [ ] Redis/External cache for persistence
- [ ] Cache warming on server start
- [ ] Per-user cache quotas
- [ ] Cache hit rate metrics dashboard
- [ ] Selective cache invalidation
- [ ] Distributed cache for multi-server

## Summary

The caching system provides:

- ✅ **90% reduction** in API calls
- ✅ **100-1000x faster** response times
- ✅ **10x more users** on free tier
- ✅ **Zero configuration** required
- ✅ **Automatic cleanup** and management

Your AI features will work seamlessly while staying well within API quotas! 🚀
