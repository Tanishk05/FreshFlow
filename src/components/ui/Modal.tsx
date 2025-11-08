"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sprout } from "lucide-react";
import GoogleBtn from "../authButtons/GoogleBtn";
import EmailSignInForm from "../authButtons/EmailBtn";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "signup";
};

export default function Modal({ isOpen, onClose, type }: ModalProps) {
  const [showSignup, setShowSignup] = useState(type === "signup");

  // FIX: Use useEffect to sync the internal state
  // This runs ONLY when the `type` prop changes,
  // allowing the internal toggle button to work freely.
  useEffect(() => {
    setShowSignup(type === "signup");
  }, [type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
          >
            {/* Left Side Graphic */}
            <div className="hidden md:flex flex-col justify-center items-center bg-linear-to-br from-green-500 to-green-700 p-8 text-white text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sprout className="w-24 h-24 text-white/50" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 mt-6">
                {showSignup ? "Create Your Account" : "Welcome Back"}
              </h2>
              <p className="text-green-100">
                {showSignup
                  ? "Join the revolution and start optimizing your fresh food supply chain today."
                  : "AI-powered insights are just a login away. Manage your supply chain with precision."}
              </p>
            </div>

            {/* Right Side Form */}
            <div className="p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-center mb-6 text-green-700 dark:text-green-400">
                {/* Simplified title */}
                Sign in or create account
              </h2>

              {/* --- 1. Your Google Button --- */}
              {/* I removed the 'mt-4' from GoogleBtn and added spacing here */}
              <div className="space-y-4">
                <GoogleBtn />

                {/* --- 2. "Or" Divider --- */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
                  </div>
                  <span className="relative z-10 px-2 bg-white dark:bg-gray-800 text-sm text-gray-500">
                    Or
                  </span>
                </div>

                {/* --- 3. The New Email Form --- */}
                <EmailSignInForm />
              </div>

              {/* You no longer need the "Don't have an account?" toggle,
    since the magic link handles both login and sign-up.
  */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
