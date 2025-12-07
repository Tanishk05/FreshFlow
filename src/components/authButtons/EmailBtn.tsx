"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";

export default function EmailSignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      // 'nodemailer' is the id we gave the provider in auth.ts
      const res = await signIn("nodemailer", {
        email,
        redirect: false, // Don't redirect the user, stay in the modal
      });

      if (res?.ok) {
        setStatus("success");
      } else {
        setError(res?.error || "An unknown error occurred.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Failed to send email.");
      setStatus("idle");
    }
  };

  // If successful, show a "check your email" message
  if (status === "success") {
    return (
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          A magic link has been sent to **{email}**.
        </p>
      </div>
    );
  }

  // Otherwise, show the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          disabled={status === "loading"}
          // Styles copied from your Modal.tsx for consistency
          className="peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="email"
          // Floating label styles from your Modal.tsx
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
        // Styles copied from your Modal.tsx's primary button
        className="w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-green-400"
      >
        <Mail className="w-4 h-4" />
        {status === "loading" ? "Sending..." : "Continue with Email"}
      </motion.button> 
    </form>
  );
}
