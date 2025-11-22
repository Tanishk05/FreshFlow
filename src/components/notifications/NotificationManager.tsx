"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToPush } from "@/actions/notificationActions";

export default function NotificationManager() {
  const [mounted, setMounted] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  // Check if push notifications should be enabled (feature flag)
  const pushEnabled =
    process.env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== "false";

  // Handle mounting and browser-specific initialization
  useEffect(() => {
    // Using queueMicrotask to defer state updates and avoid React Compiler warning
    queueMicrotask(() => {
      // Skip if push notifications are disabled
      if (!pushEnabled) {
        console.log("Push notifications are disabled via feature flag");
        setMounted(true);
        return;
      }

      setMounted(true);

      // Check browser support for notifications and service workers
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
      ) {
        setIsSupported(true);
        setPermission(Notification.permission);
      } else {
        console.log("Browser does not support push notifications");
      }
    });
  }, [pushEnabled]);

  const registerServiceWorkerAndSubscribe = useCallback(async () => {
    try {
      // Check if push notifications are supported
      if (!("PushManager" in window)) {
        console.log("Push notifications are not supported in this browser");
        return;
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.log(
          "VAPID public key not configured - skipping push notifications"
        );
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed to push notifications");
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      // Send subscription to server
      const result = await subscribeToPush(subscription.toJSON());
      if (result.success) {
        console.log("Successfully subscribed to push notifications");
      } else {
        console.error("Failed to subscribe:", result.error);
      }
    } catch (error) {
      // Handle specific error types
      if (error instanceof DOMException) {
        if (error.name === "AbortError") {
          console.log(
            "Push notification registration aborted - service may not be available"
          );
        } else if (error.name === "NotAllowedError") {
          console.log("Push notification permission denied");
        } else {
          console.log(
            `Push notification error (${error.name}): ${error.message}`
          );
        }
      } else {
        console.log("Error in notification setup:", error);
      }
      // Don't throw - just log and continue
    }
  }, []);

  useEffect(() => {
    if (permission === "granted") {
      registerServiceWorkerAndSubscribe();
    }
  }, [permission, registerServiceWorkerAndSubscribe]);

  const requestPermission = async () => {
    if (!isSupported) {
      alert("Your browser doesn't support notifications");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await registerServiceWorkerAndSubscribe();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Don't render anything if already granted or not supported
  if (permission === "granted" || !isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <svg
            className="w-6 h-6 text-blue-500"
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
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Enable Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Get instant alerts about critical updates, expiring produce, and
            pending orders.
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={() => setPermission("denied")}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
}
