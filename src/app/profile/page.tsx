"use client";
import React, { useEffect, useMemo, useState, useRef, Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";
import SignOutBtn from "@/components/authButtons/SignOutBtn";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  CheckCircle2,
  Loader2,
  Upload,
  X,
  User,
  Crown,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import SubscriptionPlansComponent from "@/components/dashboard/SubscriptionPlansComponent";
import LoyaltyPointsComponent from "@/components/dashboard/LoyaltyPointsComponent";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import GoogleLocationPicker from "@/components/ui/GoogleLocationPicker";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";

const GOOGLE_MAPS_LIBRARIES: Libraries = ["places", "marker"];

function ProfileContent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") || "farmer";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state - get from URL params or default to "profile"
  const [activeTab, setActiveTab] = useState<
    "profile" | "subscription" | "loyalty"
  >("profile");

  // Location state for map
  const [lat, setLat] = useState<number>(19.076); // Default: Mumbai
  const [lng, setLng] = useState<number>(72.8777);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Update active tab based on URL params
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "subscription" || tab === "loyalty") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    image: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      latitude: 19.076,
      longitude: 72.8777,
    },
  });

  const [initialForm, setInitialForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    image: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      latitude: 19.076,
      longitude: 72.8777,
    },
  });

  const [loading, setLoading] = useState(true);

  // Fetch user profile data from the API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const profileData = {
            name: data.name || "",
            email: data.email || "",
            username: data.username || "",
            phone: data.phone || "",
            image: data.image || "",
            address: {
              street: data.address?.street || "",
              city: data.address?.city || "",
              state: data.address?.state || "",
              pincode: data.address?.pincode || "",
              country: data.address?.country || "",
              latitude: data.address?.latitude || 19.076,
              longitude: data.address?.longitude || 72.8777,
            },
          };
          setForm(profileData);
          setInitialForm(profileData);
          // Update map location
          if (data.address?.latitude && data.address?.longitude) {
            setLat(data.address.latitude);
            setLng(data.address.longitude);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload to Cloudinary via API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setForm((f) => ({ ...f, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        // Update form with new coordinates
        setForm((f) => ({
          ...f,
          address: {
            ...f.address,
            latitude: newLat,
            longitude: newLng,
          },
        }));
        // Reverse geocode to get address fields
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: newLat, lng: newLng } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                let street = results[0].formatted_address || "";
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
                if (!street && results[0].address_components) {
                  street = results[0].address_components
                    .map((c) => c.long_name)
                    .join(", ");
                }
                setForm((f) => ({
                  ...f,
                  address: {
                    ...f.address,
                    street,
                    city,
                    state,
                    pincode,
                  },
                }));
              }
              setIsGettingLocation(false);
            }
          );
        } else {
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

  const isDirty = useMemo(() => {
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.username !== initialForm.username ||
      form.phone !== initialForm.phone ||
      form.image !== initialForm.image ||
      form.address.street !== initialForm.address.street ||
      form.address.city !== initialForm.address.city ||
      form.address.state !== initialForm.address.state ||
      form.address.pincode !== initialForm.address.pincode ||
      form.address.country !== initialForm.address.country ||
      form.address.latitude !== initialForm.address.latitude ||
      form.address.longitude !== initialForm.address.longitude
    );
  }, [form, initialForm]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username || undefined,
          phone: form.phone || undefined,
          image: form.image,
          address: {
            street: form.address.street || undefined,
            city: form.address.city || undefined,
            state: form.address.state || undefined,
            pincode: form.address.pincode || undefined,
            country: form.address.country || undefined,
            latitude: form.address.latitude,
            longitude: form.address.longitude,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }

      // Refresh session so UI reflects latest values
      await update?.();
      setSaved(true);
      // Update initial form to current values after successful save
      setInitialForm(form);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSaved(false);
        setError("");
      }, 3000);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            role={role}
            isShrunk={isShrunk}
            setIsShrunk={setIsShrunk}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </div>

        <motion.main
          animate={{
            marginLeft: isDesktop ? (isShrunk ? "88px" : "240px") : "0px",
          }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full overflow-y-hidden"
        >
          <DashboardHeader
            title="Profile"
            newButtonText=""
            onNewPlanClick={() => {}}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            showNewPlan={false}
            showExport={false}
            showAlerts={false}
            hideMobileMenuButton
          />

          <div className="flex-1 min-h-0 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header chip */}
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-linear-to-r from-green-600 to-emerald-500 text-white shadow">
                Profile & Settings
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                    activeTab === "profile"
                      ? "border-green-600 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("subscription")}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                    activeTab === "subscription"
                      ? "border-purple-600 text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Crown size={16} />
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab("loyalty")}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                    activeTab === "loyalty"
                      ? "border-purple-600 text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Sparkles size={16} />
                  Loyalty Points
                </button>
              </div>

              {loading && activeTab === "profile" ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {activeTab === "profile" && (
                    <>
                      <form
                        onSubmit={onSave}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                      >
                        {/* Left: Avatar and role */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col items-center gap-4">
                          <div className="relative w-28 h-28 group">
                            <Image
                              src={
                                form.image ||
                                session?.user?.image ||
                                "https://avatar.vercel.sh/user.png"
                              }
                              alt="Avatar"
                              width={112}
                              height={112}
                              className="rounded-full object-cover w-28 h-28 border-2 border-gray-200 dark:border-gray-700"
                            />
                            {uploading && (
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                            {form.image && !uploading && (
                              <button
                                type="button"
                                onClick={removeAvatar}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove avatar"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Profile Picture
                            </label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <label
                              htmlFor="avatar-upload"
                              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 cursor-pointer transition-colors bg-gray-50 dark:bg-gray-900/40"
                            >
                              <Upload size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Choose Image
                              </span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                              Max 5MB • JPG, PNG, GIF
                            </p>
                          </div>
                          <div className="w-full">
                            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                              Role
                            </label>
                            <input
                              value={role}
                              disabled
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-gray-500"
                            />
                          </div>
                        </div>

                        {/* Right: Details */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Full name
                              </label>
                              <input
                                value={form.name || ""}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    name: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                placeholder="Your name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Username
                              </label>
                              <input
                                value={form.username || ""}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    username: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                placeholder="@handle"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={form.email || ""}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    email: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                placeholder="you@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Phone
                              </label>
                              <input
                                value={form.phone || ""}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    phone: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                placeholder="(+91) 98765 43210"
                              />
                            </div>
                          </div>

                          {/* Address Section */}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Address
                              </h3>
                              <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation || !isLoaded}
                                className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGettingLocation ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Getting location...
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    Use My Location
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                  Street Address
                                </label>
                                {isLoaded ? (
                                  <AddressAutocomplete
                                    value={form.address.street || ""}
                                    onChange={(
                                      addr,
                                      newLat,
                                      newLng,
                                      city,
                                      state,
                                      pincode
                                    ) => {
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          street: addr,
                                          city: city || f.address.city,
                                          state: state || f.address.state,
                                          pincode: pincode || f.address.pincode,
                                          latitude:
                                            newLat || f.address.latitude,
                                          longitude:
                                            newLng || f.address.longitude,
                                        },
                                      }));
                                      if (newLat && newLng) {
                                        setLat(newLat);
                                        setLng(newLng);
                                      }
                                    }}
                                    placeholder="Search for your address..."
                                    apiKey={
                                      process.env
                                        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-400/20 transition-all"
                                  />
                                ) : (
                                  <input
                                    value={form.address.street || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          street: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    placeholder="Loading..."
                                    disabled
                                  />
                                )}
                              </div>

                              {isLoaded && (
                                <div>
                                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    Select Location on Map
                                  </label>
                                  <GoogleLocationPicker
                                    lat={lat}
                                    lng={lng}
                                    onChange={(
                                      newLat,
                                      newLng,
                                      addr,
                                      city,
                                      state,
                                      pincode
                                    ) => {
                                      setLat(newLat);
                                      setLng(newLng);
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          street: addr || f.address.street,
                                          city: city || f.address.city,
                                          state: state || f.address.state,
                                          pincode: pincode || f.address.pincode,
                                          latitude: newLat,
                                          longitude: newLng,
                                        },
                                      }));
                                    }}
                                  />
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Latitude: {lat.toFixed(6)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Longitude: {lng.toFixed(6)}
                                    </p>
                                  </div>
                                  {locationError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                                      <X className="h-3 w-3" />
                                      {locationError}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    City
                                  </label>
                                  <input
                                    value={form.address.city || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          city: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    placeholder="Mumbai"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    State
                                  </label>
                                  <input
                                    value={form.address.state || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          state: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    placeholder="Maharashtra"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    Pincode
                                  </label>
                                  <input
                                    value={form.address.pincode || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          pincode: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    placeholder="400001"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    Country
                                  </label>
                                  <input
                                    value={form.address.country || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        address: {
                                          ...f.address,
                                          country: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    placeholder="India"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={!isDirty || saving}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50 inline-flex items-center gap-2"
                            >
                              {saving && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setForm(initialForm);
                              }}
                              className="px-4 py-2 rounded-lg border"
                            >
                              Cancel
                            </button>
                            {saved && (
                              <span className="text-green-700 inline-flex items-center gap-1 text-sm">
                                <CheckCircle2 className="w-4 h-4" /> Saved
                              </span>
                            )}
                            {error && (
                              <span className="text-red-600 dark:text-red-400 text-sm">
                                {error}
                              </span>
                            )}
                          </div>
                        </div>
                      </form>

                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                        <h2 className="text-xl font-semibold mb-3">Sign out</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          Sign out from this device.
                        </p>
                        <SignOutBtn />
                      </div>
                    </>
                  )}

                  {activeTab === "subscription" && (
                    <SubscriptionPlansComponent role={role} />
                  )}

                  {activeTab === "loyalty" && (
                    <LoyaltyPointsComponent role={role} />
                  )}
                </>
              )}
            </div>
          </div>
        </motion.main>
      </div>
      <MobileBottomNav role={role} />
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
