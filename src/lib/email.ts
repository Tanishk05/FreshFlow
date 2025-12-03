import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import type { Alert } from "@/actions/alertActions";

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email configuration for nodemailer (fallback)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password for Gmail
  },
});

// Check if email is configured
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SENDGRID_API_KEY ||
    (process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_HOST)
  );
}

// Email template for alerts
function getAlertEmailHtml(
  userName: string,
  userRole: string,
  alerts: Alert[]
): string {
  const roleColors = {
    farmer: "#10b981", // green
    distributor: "#3b82f6", // blue
    retailer: "#a855f7", // purple
  };

  const roleEmojis = {
    farmer: "🌾",
    distributor: "🚚",
    retailer: "🛒",
  };

  const color = roleColors[userRole as keyof typeof roleColors] || "#6b7280";
  const emoji = roleEmojis[userRole as keyof typeof roleEmojis] || "📊";

  const alertTypeColors = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    reminder: "#6b7280",
  };

  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const infoAlerts = alerts.filter((a) => a.type === "info");

  const alertsHtml = alerts
    .map(
      (alert) => `
    <div style="background: #f9fafb; border-left: 4px solid ${
      alertTypeColors[alert.type]
    }; padding: 16px; margin-bottom: 12px; border-radius: 8px;">
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">${getAlertIcon(alert.type)}</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">
            ${alert.title}
          </h3>
          <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
            ${alert.message}
          </p>
          ${
            alert.produceName
              ? `<p style="margin: 0; color: #6b7280; font-size: 13px;">
              📦 Product: <strong>${alert.produceName}</strong>
            </p>`
              : ""
          }
          <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
            ${new Date(alert.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreshFlow Alerts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${color} 0%, ${adjustColor(
    color,
    -20
  )} 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
        ${emoji} FreshFlow Alerts
      </h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
        ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px;">
        Hello ${userName},
      </h2>
      <p style="margin: 0 0 24px 0; color: #4b5563; line-height: 1.6;">
        You have <strong>${alerts.length}</strong> new alert${
    alerts.length !== 1 ? "s" : ""
  } requiring your attention:
      </p>

      <!-- Alert Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
        ${
          criticalAlerts.length > 0
            ? `
        <div style="background: #fee2e2; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">⚠️</div>
          <div style="font-size: 24px; font-weight: bold; color: #991b1b;">${criticalAlerts.length}</div>
          <div style="font-size: 12px; color: #7f1d1d; text-transform: uppercase;">Critical</div>
        </div>
        `
            : ""
        }
        ${
          warningAlerts.length > 0
            ? `
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">⏰</div>
          <div style="font-size: 24px; font-weight: bold; color: #92400e;">${warningAlerts.length}</div>
          <div style="font-size: 12px; color: #78350f; text-transform: uppercase;">Warning</div>
        </div>
        `
            : ""
        }
        ${
          infoAlerts.length > 0
            ? `
        <div style="background: #dbeafe; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">ℹ️</div>
          <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${infoAlerts.length}</div>
          <div style="font-size: 12px; color: #1e3a8a; text-transform: uppercase;">Info</div>
        </div>
        `
            : ""
        }
      </div>

      <!-- Alerts List -->
      <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
        Alert Details
      </h3>
      ${alertsHtml}

      <!-- CTA Button -->
      <div style="margin-top: 32px; text-align: center;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/${userRole}" 
           style="display: inline-block; background: ${color}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          View Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
        This is an automated alert from FreshFlow
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} FreshFlow. AI-powered supply chain management.
      </p>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/settings" style="color: ${color}; text-decoration: none;">
          Manage notification preferences
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getAlertIcon(type: string): string {
  switch (type) {
    case "critical":
      return "⚠️";
    case "warning":
      return "⏰";
    case "info":
      return "ℹ️";
    case "reminder":
      return "🔔";
    default:
      return "📢";
  }
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// Plain text version of the email
function getAlertEmailText(
  userName: string,
  userRole: string,
  alerts: Alert[]
): string {
  const alertsList = alerts
    .map((alert) => {
      return `
${getAlertIcon(alert.type)} ${alert.type.toUpperCase()}: ${alert.title}
${alert.message}
${alert.produceName ? `Product: ${alert.produceName}` : ""}
Time: ${new Date(alert.createdAt).toLocaleString()}
---
`;
    })
    .join("\n");

  return `
FreshFlow Alert Notification

Hello ${userName},

You have ${alerts.length} new alert${
    alerts.length !== 1 ? "s" : ""
  } requiring your attention:

${alertsList}

View your dashboard: ${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/dashboard/${userRole}

---
This is an automated alert from FreshFlow.
© ${new Date().getFullYear()} FreshFlow. AI-powered supply chain management.
  `;
}

// Generic send email function
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn("[Email] Email not configured, skipping send");
      return;
    }

    await transporter.sendMail({
      from: `"FreshFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    // Don't throw - email failures shouldn't break the flow
  }
}

// Send alert email
export async function sendAlertEmail(
  userEmail: string,
  userName: string,
  userRole: string,
  alerts: Alert[]
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(
      "⚠️ Email service not configured. Add EMAIL_USER, EMAIL_PASSWORD, and EMAIL_HOST to .env.local"
    );
    return false;
  }

  if (!userEmail) {
    console.warn("⚠️ User email not provided, skipping email notification");
    return false;
  }

  if (alerts.length === 0) {
    console.log("📧 No alerts to send");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"FreshFlow Alerts" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🔔 ${alerts.length} New Alert${
        alerts.length !== 1 ? "s" : ""
      } - FreshFlow`,
      text: getAlertEmailText(userName, userRole, alerts),
      html: getAlertEmailHtml(userName, userRole, alerts),
    });

    console.log(`✅ Alert email sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending alert email:", error);
    return false;
  }
}

// Send bulk alert emails
export async function sendBulkAlertEmails(
  recipients: Array<{
    email: string;
    name: string;
    role: string;
    alerts: Alert[];
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const sent = await sendAlertEmail(
      recipient.email,
      recipient.name,
      recipient.role,
      recipient.alerts
    );

    if (sent) {
      success++;
    } else {
      failed++;
    }

    // Add a small delay to avoid overwhelming the email server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `📧 Bulk email complete: ${success} sent, ${failed} failed out of ${recipients.length} total`
  );

  return { success, failed };
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email configuration verification failed:", error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  if (!isEmailConfigured()) {
    throw new Error("Email is not configured");
  }
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your FreshFlow password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password. This link will expire in 30 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#10b981;color:white;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
}

// Send account verification email
export async function sendVerificationEmail(email: string, token: string) {
  if (!isEmailConfigured()) {
    console.error(
      "Email not configured - missing SENDGRID_API_KEY or EMAIL credentials"
    );
    throw new Error("Email is not configured");
  }

  const verifyUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  const emailHtml = `
    <h2>Verify your email address</h2>
    <p>Click the link below to verify your email and activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#10b981;color:white;border-radius:5px;text-decoration:none;">Verify Email</a>
    <p>If you did not register, you can ignore this email.</p>
  `;

  try {
    // Try SendGrid Web API first (more reliable)
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM || "tanishkshrivastava6@gmail.com",
        subject: "Verify your FreshFlow account",
        html: emailHtml,
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
          openTracking: {
            enable: false,
          },
        },
      };

      const response = await sgMail.send(msg);
      console.log(
        "Verification email sent via SendGrid Web API:",
        response[0].statusCode
      );
      return response;
    }

    // Fallback to SMTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your FreshFlow account",
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent via SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}
