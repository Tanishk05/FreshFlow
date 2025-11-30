"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, UserPlus } from "lucide-react";

export default function RegisterForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStatus("loading");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <UserPlus className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          Registration successful!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          A verification link has been sent to <b>{email}</b>.<br />
          Please verify your email before signing in.
        </p>
        <div className="mt-4">
          <button
            type="button"
            className="text-sm text-green-700 dark:text-green-400 hover:underline focus:outline-none border border-green-600 rounded px-4 py-2 mt-2"
            onClick={() => {
              if (onSwitchToLogin) {
                alert("Please verify your email before signing in.");
                onSwitchToLogin();
              }
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          id="register-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="register-email"
          className="absolute left-3 -top-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1"
        >
          Email
        </label>
      </div>
      <div className="relative">
        <input
          id="register-password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="register-password"
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
            <Lock className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5 opacity-50" />
          )}
        </button>
      </div>
      <div className="relative">
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          minLength={6}
          className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <label
          htmlFor="register-confirm-password"
          className="absolute left-3 -top-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1"
        >
          Confirm Password
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
        <UserPlus className="w-4 h-4" />
        {status === "loading" ? "Registering..." : "Register"}
      </motion.button>
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
        </span>
        <button
          type="button"
          className="text-sm text-green-700 dark:text-green-400 hover:underline focus:outline-none"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
