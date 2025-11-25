"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "outline";
  size?: "sm" | "md" | "lg";
  gradient?: "green" | "blue" | "purple" | "cyan" | "orange" | "pink" | "red";
  icon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary:
    "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
  outline:
    "bg-transparent border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 text-gray-700 dark:text-slate-300",
};

const gradientClasses = {
  green:
    "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/20",
  blue: "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/20",
  purple:
    "bg-linear-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-purple-500/20",
  cyan: "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/20",
  orange:
    "bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20",
  pink: "bg-linear-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-pink-500/20",
  red: "bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/20",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export default function ActionButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  gradient,
  icon,
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
}: ActionButtonProps) {
  const baseClasses =
    "rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm";

  const colorClasses = gradient
    ? gradientClasses[gradient]
    : variantClasses[variant];

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseClasses} ${colorClasses} ${sizeClasses[size]} ${widthClass} ${className} flex items-center justify-center gap-2`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
