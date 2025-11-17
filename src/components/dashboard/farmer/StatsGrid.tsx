import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  totalRevenue: number;
  pendingOrdersCount: number;
  upcomingHarvestsCount: number;
};

export default function StatsGrid({
  totalRevenue,
  pendingOrdersCount,
  upcomingHarvestsCount,
}: Props) {
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: "💰",
      gradient: "from-green-500 to-emerald-500",
      bgGradient:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      trend: "+5%",
    },
    {
      title: "Pending Orders",
      value: pendingOrdersCount,
      icon: "📦",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      trend: null,
    },
    {
      title: "Upcoming Harvests",
      value: upcomingHarvestsCount,
      icon: "🌾",
      gradient: "from-amber-500 to-orange-500",
      bgGradient:
        "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      trend: upcomingHarvestsCount > 0 ? "+10%" : null,
    },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-linear-to-br ${stat.bgGradient} p-6 group hover:shadow-xl transition-all duration-300`}
        >
          {/* Icon Circle */}
          <div
            className={`absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
          ></div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`text-4xl p-3 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg`}
              >
                {stat.icon}
              </div>
              {stat.trend && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full bg-linear-to-r ${stat.gradient} text-white shadow-md`}
                >
                  {stat.trend}
                </span>
              )}
            </div>

            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </h3>
            <p
              className={`text-3xl font-bold bg-linear-to-r ${stat.gradient} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
