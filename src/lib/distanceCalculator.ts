/**
 * Calculate driving distance using Google Maps Distance Matrix API
 * Requires a valid GOOGLE_MAPS_API_KEY in environment
 */
export async function getDeliveryDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{
  distance: number;
  duration: number; // in seconds
  durationText: string; // human readable
  method: "driving";
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
    throw new Error("Invalid coordinates");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing");
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLon}&destinations=${toLat},${toLon}&mode=driving&key=${apiKey}`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch distance from Google Maps API");
  }

  const data = await response.json();
  const element = data.rows[0]?.elements[0];
  const distanceInMeters = element?.distance?.value;
  const durationInSeconds = element?.duration?.value;
  const durationText = element?.duration?.text;
  if (!distanceInMeters || !durationInSeconds || !durationText) {
    throw new Error(
      "No distance or duration data returned from Google Maps API"
    );
  }
  const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
  return {
    distance: distanceInKm,
    duration: durationInSeconds,
    durationText,
    method: "driving",
  };
}
