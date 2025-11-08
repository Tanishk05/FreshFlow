"use client";
import React from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2"; // You'd need to install react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Mock data for the chart
const data = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "AI Demand Forecast",
      data: [120, 130, 110, 150, 180, 250, 230], // AI prediction
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.5)",
      tension: 0.4,
      borderDash: [5, 5], // Dashed line for forecast
    },
    {
      label: "Actual Sales (Last Week)",
      data: [110, 125, 115, 140, 190, 240, 220], // Historical data
      borderColor: "rgb(107, 114, 128)",
      backgroundColor: "rgba(107, 114, 128, 0.5)",
      tension: 0.4,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
};

export default function ConsumerDemandForecast() {
  return (
    <motion.section
      variants={itemVariants}
      className="p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Consumer Demand Forecast
      </h3>
      <div className="w-full h-72 mt-2">
        <Line options={options} data={data} />
      </div>
    </motion.section>
  );
}
