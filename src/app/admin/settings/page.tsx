"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/actions/adminActions";
import {
  getSystemSettings,
  updateSystemSettings,
  toggleAIFeature,
  toggleEmailNotifications,
  toggleMaintenanceMode,
  SystemSettings,
} from "@/actions/settingsActions";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check admin access
    isAdmin().then((admin) => {
      if (!admin) {
        router.push("/dashboard/farmer");
      }
    });

    // Load settings
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAI = async (
    feature:
      | "dynamicPricing"
      | "marketIntelligence"
      | "personalizedInsights"
      | "demandForecasting",
    enabled: boolean
  ) => {
    setSaving(true);
    try {
      await toggleAIFeature(feature, enabled);
      await loadSettings();
    } catch (error) {
      console.error("Error toggling AI feature:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmail = async (
    type: "criticalAlerts" | "warningAlerts" | "infoAlerts",
    enabled: boolean
  ) => {
    setSaving(true);
    try {
      await toggleEmailNotifications(type, enabled);
      await loadSettings();
    } catch (error) {
      console.error("Error toggling email notification:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async (enabled: boolean) => {
    setSaving(true);
    try {
      await toggleMaintenanceMode(
        enabled,
        settings?.maintenance.message || "System under maintenance"
      );
      await loadSettings();
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLimits = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSystemSettings({
        apiLimits: settings.apiLimits,
      });
      await loadSettings();
    } catch (error) {
      console.error("Error updating limits:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async (
    feature:
      | "userRegistration"
      | "publicMarketplace"
      | "orderTracking"
      | "inventoryManagement",
    enabled: boolean
  ) => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSystemSettings({
        features: {
          ...settings.features,
          [feature]: enabled,
        },
      });
      await loadSettings();
    } catch (error) {
      console.error("Error toggling feature:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
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
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage AI features, email notifications, and system configuration
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Features */}
          <SettingsCard title="AI Features" icon="🤖">
            <div className="space-y-4">
              <ToggleSwitch
                label="AI Features Enabled"
                description="Master switch for all AI features"
                checked={settings.aiFeatures.enabled}
                onChange={(checked) =>
                  updateSystemSettings({
                    aiFeatures: { ...settings.aiFeatures, enabled: checked },
                  }).then(loadSettings)
                }
                disabled={saving}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <ToggleSwitch
                  label="Dynamic Pricing"
                  description="AI-powered price suggestions based on demand"
                  checked={settings.aiFeatures.dynamicPricing}
                  onChange={(checked) =>
                    handleToggleAI("dynamicPricing", checked)
                  }
                  disabled={saving || !settings.aiFeatures.enabled}
                />
              </div>
              <ToggleSwitch
                label="Market Intelligence"
                description="Real-time market insights and trends"
                checked={settings.aiFeatures.marketIntelligence}
                onChange={(checked) =>
                  handleToggleAI("marketIntelligence", checked)
                }
                disabled={saving || !settings.aiFeatures.enabled}
              />
              <ToggleSwitch
                label="Personalized Insights"
                description="Tailored recommendations for users"
                checked={settings.aiFeatures.personalizedInsights}
                onChange={(checked) =>
                  handleToggleAI("personalizedInsights", checked)
                }
                disabled={saving || !settings.aiFeatures.enabled}
              />
              <ToggleSwitch
                label="Demand Forecasting"
                description="Predict future demand patterns"
                checked={settings.aiFeatures.demandForecasting}
                onChange={(checked) =>
                  handleToggleAI("demandForecasting", checked)
                }
                disabled={saving || !settings.aiFeatures.enabled}
              />
            </div>
          </SettingsCard>

          {/* Email Notifications */}
          <SettingsCard title="Email Notifications" icon="📧">
            <div className="space-y-4">
              <ToggleSwitch
                label="Email Notifications Enabled"
                description="Master switch for all email alerts"
                checked={settings.emailNotifications.enabled}
                onChange={(checked) =>
                  updateSystemSettings({
                    emailNotifications: {
                      ...settings.emailNotifications,
                      enabled: checked,
                    },
                  }).then(loadSettings)
                }
                disabled={saving}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <ToggleSwitch
                  label="Critical Alerts"
                  description="System failures and urgent issues"
                  checked={settings.emailNotifications.criticalAlerts}
                  onChange={(checked) =>
                    handleToggleEmail("criticalAlerts", checked)
                  }
                  disabled={saving || !settings.emailNotifications.enabled}
                />
              </div>
              <ToggleSwitch
                label="Warning Alerts"
                description="Important but non-critical issues"
                checked={settings.emailNotifications.warningAlerts}
                onChange={(checked) =>
                  handleToggleEmail("warningAlerts", checked)
                }
                disabled={saving || !settings.emailNotifications.enabled}
              />
              <ToggleSwitch
                label="Info Alerts"
                description="General information and updates"
                checked={settings.emailNotifications.infoAlerts}
                onChange={(checked) => handleToggleEmail("infoAlerts", checked)}
                disabled={saving || !settings.emailNotifications.enabled}
              />
            </div>
          </SettingsCard>

          {/* Platform Features */}
          <SettingsCard title="Platform Features" icon="⚙️">
            <div className="space-y-4">
              <ToggleSwitch
                label="User Registration"
                description="Allow new users to sign up"
                checked={settings.features.userRegistration}
                onChange={(checked) =>
                  handleToggleFeature("userRegistration", checked)
                }
                disabled={saving}
              />
              <ToggleSwitch
                label="Public Marketplace"
                description="Enable marketplace for all users"
                checked={settings.features.publicMarketplace}
                onChange={(checked) =>
                  handleToggleFeature("publicMarketplace", checked)
                }
                disabled={saving}
              />
              <ToggleSwitch
                label="Order Tracking"
                description="Real-time order tracking system"
                checked={settings.features.orderTracking}
                onChange={(checked) =>
                  handleToggleFeature("orderTracking", checked)
                }
                disabled={saving}
              />
              <ToggleSwitch
                label="Inventory Management"
                description="Advanced inventory features"
                checked={settings.features.inventoryManagement}
                onChange={(checked) =>
                  handleToggleFeature("inventoryManagement", checked)
                }
                disabled={saving}
              />
            </div>
          </SettingsCard>

          {/* API Limits */}
          <SettingsCard title="API Limits" icon="🔒">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini Daily Limit
                </label>
                <input
                  type="number"
                  value={settings.apiLimits.geminiDailyLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiLimits: {
                        ...settings.apiLimits,
                        geminiDailyLimit: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini Rate Limit (requests/min)
                </label>
                <input
                  type="number"
                  value={settings.apiLimits.geminiRateLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiLimits: {
                        ...settings.apiLimits,
                        geminiRateLimit: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Daily Limit
                </label>
                <input
                  type="number"
                  value={settings.apiLimits.emailDailyLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiLimits: {
                        ...settings.apiLimits,
                        emailDailyLimit: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={saving}
                />
              </div>
              <button
                onClick={handleUpdateLimits}
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Limits"}
              </button>
            </div>
          </SettingsCard>

          {/* Maintenance Mode */}
          <SettingsCard
            title="Maintenance Mode"
            icon="🔧"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <ToggleSwitch
                label="Maintenance Mode"
                description="Put the system in maintenance mode (only admins can access)"
                checked={settings.maintenance.enabled}
                onChange={handleToggleMaintenance}
                disabled={saving}
              />
              {settings.maintenance.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenance.message}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenance: {
                          ...settings.maintenance,
                          message: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={saving}
                  />
                  <button
                    onClick={() =>
                      updateSystemSettings({
                        maintenance: settings.maintenance,
                      }).then(loadSettings)
                    }
                    disabled={saving}
                    className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Update Message"}
                  </button>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center mb-6">
        <span className="text-3xl mr-3">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
