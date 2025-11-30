"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setError("Invalid or missing token");
        setStatus("error");
      });
      return;
    }
    Promise.resolve().then(() => setStatus("verifying"));
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setError(data.error || "Verification failed");
          setStatus("error");
        }
      })
      .catch(() => {
        setError("Verification failed");
        setStatus("error");
      });
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">
          Verifying your email...
        </h2>
      </div>
    );
  }
  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          Email verified!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your account is now active. You can log in.
        </p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          Verification failed
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }
  return null;
}
