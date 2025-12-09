"use client";

import { useSession } from "next-auth/react";
import { completeSignup, FormState } from "@/actions/completeSignup";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import GoogleLocationPicker from "@/components/ui/GoogleLocationPicker";
import { useGoogleMaps } from "@/providers/GoogleMapsProvider";

// --- Styled UI Components ---

const Label = ({ children, ...props }: React.ComponentProps<"label">) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1" {...props}>
    {children}
  </label>
);

const Input = (props: React.ComponentProps<"input">) => (
  <input
    className="block w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 ease-in-out sm:text-sm"
    {...props}
  />
);

const Select = (props: React.ComponentProps<"select">) => (
  <div className="relative">
    <select
      className="block w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 appearance-none transition-all duration-200 ease-in-out sm:text-sm"
      {...props}
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  </div>
);

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {pending ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Completing...
        </span>
      ) : (
        "Complete Signup"
      )}
    </button>
  );
}

export default function CompleteSignupPage() {
  const { isLoaded } = useGoogleMaps(); // Use shared provider
  const { data: session, status } = useSession();
  const router = useRouter();

  const initialState: FormState = { error: null, details: undefined };
  const [state, formAction] = useActionState(completeSignup, initialState);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [lat, setLat] = React.useState<number>(19.076); // Default: Mumbai
  const [lng, setLng] = React.useState<number>(72.8777);
  const [address, setAddress] = React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [stateName, setStateName] = React.useState<string>("");
  const [pincode, setPincode] = React.useState<string>("");

  // Redirect if user already has a role
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [status, session?.user?.role, router]);

  if (status === "loading" || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-green-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="mt-4 text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Redirecting to dashboard...
          </h2>
          <p className="mt-2 text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // Check if user *needs* to fill in name/username
  const needsProfileData =
    session?.user?.provider === "nodemailer" || !session?.user?.name;

  // Function to get current location and update all fields
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLat(lat);
        setLng(lng);
        // Reverse geocode to get address fields
        if (window.google) {
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
                if (comp.types.includes("postal_code"))
                  pincode = comp.long_name;
              }
              if (!address && results[0].address_components) {
                address = results[0].address_components
                  .map((c) => c.long_name)
                  .join(", ");
              }
              setAddress(address);
              setCity(city);
              setStateName(state);
              setPincode(pincode);
            } else {
              setAddress("");
              setCity("");
              setStateName("");
              setPincode("");
            }
            setIsGettingLocation(false);
          });
        } else {
          setAddress("");
          setCity("");
          setStateName("");
          setPincode("");
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setLocationError(
          "Unable to get location. Please select manually on the map."
        );
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-white/50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 transform rotate-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Help us personalize your experience on FreshFlow
          </p>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800 font-medium">{state.error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="role">I am a...</Label>
            <Select id="role" name="role" required defaultValue="">
              <option value="" disabled>
                Select your role
              </option>
              <option value="farmer">Farmer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </Select>
            {state.details?.fieldErrors?.role && (
              <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                {state.details.fieldErrors.role.join(", ")}
              </p>
            )}
          </div>

          {needsProfileData && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                />
                {state.details?.fieldErrors?.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                    <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                    {state.details.fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                />
                {state.details?.fieldErrors?.username && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                    <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                    {state.details.fieldErrors.username.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="phone">
              Phone Number{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
            />
            {state.details?.fieldErrors?.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                {state.details.fieldErrors.phone.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Address Details
              </h3>
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                Required for delivery
              </span>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <AddressAutocomplete
                value={address}
                onChange={(addr, newLat, newLng, city, state, pincode) => {
                  setAddress(addr);
                  if (newLat && newLng) {
                    setLat(newLat);
                    setLng(newLng);
                  }
                  if (city) setCity(city);
                  if (state) setStateName(state);
                  if (pincode) setPincode(pincode);
                }}
                placeholder="Search for your address..."
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              />
              <input type="hidden" id="street" name="street" value={address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                type="text"
                placeholder="400001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="mb-0">
                  Select Location on Map <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <svg
                        className="animate-spin h-3 w-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Getting location...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Use My Location
                    </>
                  )}
                </button>
              </div>
              <GoogleLocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng, addr, city, state, pincode) => {
                  setLat(newLat);
                  setLng(newLng);
                  if (addr) setAddress(addr);
                  if (city) setCity(city);
                  if (state) setStateName(state);
                  if (pincode) setPincode(pincode);
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="hidden"
                    id="latitude"
                    name="latitude"
                    value={lat}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Latitude: {lat.toFixed(6)}
                  </p>
                </div>
                <div>
                  <input
                    type="hidden"
                    id="longitude"
                    name="longitude"
                    value={lng}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Longitude: {lng.toFixed(6)}
                  </p>
                </div>
              </div>
              {locationError && (
                <p className="text-xs text-red-600 mt-2 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {locationError}
                </p>
              )}
              <p className="text-xs text-gray-500 flex items-center mt-2">
                <svg
                  className="h-4 w-4 mr-1.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Click on the map or use &quot;Use My Location&quot; to set your
                address.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
