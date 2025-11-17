import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
// Get your API key from: https://aistudio.google.com/app/apikey
// Add GEMINI_API_KEY to your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the Gemini model
// Using gemini-2.0-flash-exp for higher free tier limits (15 RPM vs 2 RPM for 2.5 Pro)
export function getGeminiModel(modelName: string = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

// Helper function to check if Gemini is configured
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Error messages
export const GEMINI_NOT_CONFIGURED_MESSAGE =
  "Gemini API is not configured. Please add GEMINI_API_KEY to your environment variables. Get it from: https://aistudio.google.com/app/apikey";

// Rate limiting and error handling wrapper
export async function callGemini<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  if (!isGeminiConfigured()) {
    console.warn(GEMINI_NOT_CONFIGURED_MESSAGE);
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(GEMINI_NOT_CONFIGURED_MESSAGE);
  }

  try {
    return await fn();
  } catch (error: unknown) {
    // Check if it's a rate limit error (429)
    const isRateLimitError =
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 429;

    if (isRateLimitError) {
      console.warn(
        "⚠️ Gemini API rate limit reached. Using fallback data. Rate limits reset every minute."
      );
    } else {
      console.error("Gemini API Error:", error);
    }

    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

// Helper to generate content with JSON response
export async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  return callGemini(async () => {
    const model = getGeminiModel();

    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\n${prompt}\n\nRespond with valid JSON only.`
      : `${prompt}\n\nRespond with valid JSON only.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch =
      text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    return JSON.parse(jsonText);
  });
}

// Helper to generate text content
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  return callGemini(async () => {
    const model = getGeminiModel();

    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  });
}
