"use client";
import React, { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (
    address: string,
    lat?: number,
    lng?: number,
    city?: string,
    state?: string,
    pincode?: string
  ) => void;
  placeholder?: string;
  apiKey: string;
  className?: string;
}

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    type GoogleWindow = Window & {
      google?: typeof google;
    };
    const win = window as GoogleWindow;
    if (win.google && win.google.maps && win.google.maps.places) {
      resolve();
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search address...",
  apiKey,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!active) return;
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      active = false;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    if (autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current!,
      {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      }
    );
    autocompleteRef.current.addListener("place_changed", () => {
      if (!autocompleteRef.current) return;
      const place = autocompleteRef.current.getPlace();
      if (!place) return;
      const address = place.formatted_address || place.name || "";
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      let city = "";
      let state = "";
      let pincode = "";
      if (place.address_components) {
        for (const comp of place.address_components) {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1"))
            state = comp.long_name;
          if (comp.types.includes("postal_code")) pincode = comp.long_name;
        }
      }
      onChange(address, lat, lng, city, state, pincode);
    });
  }, [ready, onChange]);

  // Keep input value in sync
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        className ||
        "block w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 ease-in-out sm:text-sm"
      }
      type="text"
      autoComplete="off"
      disabled={!ready}
    />
  );
};

export default AddressAutocomplete;
