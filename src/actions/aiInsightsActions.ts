"use server";

import { generateJSON, isGeminiConfigured } from "@/lib/gemini";
import { auth } from "@/auth";
import { aiCache, generateCacheKey } from "@/lib/cache";

// Type definitions
export interface PersonalizedInsight {
  id: string;
  type: "opportunity" | "warning" | "achievement" | "tip";
  title: string;
  message: string;
  actionable: boolean;
  action?: {
    label: string;
    url?: string;
  };
  confidence: number;
  timestamp: Date;
}

export interface DashboardData {
  role: "farmer" | "distributor" | "retailer";
  userId: string;
  stats: Record<string, unknown>;
  recentActivity: string[];
  inventory?: unknown[];
  orders?: unknown[];
  performance?: Record<string, number>;
}

/**
 * Generate personalized AI insights for a user based on their dashboard data
 * Provides opportunities, warnings, achievements, and tips
 */
export async function generatePersonalizedInsights(
  dashboardData: DashboardData
): Promise<PersonalizedInsight[]> {
  if (!isGeminiConfigured()) {
    return [];
  }

  // Check cache first (cache for 6 hours since this is user-specific)
  const cacheKey = generateCacheKey(
    "generatePersonalizedInsights",
    dashboardData.role,
    dashboardData.userId
  );
  const cached = aiCache.get<PersonalizedInsight[]>(cacheKey);
  if (cached) {
    console.log("✅ Using cached personalized insights");
    return cached;
  }

  try {
    const prompt = `
You are an AI business advisor for FreshFlow, a fresh produce supply chain platform.
Generate 3-5 personalized insights for this ${dashboardData.role}.

**User Data:**
Role: ${dashboardData.role}
Stats: ${JSON.stringify(dashboardData.stats)}
Recent Activity: ${dashboardData.recentActivity.join(", ")}
${
  dashboardData.performance
    ? `Performance: ${JSON.stringify(dashboardData.performance)}`
    : ""
}

**Insight Types:**
1. **Opportunity**: Revenue growth, new markets, optimization chances
2. **Warning**: Risks, inefficiencies, problems to address
3. **Achievement**: Celebrate successes, milestones reached
4. **Tip**: Best practices, suggestions, pro tips

**Guidelines:**
- Make insights specific and data-driven
- Include concrete numbers when possible
- Provide actionable recommendations
- Be encouraging and positive where appropriate
- Mix different insight types for variety

Return JSON array:
[
  {
    "type": "opportunity" | "warning" | "achievement" | "tip",
    "title": "Brief title (5-8 words)",
    "message": "Detailed message (1-2 sentences with specific data)",
    "actionable": true/false,
    "action": {
      "label": "Action button text",
      "url": "/optional/path"
    },
    "confidence": number (70-100)
  }
]`;

    const insights = await generateJSON<
      Omit<PersonalizedInsight, "id" | "timestamp">[]
    >(
      prompt,
      "You are a business insights AI. Respond with valid JSON array only."
    );

    // Add IDs and timestamps
    const result = insights.map((insight, index) => ({
      ...insight,
      id: `insight-${Date.now()}-${index}`,
      timestamp: new Date(),
    }));

    // Cache for 6 hours (insights change more frequently)
    aiCache.set(cacheKey, result, 6 * 60 * 60 * 1000);
    console.log("💾 Cached personalized insights");

    return result;
  } catch (error) {
    console.error("Error generating personalized insights:", error);
    return [];
  }
}

/**
 * Generate quick daily insights for dashboard header
 * Brief 1-liner insights that update daily
 */
export async function generateDailyQuickInsights(
  userRole: "farmer" | "distributor" | "retailer"
): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  if (!isGeminiConfigured()) {
    return [];
  }

  try {
    const prompt = `
Generate 2-3 brief, actionable insights (10-15 words each) for a ${userRole} on India's fresh produce platform.

Focus on:
- Today's opportunities
- Current market conditions
- Quick wins

Make them specific, India-focused, and time-sensitive.

Return JSON array of strings: ["insight 1", "insight 2", "insight 3"]`;

    const insights = await generateJSON<string[]>(
      prompt,
      "You are an insights AI. Respond with JSON array of strings only."
    );

    return insights;
  } catch (error) {
    console.error("Error generating quick insights:", error);
    return [];
  }
}

/**
 * Analyze user performance and generate improvement suggestions
 */
export async function generatePerformanceAnalysis(
  userRole: "farmer" | "distributor" | "retailer",
  metrics: Record<string, number>
): Promise<{
  score: number;
  grade: "A" | "B" | "C" | "D";
  strengths: string[];
  improvements: string[];
  comparison: string;
}> {
  if (!isGeminiConfigured()) {
    return {
      score: 0,
      grade: "C",
      strengths: [],
      improvements: [],
      comparison: "AI analysis not available",
    };
  }

  try {
    const prompt = `
Analyze this ${userRole}'s performance metrics and provide feedback.

**Metrics:**
${JSON.stringify(metrics, null, 2)}

Provide:
1. Overall performance score (0-100)
2. Grade (A/B/C/D)
3. Top 3 strengths
4. Top 3 areas for improvement
5. Comparison to typical users ("better than X% of users")

Return JSON:
{
  "score": number (0-100),
  "grade": "A" | "B" | "C" | "D",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "comparison": "Performing better than X% of similar users"
}`;

    const analysis = await generateJSON<{
      score: number;
      grade: "A" | "B" | "C" | "D";
      strengths: string[];
      improvements: string[];
      comparison: string;
    }>(
      prompt,
      "You are a performance analyst AI. Respond with valid JSON only."
    );

    return analysis;
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return {
      score: 0,
      grade: "C" as const,
      strengths: [],
      improvements: [],
      comparison: "Unable to analyze at this time",
    };
  }
}

// Mock data functions - Currently disabled, returning empty data instead

/* Commented out to avoid unused function warnings
function getMockInsights(
  role: "farmer" | "distributor" | "retailer"
): PersonalizedInsight[] {
  const insightsByRole = {
    farmer: [
      {
        type: "opportunity" as const,
        title: "High Demand for Your Tomatoes",
        message:
          "3 new retailers in your area are looking for tomatoes. You could earn ₹8,000 more this week!",
        actionable: true,
        action: {
          label: "View Orders",
          url: "/dashboard/farmer#orders",
        },
        confidence: 89,
      },
      {
        type: "warning" as const,
        title: "Rain Expected in 2 Days",
        message:
          "Heavy rain forecast for Thursday-Friday. Consider harvesting spinach early to avoid damage.",
        actionable: true,
        action: {
          label: "View Weather",
        },
        confidence: 92,
      },
      {
        type: "achievement" as const,
        title: "Waste Reduced by 18%!",
        message:
          "Your waste is 18% below average this month. Great timing on harvests! 🎉",
        actionable: false,
        confidence: 100,
      },
      {
        type: "tip" as const,
        title: "Pro Tip: Morning Harvest",
        message:
          "Harvesting leafy greens before 8 AM increases shelf life by 2-3 days and fetches 12% higher prices.",
        actionable: false,
        confidence: 85,
      },
    ],
    distributor: [
      {
        type: "opportunity" as const,
        title: "Route Optimization Potential",
        message:
          "By consolidating 3 nearby deliveries, you could save ₹1,200 in fuel costs this week.",
        actionable: true,
        action: {
          label: "Optimize Routes",
          url: "/dashboard/distributor#fleet",
        },
        confidence: 87,
      },
      {
        type: "warning" as const,
        title: "Truck #MH-02-5678 Due for Service",
        message:
          "Vehicle has covered 4,800 km since last service. Schedule maintenance to avoid breakdowns.",
        actionable: true,
        action: {
          label: "Schedule Service",
        },
        confidence: 95,
      },
      {
        type: "achievement" as const,
        title: "100% On-Time Deliveries!",
        message:
          "All 24 deliveries this week were on-time. Excellent performance! 🚛✨",
        actionable: false,
        confidence: 100,
      },
    ],
    retailer: [
      {
        type: "opportunity" as const,
        title: "Dynamic Pricing Could Save ₹3,400",
        message:
          "4 items are expiring soon. Apply AI pricing suggestions to clear stock and recover ₹3,400.",
        actionable: true,
        action: {
          label: "Apply Pricing",
          url: "/dashboard/retailer#pricing",
        },
        confidence: 91,
      },
      {
        type: "warning" as const,
        title: "Low Stock on Popular Items",
        message:
          "Onions and tomatoes below reorder point. 7 customers searched for these today.",
        actionable: true,
        action: {
          label: "Reorder Now",
          url: "/dashboard/retailer#inventory",
        },
        confidence: 88,
      },
      {
        type: "achievement" as const,
        title: "Sales Up 24% This Week!",
        message:
          "Your revenue increased ₹12,500 compared to last week. Strong performance! 📈",
        actionable: false,
        confidence: 100,
      },
      {
        type: "tip" as const,
        title: "Weekend Demand Surge Expected",
        message:
          "Stock up 30% more leafy greens for Saturday-Sunday based on historical patterns.",
        actionable: true,
        action: {
          label: "Plan Inventory",
        },
        confidence: 82,
      },
    ],
  };

  const insights = insightsByRole[role];

  return insights.map((insight, index) => ({
    ...insight,
    id: `mock-insight-${index}`,
    timestamp: new Date(),
  }));
}

function getMockQuickInsights(role: string): string[] {
  const quickInsights = {
    farmer: [
      "Spinach prices up 15% this week - harvest now!",
      "Cold wave alert: protect sensitive crops",
      "3 new bulk orders in your region",
    ],
    distributor: [
      "Consolidate 3 routes to save ₹1,200 fuel",
      "Peak delivery hours: 7-9 AM today",
      "Truck #MH-5678 due for service soon",
    ],
    retailer: [
      "4 items expiring soon - apply dynamic pricing",
      "Weekend demand surge expected (+30%)",
      "Onions and tomatoes below reorder point",
    ],
  };

  return (
    quickInsights[role as keyof typeof quickInsights] || quickInsights.retailer
  );
}

function getMockPerformanceAnalysis() {
  return {
    score: 82,
    grade: "B" as const,
    strengths: [
      "Excellent on-time delivery rate (98%)",
      "Low waste percentage (8% below average)",
      "Strong customer satisfaction scores",
    ],
    improvements: [
      "Increase inventory turnover rate",
      "Optimize route planning for fuel efficiency",
      "Respond faster to pricing suggestions",
    ],
    comparison: "Performing better than 73% of similar users",
  };
}
*/
