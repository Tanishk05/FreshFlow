"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModernCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: "green" | "blue" | "purple" | "orange" | "pink" | "cyan";
  className?: string;
  headerAction?: ReactNode;
  glassEffect?: boolean;
  hoverEffect?: boolean;
}

const gradients = {
  green: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
  blue: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
  purple: "from-purple-500/20 via-pink-500/10 to-rose-500/20",
  orange: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
  pink: "from-pink-500/20 via-rose-500/10 to-red-500/20",
  cyan: "from-cyan-500/20 via-teal-500/10 to-emerald-500/20",
};

export default function ModernCard({
  children,
  title,
  subtitle,
  icon,
  gradient = "blue",
  className = "",
  headerAction,
  glassEffect = true,
  hoverEffect = true,
}: ModernCardProps) {
  // Simple clean card style (like Order Tracking)
  if (!glassEffect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={hoverEffect ? { y: -4 } : {}}
        className={`p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${className}`}
      >
        {/* Header */}
        {(title || icon || headerAction) && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {icon && (
                <div className="flex items-center justify-center">{icon}</div>
              )}
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        )}

        {/* Body */}
        <div>{children}</div>
      </motion.div>
    );
  }

  // Glass effect style (original)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : {}}
      className={`relative rounded-3xl overflow-hidden ${
        glassEffect
          ? "backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      } shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradients[gradient]} pointer-events-none`}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        {(title || icon || headerAction) && (
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              {icon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 rounded-2xl bg-linear-to-br from-white/80 to-white/40 dark:from-gray-700/80 dark:to-gray-700/40 flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  {icon}
                </motion.div>
              )}
              <div className="flex-1">
                {title && (
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        )}

        {/* Body */}
        <div>{children}</div>
      </div>
    </motion.div>
  );
}
