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
    bg: "from-emerald-400 to-emerald-600",
    light: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    shadow: "shadow-emerald-500/10",
  },
  blue: {
    bg: "from-blue-400 to-indigo-600",
    light: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    shadow: "shadow-blue-500/10",
  },
  purple: {
    bg: "from-purple-400 to-violet-600",
    light: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-400",
    shadow: "shadow-purple-500/10",
  },
  orange: {
    bg: "from-orange-400 to-amber-500",
    light: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-400",
    shadow: "shadow-orange-500/10",
  },
  red: {
    bg: "from-rose-400 to-red-600",
    light: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    shadow: "shadow-rose-500/10",
  },
  cyan: {
    bg: "from-cyan-400 to-teal-500",
    light: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-400",
    shadow: "shadow-cyan-500/10",
  },
  pink: {
    bg: "from-pink-400 to-rose-500",
    light: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-400",
    shadow: "shadow-pink-500/10",
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 p-6 backdrop-blur-sm"
    >
      {/* Animated Background Gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${scheme.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      {/* Floating Orb */}
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 ${scheme.light} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}
      />

      <div className="relative">
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: delay + 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className={`w-12 h-12 rounded-xl ${scheme.light} flex items-center justify-center ${scheme.shadow} group-hover:scale-105 transition-transform duration-300`}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                trend.isPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
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
          className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2 tracking-tight"
        >
          {title}
        </motion.h4>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3 }}
          className={`text-3xl font-semibold ${scheme.text} mb-1 tracking-tight`}
        >
          {value}
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.35 }}
            className="text-xs text-gray-500 dark:text-slate-500"
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
