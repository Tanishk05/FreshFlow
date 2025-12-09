"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { getMyNotifications, markAsRead } from "@/actions/notificationActions";
import { Notification } from "@/models/Notification";

interface Props {
  onClose: () => void;
  onMarkAllRead: () => void;
  onUpdate: () => void;
}

export default function NotificationPanel({
  onClose,
  onMarkAllRead,
  onUpdate,
}: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    let isMounted = true;
    let socketInstance: Awaited<ReturnType<typeof getSocket>> | null = null;

    const initSocket = async () => {
      try {
        socketInstance = await getSocket();
        if (!isMounted) return;

        socketInstance.on(
          "notification-update",
          (update: { type: string; notification: Notification }) => {
            if (!isMounted) return;
            setNotifications((prev) => {
              if (update.type === "add") {
                if (!prev.some((n) => n._id === update.notification._id)) {
                  return [update.notification, ...prev];
                }
                return prev;
              } else if (update.type === "update") {
                return prev.map((n) =>
                  n._id === update.notification._id
                    ? { ...n, ...update.notification }
                    : n
                );
              } else if (update.type === "remove") {
                return prev.filter((n) => n._id !== update.notification._id);
              }
              return prev;
            });
          }
        );
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.off("notification-update");
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id?.toString() === id ? { ...n, read: true } : n))
      );
      onUpdate();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-orange-600 dark:text-orange-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return "⚠️";
      case "warning":
        return "⏰";
      case "info":
        return "ℹ️";
      default:
        return "📋";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8 text-center">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-lg font-medium mb-1">No notifications</p>
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification._id?.toString()}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read && notification._id) {
                      handleMarkAsRead(notification._id.toString());
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">
                      {getTypeIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-medium ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}
