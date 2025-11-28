"use client";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import React from "react";

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
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
}: AddressAutocompleteProps) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Optionally restrict to a country */
    },
    debounce: 300,
  });

  // Keep input value in sync with parent
  React.useEffect(() => {
    setValue(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    onChange(address);
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      // Extract city, state, pincode from address_components
      let city = "";
      let state = "";
      let pincode = "";
      if (results[0]?.address_components) {
        for (const comp of results[0].address_components) {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1"))
            state = comp.long_name;
          if (comp.types.includes("postal_code")) pincode = comp.long_name;
        }
      }
      onChange(address, lat, lng, city, state, pincode);
    } catch (error) {
      // Fallback: just set address
      onChange(address);
    }
  };

  return (
    <div className="relative">
      <input
        value={inputValue}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder || "Search address..."}
        className="block w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 ease-in-out sm:text-sm"
      />
      {status === "OK" && data.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-56 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="px-4 py-2 cursor-pointer hover:bg-green-50 text-sm text-black"
              onClick={() => handleSelect(description)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
