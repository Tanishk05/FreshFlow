"use client";

import { motion } from "framer-motion";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "green" | "blue" | "purple" | "cyan" | "orange" | "pink";
  text?: string;
};

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-12 h-12 border-3",
  lg: "w-16 h-16 border-4",
  xl: "w-24 h-24 border-4",
};

const colorClasses = {
  green: "border-green-500 border-t-transparent",
  blue: "border-blue-500 border-t-transparent",
  purple: "border-purple-500 border-t-transparent",
  cyan: "border-cyan-500 border-t-transparent",
  orange: "border-orange-500 border-t-transparent",
  pink: "border-pink-500 border-t-transparent",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export default function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
