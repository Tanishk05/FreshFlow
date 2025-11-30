"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function ForgotPasswordForm({
  onSent,
}: {
  onSent?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("sent");
      onSent?.();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send reset link");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          A password reset link has been sent to <b>{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          id="forgot-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="forgot-email"
          className="absolute left-3 -top-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1"
        >
          Email
        </label>
      </div>
      {error && (
        <p className="text-sm text-center text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-green-400"
      >
        <Mail className="w-4 h-4" />
        {status === "loading" ? "Sending..." : "Send reset link"}
      </motion.button>
    </form>
  );
}
