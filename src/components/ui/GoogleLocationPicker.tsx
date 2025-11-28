"use client";
import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface GoogleLocationPickerProps {
  lat: number;
  lng: number;
  onChange: (
    lat: number,
    lng: number,
    address?: string,
    city?: string,
    state?: string,
    pincode?: string
  ) => void;
}

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
  marginBottom: "16px",
  overflow: "hidden",
  border: "2px solid #000",
  color: "#000",
};

export default function GoogleLocationPicker({
  lat,
  lng,
  onChange,
}: GoogleLocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (map) {
      map.panTo({ lat, lng });
    }
  }, [lat, lng, map]);

  if (!isLoaded)
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        Loading map...
      </div>
    );

  // Helper for reverse geocoding
  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) {
      onChange(lat, lng, "");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        let address = results[0].formatted_address || "";
        let city = "";
        let state = "";
        let pincode = "";
        for (const comp of results[0].address_components) {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1"))
            state = comp.long_name;
          if (comp.types.includes("postal_code")) pincode = comp.long_name;
        }
        // If no formatted_address, try to build from components
        if (!address && results[0].address_components) {
          address = results[0].address_components
            .map((c) => c.long_name)
            .join(", ");
        }
        onChange(lat, lng, address, city, state, pincode);
      } else {
        // Always update address to blank if not found
        onChange(lat, lng, "");
      }
    });
  };

  return (
    <div style={containerStyle as React.CSSProperties}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat, lng }}
        zoom={15}
        onLoad={setMap}
        onClick={(e) => {
          if (e.latLng) {
            reverseGeocode(e.latLng.lat(), e.latLng.lng());
          }
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}
