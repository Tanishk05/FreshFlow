"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  sendTestAlertEmail,
  checkEmailConfig,
  getEmailSettings,
} from "@/actions/emailActions";

export default function EmailSettingsCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailConfig, setEmailConfig] = useState<{
    configured: boolean;
    verified?: boolean;
    host?: string;
    user?: string;
  } | null>(null);

  const handleCheckConfig = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [configResult, settingsResult] = await Promise.all([
        checkEmailConfig(),
        getEmailSettings(),
      ]);

      setEmailConfig({
        configured: configResult.configured,
        verified: configResult.verified,
        host: settingsResult.host,
        user: settingsResult.user,
      });

      setMessage(configResult.message);
    } catch (error) {
      setMessage("Error checking email configuration");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await sendTestAlertEmail();
      setMessage(result.message);
    } catch (error) {
      setMessage("Error sending test email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
            📧
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Email Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure and test alert email delivery
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Configuration Status */}
        {emailConfig && (
          <div
            className={`p-4 rounded-xl border ${
              emailConfig.configured && emailConfig.verified
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : emailConfig.configured
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {emailConfig.configured && emailConfig.verified
                  ? "✅"
                  : emailConfig.configured
                  ? "⚠️"
                  : "❌"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {emailConfig.configured && emailConfig.verified
                    ? "Email Configured & Verified"
                    : emailConfig.configured
                    ? "Email Configured (Not Verified)"
                    : "Email Not Configured"}
                </h3>
                {emailConfig.host && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Host: {emailConfig.host}
                  </p>
                )}
                {emailConfig.user && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    User: {emailConfig.user}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {!emailConfig?.configured && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span>ℹ️</span> Setup Instructions
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4 list-decimal">
              <li>
                Add the following to your <code>.env.local</code> file:
              </li>
            </ol>
            <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
              {`EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password`}
            </pre>
            <p className="mt-3 text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> For Gmail, use an{" "}
              <a
                href="https://support.google.com/accounts/answer/185833"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                App Password
              </a>{" "}
              instead of your regular password.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckConfig}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </>
            ) : (
              <>
                <span>🔍</span>
                Check Configuration
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendTest}
            disabled={loading || !emailConfig?.configured}
            className="flex-1 px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <span>📨</span>
                Send Test Email
              </>
            )}
          </motion.button>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${
              message.includes("success") || message.includes("verified")
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </motion.div>
        )}

        {/* Features List */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Email Alert Features:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Instant notifications for critical and warning alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Beautiful HTML emails with color-coded alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Alert summary with counts and categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Direct links to your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Role-specific branding (Farmer/Distributor/Retailer)</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
