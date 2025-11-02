"use client";
import React from "react";

export default function SmallStat({
  label,
  value,
  sublabel,
  change,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  change?: { value: string; isPositive: boolean };
}) {
  const changeColor = change?.isPositive ? "text-green-600" : "text-red-600";

  return (
    // Styled to match the target image: white, border, shadow-sm
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
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
