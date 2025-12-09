"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  deleteUser,
  verifyUserEmail,
  toggleUserBan,
  toggleUserAdmin,
  isAdmin,
} from "@/actions/adminActions";
import type { User } from "@/models/User";

// Helper to get user ID as string
// After serialization in server actions, _id is always a string, but TypeScript doesn't know that
const getUserId = (user: User): string => {
  return typeof user._id === 'string' ? user._id : String(user._id);
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    farmers: number;
    distributors: number;
    retailers: number;
    verified: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await isAdmin();
      if (!hasAccess) {
        router.push("/dashboard");
      }
    };
    checkAccess();
  }, [router]);

  // Load users and stats
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(page, 20, search, roleFilter),
        getUserStats(),
      ]);

      setUsers(usersData.users);
      setTotalPages(usersData.pages);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const result = await updateUserRole(
        userId,
        newRole as "farmer" | "distributor" | "retailer"
      );
      if (result.success) {
        loadData();
        setSelectedUser(null);
      }
      alert(result.message);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setActionLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        loadData();
        setSelectedUser(null);
      }
      alert(result.message);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    setActionLoading(true);
    try {
      const result = await verifyUserEmail(userId);
      if (result.success) {
        loadData();
      }
      alert(result.message);
    } catch (error) {
      console.error("Error verifying email:", error);
      alert("Failed to verify email");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, banned: boolean) => {
    setActionLoading(true);
    try {
      const result = await toggleUserBan(userId, banned);
      if (result.success) {
        loadData();
      }
      alert(result.message);
    } catch (error) {
      console.error("Error toggling ban:", error);
      alert("Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setActionLoading(true);
    try {
      const result = await toggleUserAdmin(userId, makeAdmin);
      if (result.success) {
        loadData();
        setSelectedUser(null);
      }
      alert(result.message);
    } catch (error) {
      console.error("Error toggling admin:", error);
      alert("Failed to update admin status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            👥 User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Total Users"
              value={stats.total}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Farmers"
              value={stats.farmers}
              icon="🌾"
              color="green"
            />
            <StatCard
              title="Distributors"
              value={stats.distributors}
              icon="🚚"
              color="cyan"
            />
            <StatCard
              title="Retailers"
              value={stats.retailers}
              icon="🛒"
              color="purple"
            />
            <StatCard
              title="Verified"
              value={stats.verified}
              icon="✓"
              color="emerald"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="distributor">Distributors</option>
              <option value="retailer">Retailers</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">
                          Loading users...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={getUserId(user)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold relative">
                            {user.name?.[0]?.toUpperCase() || "U"}
                            {user.isAdmin && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                                👑
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name || "Unnamed User"}
                              </div>
                              {user.isAdmin && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.username || "No username"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "farmer"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : user.role === "distributor"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {user.role || "No role"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.emailVerified ? (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <span className="mr-1">✓</span> Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="mr-1">○</span> Unverified
                            </span>
                          )}
                          {user.banned && (
                            <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                              <span className="mr-1">🚫</span> Banned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <UserManagementModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateRole={handleUpdateRole}
          onVerifyEmail={handleVerifyEmail}
          onToggleBan={handleToggleBan}
          onToggleAdmin={handleToggleAdmin}
          onDelete={handleDeleteUser}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    emerald: "from-emerald-500 to-teal-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div
          className={`px-3 py-1 rounded-lg bg-linear-to-r ${
            colorClasses[color as keyof typeof colorClasses]
          } bg-opacity-10`}
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
    </motion.div>
  );
}

// User Management Modal Component
function UserManagementModal({
  user,
  onClose,
  onUpdateRole,
  onVerifyEmail,
  onToggleBan,
  onToggleAdmin,
  onDelete,
  loading,
}: {
  user: User;
  onClose: () => void;
  onUpdateRole: (userId: string, role: string) => void;
  onVerifyEmail: (userId: string) => void;
  onToggleBan: (userId: string, banned: boolean) => void;
  onToggleAdmin: (userId: string, makeAdmin: boolean) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
}) {
  const [newRole, setNewRole] = useState<"farmer" | "distributor" | "retailer">(
    (user.role as "farmer" | "distributor" | "retailer") || "farmer"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manage User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold relative">
              {user.name?.[0]?.toUpperCase() || "U"}
              {user.isAdmin && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                  👑
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user.name || "Unnamed User"}
                </h3>
                {user.isAdmin && (
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Username:
              </span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {user.username || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {user.phone || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Change Role */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Change Role
          </label>
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) =>
                setNewRole(
                  e.target.value as "farmer" | "distributor" | "retailer"
                )
              }
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={loading}
            >
              <option value="farmer">Farmer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
            <button
              onClick={() => onUpdateRole(getUserId(user), newRole)}
              disabled={loading || newRole === user.role}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              Update
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Toggle Admin Status */}
          <button
            onClick={() => onToggleAdmin(getUserId(user), !user.isAdmin)}
            disabled={loading}
            className={`w-full px-4 py-2 ${
              user.isAdmin
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-purple-600 hover:bg-purple-700"
            } disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2`}
          >
            <span>{user.isAdmin ? "👑" : "⭐"}</span>
            <span>{user.isAdmin ? "Remove Admin" : "Make Admin"}</span>
          </button>

          {!user.emailVerified && (
            <button
              onClick={() => onVerifyEmail(getUserId(user))}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              ✓ Verify Email
            </button>
          )}

          {user.banned ? (
            <button
              onClick={() => onToggleBan(getUserId(user), false)}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              ✓ Unban User
            </button>
          ) : (
            <button
              onClick={() => onToggleBan(getUserId(user), true)}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              🚫 Ban User
            </button>
          )}

          <button
            onClick={() => onDelete(getUserId(user))}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
          >
            🗑️ Delete User
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
