"use server";

import { auth } from "@/auth";
import { sendAlertEmail, verifyEmailConfig } from "@/lib/email";
import type { Alert } from "./alertActions";

// Send a test alert email
export async function sendTestAlertEmail(): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, message: "Not authenticated" };
  }

  if (!session.user.email) {
    return { success: false, message: "User email not found" };
  }

  // Create sample test alerts
  const testAlerts: Alert[] = [
    {
      id: "test-1",
      type: "critical",
      category: "expired",
      title: "⚠️ Test Critical Alert",
      message: "This is a test critical alert to verify email notifications.",
      produceName: "Test Product",
      createdAt: new Date(),
      metadata: {
        test: true,
      },
    },
    {
      id: "test-2",
      type: "warning",
      category: "expiring_soon",
      title: "⏰ Test Warning Alert",
      message: "This is a test warning alert to verify email notifications.",
      produceName: "Sample Item",
      createdAt: new Date(),
      metadata: {
        test: true,
      },
    },
  ];

  const sent = await sendAlertEmail(
    session.user.email,
    session.user.name || "User",
    session.user.role || "farmer",
    testAlerts
  );

  if (sent) {
    return {
      success: true,
      message: `Test email sent successfully to ${session.user.email}`,
    };
  } else {
    return {
      success: false,
      message:
        "Failed to send test email. Check your email configuration in .env.local",
    };
  }
}

// Verify email configuration
export async function checkEmailConfig(): Promise<{
  configured: boolean;
  verified: boolean;
  message: string;
}> {
  const session = await auth();

  if (!session?.user) {
    return {
      configured: false,
      verified: false,
      message: "Not authenticated",
    };
  }

  const configured =
    !!process.env.EMAIL_USER &&
    !!process.env.EMAIL_PASSWORD &&
    !!process.env.EMAIL_HOST;

  if (!configured) {
    return {
      configured: false,
      verified: false,
      message:
        "Email not configured. Add EMAIL_USER, EMAIL_PASSWORD, and EMAIL_HOST to .env.local",
    };
  }

  const verified = await verifyEmailConfig();

  if (verified) {
    return {
      configured: true,
      verified: true,
      message: "Email configuration verified successfully",
    };
  } else {
    return {
      configured: true,
      verified: false,
      message:
        "Email configuration found but verification failed. Check your credentials.",
    };
  }
}

// Get email settings info
export async function getEmailSettings(): Promise<{
  configured: boolean;
  host?: string;
  user?: string;
  port?: string;
}> {
  const session = await auth();

  if (!session?.user) {
    return { configured: false };
  }

  return {
    configured:
      !!process.env.EMAIL_USER &&
      !!process.env.EMAIL_PASSWORD &&
      !!process.env.EMAIL_HOST,
    host: process.env.EMAIL_HOST,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
  };
}
