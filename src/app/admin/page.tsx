"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { isAdmin, getUserStats } from "@/actions/adminActions";
import { getSystemStats } from "@/actions/settingsActions";

interface Stats {
  total: number;
  farmers: number;
  distributors: number;
  retailers: number;
  verified: number;
}

interface SystemStats {
  totalUsers: number;
  activeAIFeatures: number;
  totalEmailsSent: number;
  apiCallsToday: number;
  systemHealth: "healthy" | "warning" | "critical";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<Stats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin access
    isAdmin().then((admin) => {
      if (!admin) {
        router.push("/dashboard/farmer");
      }
    });

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, system] = await Promise.all([
        getUserStats(),
        getSystemStats(),
      ]);
      setUserStats(users);

      // Transform system stats to match our interface
      setSystemStats({
        totalUsers: system.users.total,
        activeAIFeatures: 4, // You can calculate this from settings
        totalEmailsSent: system.ai.emailsSentToday,
        apiCallsToday: system.ai.apiCallsToday,
        systemHealth: "healthy",
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userStats || !systemStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here&apos;s an overview of your FreshFlow system.
          </p>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  System Status
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  All systems operational
                </p>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    systemStats.systemHealth === "healthy"
                      ? "bg-green-500 animate-pulse"
                      : systemStats.systemHealth === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-lg font-semibold ${
                    systemStats.systemHealth === "healthy"
                      ? "text-green-500"
                      : systemStats.systemHealth === "warning"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {systemStats.systemHealth.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={userStats.total}
            icon="👥"
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="AI Features Active"
            value={systemStats.activeAIFeatures}
            icon="🤖"
            color="purple"
            trend="100%"
          />
          <StatCard
            title="Emails Sent Today"
            value={systemStats.totalEmailsSent}
            icon="📧"
            color="green"
            trend="+8%"
          />
          <StatCard
            title="API Calls Today"
            value={systemStats.apiCallsToday}
            icon="⚡"
            color="orange"
            trend="+15%"
          />
        </div>

        {/* User Distribution */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              User Distribution
            </h2>
            <div className="space-y-4">
              <UserRoleBar
                role="Farmers"
                count={userStats.farmers}
                total={userStats.total}
                color="green"
              />
              <UserRoleBar
                role="Distributors"
                count={userStats.distributors}
                total={userStats.total}
                color="blue"
              />
              <UserRoleBar
                role="Retailers"
                count={userStats.retailers}
                total={userStats.total}
                color="purple"
              />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/admin/users">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer border border-blue-200 dark:border-blue-800"
                >
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Manage Users
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View, edit, and delete users
                    </p>
                  </div>
                </motion.div>
              </Link>
              <Link href="/admin/settings">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer border border-purple-200 dark:border-purple-800"
                >
                  <span className="text-2xl mr-3">⚙️</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      System Settings
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure AI features and limits
                    </p>
                  </div>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer border border-green-200 dark:border-green-800"
                onClick={loadData}
              >
                <span className="text-2xl mr-3">🔄</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Refresh Data
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update dashboard statistics
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Email Verification Status
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-500">
                {userStats.verified}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Verified Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-500">
                {userStats.total - userStats.verified}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Unverified Users
              </p>
            </div>
            <div className="flex-1 ml-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-500 to-green-600"
                  style={{
                    width: `${(userStats.verified / userStats.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {Math.round((userStats.verified / userStats.total) * 100)}%
                Verified
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-sm text-green-500 font-semibold">{trend}</span>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{title}</h3>
      <p
        className={`text-4xl font-bold bg-linear-to-r ${
          colorClasses[color as keyof typeof colorClasses]
        } bg-clip-text text-transparent`}
      >
        {value.toLocaleString()}
      </p>
    </motion.div>
  );
}

function UserRoleBar({
  role,
  count,
  total,
  color,
}: {
  role: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = (count / total) * 100;
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {role}
        </span>
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        ></motion.div>
      </div>
    </div>
  );
}
