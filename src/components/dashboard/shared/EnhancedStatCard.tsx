"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: "green" | "blue" | "purple" | "orange" | "red" | "cyan" | "pink";
  delay?: number;
}

const colorSchemes = {
  green: {
    bg: "from-green-500 to-emerald-600",
    light: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    shadow: "shadow-green-500/20",
  },
  blue: {
    bg: "from-blue-500 to-cyan-600",
    light: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    shadow: "shadow-blue-500/20",
  },
  purple: {
    bg: "from-purple-500 to-pink-600",
    light: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    shadow: "shadow-purple-500/20",
  },
  orange: {
    bg: "from-orange-500 to-amber-600",
    light: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    shadow: "shadow-orange-500/20",
  },
  red: {
    bg: "from-red-500 to-rose-600",
    light: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    shadow: "shadow-red-500/20",
  },
  cyan: {
    bg: "from-cyan-500 to-teal-600",
    light: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-600 dark:text-cyan-400",
    shadow: "shadow-cyan-500/20",
  },
  pink: {
    bg: "from-pink-500 to-rose-600",
    light: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
    shadow: "shadow-pink-500/20",
  },
};

export default function EnhancedStatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = "blue",
  delay = 0,
}: EnhancedStatCardProps) {
  const scheme = colorSchemes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 p-6"
    >
      {/* Animated Background Gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${scheme.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* Floating Orb */}
      <div
        className={`absolute -top-4 -right-4 w-24 h-24 ${scheme.light} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}
      />

      <div className="relative">
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            className={`w-14 h-14 rounded-2xl ${scheme.light} flex items-center justify-center ${scheme.shadow} shadow-lg group-hover:scale-110 transition-transform`}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.25 }}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
        >
          {title}
        </motion.h4>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3 }}
          className={`text-3xl font-bold ${scheme.text} mb-1`}
        >
          {value}
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.35 }}
            className="text-xs text-gray-500 dark:text-gray-500"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Progress Bar (optional visual element) */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.4, duration: 0.6 }}
          className="mt-4 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeOut" }}
            className={`h-full bg-linear-to-r ${scheme.bg}`}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
