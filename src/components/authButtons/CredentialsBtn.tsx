"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function CredentialsBtn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Check email verification status first
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists && !checkData.verified) {
        setStatus("error");
        setError(
          "Please verify your email before signing in. Check your inbox for the verification link."
        );
        return;
      }
    } catch (err) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      // Fetch session to check if user has completed signup
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setStatus("idle");
      if (session?.user && !session.user.role) {
        window.location.href = "/complete-signup";
      } else {
        // Optionally close modal or redirect to dashboard
        window.location.href = "/dashboard";
      }
    } else {
      setStatus("error");
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          id="cred-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="cred-email"
          className="absolute left-3 -top-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1"
        >
          Email
        </label>
      </div>
      <div className="relative">
        <input
          id="cred-password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="cred-password"
          className="absolute left-3 -top-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1"
        >
          Password
        </label>
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 p-1"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="text-right mt-1">
        <button
          type="button"
          className="text-sm text-green-700 dark:text-green-400 hover:underline focus:outline-none"
          onClick={() => alert("Password reset flow coming soon!")}
        >
          Forgot password?
        </button>
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
        <Lock className="w-4 h-4" />
        {status === "loading" ? "Signing in..." : "Continue with Password"}
      </motion.button>
    </form>
  );
}
