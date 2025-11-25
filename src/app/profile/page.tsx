"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";
import SignOutBtn from "@/components/authButtons/SignOutBtn";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const role =
    (session?.user?.role as "farmer" | "retailer" | "distributor") || "farmer";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    image: "",
  });

  const [initialForm, setInitialForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    image: "",
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
          };
          setForm(profileData);
          setInitialForm(profileData);
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

  const isDirty = useMemo(() => {
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.username !== initialForm.username ||
      form.phone !== initialForm.phone ||
      form.image !== initialForm.image
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
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header chip */}
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-linear-to-r from-green-600 to-emerald-500 text-white shadow">
                Profile
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
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
                              setForm((f) => ({ ...f, name: e.target.value }))
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
                              setForm((f) => ({ ...f, email: e.target.value }))
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
                              setForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            placeholder="(+91) 98765 43210"
                          />
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
                            setForm({
                              name: session?.user?.name || "",
                              email: session?.user?.email || "",
                              username: "",
                              phone: "",
                              image: session?.user?.image || "",
                            });
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
            </div>
          </div>
        </motion.main>
      </div>
      <MobileBottomNav role={role} />
    </DashboardLayout>
  );
}
