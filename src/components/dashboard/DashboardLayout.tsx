"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import NotificationManager from "@/components/notifications/NotificationManager";

// Error boundary for notification manager
class NotificationErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log("NotificationManager error caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null; // Silently fail - notifications are optional
    }

    return this.props.children;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Set the background for the entire app to match the image
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
      <NotificationErrorBoundary>
        <NotificationManager />
      </NotificationErrorBoundary>
    </div>
  );
}
