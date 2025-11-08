"use client";
import React from "react";

export default function SmallStat({
  label,
  value,
  sublabel,
  change,
  icon, // <-- 2. Destructure the new prop
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  change?: { value: string; isPositive: boolean };
  icon?: React.ReactNode; // <-- 1. Add the new 'icon' prop (optional)
}) {
  const changeColor = change?.isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* 3. Render the icon in a flex container, opposite the label */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {icon && (
          <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        )}
      </div>

      <div className="flex items-end gap-2 mt-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <span className={`text-sm font-medium ${changeColor}`}>
            {change.value}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
}
