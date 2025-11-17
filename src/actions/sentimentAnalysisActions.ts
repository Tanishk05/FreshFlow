"use server";

import { generateJSON, generateText, isGeminiConfigured } from "@/lib/gemini";
import { aiCache, generateCacheKey } from "@/lib/cache";

// Type definitions
export interface MarketIntelligence {
  id: string;
  category:
    | "price_trend"
    | "weather_alert"
    | "demand_forecast"
    | "supply_chain"
    | "policy_update";
  severity: "info" | "warning" | "critical";
  title: string;
  summary: string;
  impact: string;
  recommendations: string[];
  confidence: number;
  sources: string[];
  timestamp: Date;
  affectedProducts?: string[];
}

export interface SentimentAnalysis {
  overall: "positive" | "neutral" | "negative";
  score: number; // -1 to 1
  trends: {
    product: string;
    sentiment: "positive" | "neutral" | "negative";
    priceDirection: "rising" | "stable" | "falling";
    confidence: number;
  }[];
}

/**
 * Analyze market sentiment from various sources
 * Integrates news, weather, social media, and government policies
 */
export async function analyzeMarketSentiment(
  products: string[] = ["tomatoes", "onions", "potatoes", "leafy greens"]
): Promise<SentimentAnalysis> {
  if (!isGeminiConfigured()) {
    return {
      overall: "neutral" as const,
      score: 0,
      trends: [],
    };
  }

  // Check cache first
  const cacheKey = generateCacheKey("analyzeMarketSentiment", products);
  const cached = aiCache.get<SentimentAnalysis>(cacheKey);
  if (cached) {
    console.log("✅ Using cached market sentiment analysis");
    return cached;
  }

  try {
    const prompt = `
Analyze the current market sentiment for these fresh produce items in India: ${products.join(
      ", "
    )}

Consider:
- Recent price trends
- Seasonal demand patterns
- Weather impacts on supply
- Consumer buying behavior
- Festival/holiday demand

Return JSON:
{
  "overall": "positive" | "neutral" | "negative",
  "score": number (-1 to 1),
  "trends": [
    {
      "product": "product name",
      "sentiment": "positive" | "neutral" | "negative",
      "priceDirection": "rising" | "stable" | "falling",
      "confidence": number (0-100)
    }
  ]
}`;

    const analysis = await generateJSON<SentimentAnalysis>(
      prompt,
      "You are a market intelligence AI. Respond with valid JSON only."
    );

    // Cache the result for 24 hours
    aiCache.set(cacheKey, analysis);
    console.log("💾 Cached market sentiment analysis");

    return analysis;
  } catch (error) {
    console.error("Error analyzing market sentiment:", error);
    return {
      overall: "neutral" as const,
      score: 0,
      trends: [],
    };
  }
}

/**
 * Generate market intelligence alerts
 * Provides actionable insights for farmers, distributors, and retailers
 */
/**
 * Generate market intelligence alerts
 * Provides actionable insights for farmers, distributors, and retailers
 */
export async function generateMarketIntelligence(
  userRole: "farmer" | "distributor" | "retailer",
  userProducts: string[] = []
): Promise<MarketIntelligence[]> {
  if (!isGeminiConfigured()) {
    return [];
  }

  // Check cache first
  const cacheKey = generateCacheKey(
    "generateMarketIntelligence",
    userRole,
    userProducts
  );
  const cached = aiCache.get<MarketIntelligence[]>(cacheKey);
  if (cached) {
    console.log("✅ Using cached market intelligence");
    return cached;
  }

  try {
    const prompt = `
Generate 3-5 market intelligence alerts for a ${userRole} in India's fresh produce supply chain.
${userProducts.length > 0 ? `Their products: ${userProducts.join(", ")}` : ""}

Include alerts about:
- Price trends and market volatility
- Weather impacts on supply/demand
- Demand forecasts for specific products
- Supply chain disruptions
- Government policies affecting agriculture

Return JSON array:
[
  {
    "category": "price_trend" | "weather_alert" | "demand_forecast" | "supply_chain" | "policy_update",
    "severity": "info" | "warning" | "critical",
    "title": "Brief title",
    "summary": "1-2 sentence summary",
    "impact": "How this affects the ${userRole}",
    "recommendations": ["action 1", "action 2"],
    "confidence": number (70-100),
    "sources": ["source 1", "source 2"],
    "affectedProducts": ["product names if specific"]
  }
]`;

    const alerts = await generateJSON<
      Omit<MarketIntelligence, "id" | "timestamp">[]
    >(
      prompt,
      "You are a market intelligence AI. Respond with valid JSON array only."
    );

    const result = alerts.map((alert, index) => ({
      ...alert,
      id: `alert-${Date.now()}-${index}`,
      timestamp: new Date(),
    }));

    // Cache the result for 24 hours
    aiCache.set(cacheKey, result);
    console.log("💾 Cached market intelligence");

    return result;
  } catch (error) {
    console.error("Error generating market intelligence:", error);
    return [];
  }
}

/**
 * Generate a natural language market summary
 * Provides a human-readable overview of current market conditions
 */
export async function generateMarketSummary(
  userRole: "farmer" | "distributor" | "retailer"
): Promise<string> {
  if (!isGeminiConfigured()) {
    return "";
  }

  // Check cache first
  const cacheKey = generateCacheKey("generateMarketSummary", userRole);
  const cached = aiCache.get<string>(cacheKey);
  if (cached) {
    console.log("✅ Using cached market summary");
    return cached;
  }

  try {
    const prompt = `
Generate a brief market overview (3-4 sentences) for a ${userRole} in India's fresh produce market.

Focus on:
- Current market conditions
- Key opportunities or risks this week
- Actionable recommendations

Write in a professional, conversational tone. Be specific and India-focused.
`;

    const summary = await generateText(
      prompt,
      "You are a market analyst. Provide a concise market summary."
    );

    // Cache the result for 24 hours
    aiCache.set(cacheKey, summary);
    console.log("💾 Cached market summary");

    return summary;
  } catch (error) {
    console.error("Error generating market summary:", error);
    return "";
  }
}

// Mock data functions for when AI is not configured
// Currently disabled - returning empty data instead

/* Commented out to avoid unused function warnings
function getMockSentimentAnalysis(products: string[]): SentimentAnalysis {
  return {
    overall: "neutral",
    score: 0.15,
    trends: products.slice(0, 4).map((product) => ({
      product,
      sentiment: ["positive", "neutral", "negative"][
        Math.floor(Math.random() * 3)
      ] as "positive" | "neutral" | "negative",
      priceDirection: ["rising", "stable", "falling"][
        Math.floor(Math.random() * 3)
      ] as "rising" | "stable" | "falling",
      confidence: Math.floor(Math.random() * 30) + 70,
    })),
  };
}

function getMockMarketIntelligence(
  userRole: "farmer" | "distributor" | "retailer"
): MarketIntelligence[] {
  const roleSpecificAlerts = {
    farmer: [
      {
        category: "demand_forecast" as const,
        severity: "info" as const,
        title: "High Demand Expected for Leafy Greens",
        summary:
          "Winter season driving 40% increase in demand for spinach and fenugreek",
        impact: "Opportunity to increase planting and achieve premium prices",
        recommendations: [
          "Increase spinach plantation by 20-30%",
          "Harvest early morning for maximum freshness",
          "Connect with nearby retailers for direct sales",
        ],
        confidence: 85,
        sources: ["Mandi Price Data", "Weather Forecast"],
        affectedProducts: ["Spinach", "Fenugreek", "Coriander"],
      },
      {
        category: "weather_alert" as const,
        severity: "warning" as const,
        title: "Cold Wave Expected Next Week",
        summary: "Temperature drop to 8°C may affect sensitive crops",
        impact: "Risk of frost damage to tomatoes and peppers",
        recommendations: [
          "Cover sensitive crops with protective sheets",
          "Delay transplanting seedlings",
          "Irrigate fields in evening to prevent frost",
        ],
        confidence: 78,
        sources: ["IMD Weather", "Agricultural Advisory"],
        affectedProducts: ["Tomatoes", "Peppers", "Eggplant"],
      },
    ],
    distributor: [
      {
        category: "supply_chain" as const,
        severity: "warning" as const,
        title: "Fuel Price Increase Affecting Routes",
        summary: "Diesel prices up 5% this month, impacting delivery costs",
        impact: "Transportation costs increased by ₹2-3 per km",
        recommendations: [
          "Optimize routes using load consolidation",
          "Negotiate fuel surcharges with clients",
          "Consider alternative delivery schedules",
        ],
        confidence: 92,
        sources: ["Oil Marketing Companies", "Transport Association"],
        affectedProducts: [],
      },
    ],
    retailer: [
      {
        category: "price_trend" as const,
        severity: "info" as const,
        title: "Onion Prices Stabilizing",
        summary:
          "After 2 weeks of volatility, onion prices settling at ₹35-40/kg",
        impact: "Opportunity to stock up and maintain stable customer prices",
        recommendations: [
          "Increase onion inventory by 40%",
          "Lock in current prices with suppliers",
          "Promote onion-based recipes in store",
        ],
        confidence: 80,
        sources: ["APMC Market Data", "Wholesale Surveys"],
        affectedProducts: ["Onions"],
      },
    ],
  };

  const alerts = roleSpecificAlerts[userRole];

  return alerts.map((alert, index) => ({
    ...alert,
    id: `mock-intel-${index}`,
    timestamp: new Date(),
  }));
}

function getMockMarketSummary(userRole: string): string {
  const summaries = {
    farmer: `Good news for farmers this week! The winter crop season is showing strong demand, especially for leafy greens and root vegetables. Spinach prices are up 15% compared to last month, and demand is expected to remain high through February.

However, keep an eye on the weather forecast - a cold wave is predicted for next week which could affect sensitive crops like tomatoes and peppers. Consider protective measures for these crops.

**Recommended Action:** Focus on harvesting leafy greens early while prices are high, and protect sensitive crops from the upcoming cold wave.`,

    distributor: `The logistics landscape is seeing some challenges this week with fuel prices up 5%, but overall demand remains strong. Cold chain management is critical right now with the temperature fluctuations.

Route optimization is more important than ever - consider consolidating deliveries and using AI-powered routing to reduce fuel consumption. Several retailers are reporting stock-outs of winter vegetables, creating opportunities for quick deliveries.

**Recommended Action:** Focus on efficiency gains through route optimization, and prioritize high-margin cold chain deliveries for premium clients.`,

    retailer: `Great week ahead for retail! Consumer demand for fresh produce is up 12% compared to last month, driven by health consciousness and festival preparations. Onion prices have finally stabilized after weeks of volatility.

Watch for opportunities in leafy greens (spinach, fenugreek) which are in peak season. Consider promotional pricing on items nearing expiry - dynamic pricing can help you clear stock while maintaining margins.

**Recommended Action:** Stock up on winter vegetables while prices are stable, and use dynamic pricing on items with <4 days shelf life to minimize waste.`,
  };

  return summaries[userRole as keyof typeof summaries] || summaries.retailer;
}
*/
