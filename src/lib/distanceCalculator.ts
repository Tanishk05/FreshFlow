/**
 * Distance Calculator using OpenRouteService API
 * Free API for calculating real-world driving distances
 *
 * API Documentation: https://openrouteservice.org/dev/#/api-docs
 * Free tier: 2000 requests/day
 */

// Fallback Haversine formula for when API fails or coordinates missing
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate real-world driving distance using OpenRouteService API
 * Falls back to Haversine formula if API fails
 */
export async function calculateRealDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{
  distance: number;
  method: "driving" | "straight-line" | "estimated";
}> {
  // First, try to get real driving distance from OpenRouteService
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?start=${fromLon},${fromLat}&end=${toLon},${toLat}`,
        {
          headers: {
            Authorization: apiKey,
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        const distanceInMeters =
          data.features[0]?.properties?.summary?.distance;

        if (distanceInMeters) {
          const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
          return { distance: distanceInKm, method: "driving" };
        }
      }
    } catch (error) {
      console.error("OpenRouteService API error:", error);
      // Fall through to Haversine
    }
  }

  // Fallback to straight-line distance
  const straightLineDistance = haversineDistance(
    fromLat,
    fromLon,
    toLat,
    toLon
  );

  // Add 30% to straight-line to approximate road distance
  const approximateRoadDistance =
    Math.round(straightLineDistance * 1.3 * 10) / 10;

  return { distance: approximateRoadDistance, method: "straight-line" };
}

/**
 * Alternative: Use Google Maps Distance Matrix API (if user has key)
 * More accurate but requires billing setup
 */
export async function calculateDistanceWithGoogle(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{ distance: number; method: "driving" | "straight-line" }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLon}&destinations=${toLat},${toLon}&mode=driving&key=${apiKey}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        const distanceInMeters = data.rows[0]?.elements[0]?.distance?.value;

        if (distanceInMeters) {
          const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
          return { distance: distanceInKm, method: "driving" };
        }
      }
    } catch (error) {
      console.error("Google Maps API error:", error);
    }
  }

  // Fallback to Haversine
  const straightLineDistance = haversineDistance(
    fromLat,
    fromLon,
    toLat,
    toLon
  );
  const approximateRoadDistance =
    Math.round(straightLineDistance * 1.3 * 10) / 10;

  return { distance: approximateRoadDistance, method: "straight-line" };
}

/**
 * Get estimated distance - checks environment and uses best available method
 */
export async function getDeliveryDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{
  distance: number;
  method: "driving" | "straight-line" | "estimated";
}> {
  // Validate coordinates
  if (
    !fromLat ||
    !fromLon ||
    !toLat ||
    !toLon ||
    fromLat < -90 ||
    fromLat > 90 ||
    toLat < -90 ||
    toLat > 90 ||
    fromLon < -180 ||
    fromLon > 180 ||
    toLon < -180 ||
    toLon > 180
  ) {
    // Return random estimate if coordinates invalid
    return {
      distance: Math.floor(Math.random() * 45) + 5,
      method: "estimated",
    };
  }

  // Try Google Maps first (most accurate, but requires billing)
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return await calculateDistanceWithGoogle(fromLat, fromLon, toLat, toLon);
  }

  // Try OpenRouteService (free, good accuracy)
  if (process.env.OPENROUTESERVICE_API_KEY) {
    return await calculateRealDistance(fromLat, fromLon, toLat, toLon);
  }

  // Fallback: Haversine + 30% for road curves
  const straightLineDistance = haversineDistance(
    fromLat,
    fromLon,
    toLat,
    toLon
  );
  const approximateRoadDistance =
    Math.round(straightLineDistance * 1.3 * 10) / 10;

  return { distance: approximateRoadDistance, method: "straight-line" };
}
