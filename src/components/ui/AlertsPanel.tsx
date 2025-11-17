"use client";

import React from "react";
import SidePanel from "./SidePanel";
import { AlertTriangle, Bell, AlertCircle, Info } from "lucide-react";
import { Alert } from "@/actions/alertActions";
import Link from "next/link";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
};

// Icon mapping for alert types
const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  reminder: Bell,
};

// Color mapping for alert types
const alertColors = {
  critical:
    "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  reminder:
    "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200",
};

const iconColors = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
  reminder: "text-gray-500 dark:text-gray-400",
};

export default function AlertsPanel({ isOpen, onClose, alerts }: Props) {
  // Group alerts by type
  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const infoAlerts = alerts.filter((a) => a.type === "info");
  const reminderAlerts = alerts.filter((a) => a.type === "reminder");

  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Alerts & Notifications">
      <div className="space-y-6">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No alerts at the moment. All good! ✨
            </p>
          </div>
        )}

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle
                className="text-red-600 dark:text-red-400"
                size={18}
              />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Critical ({criticalAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      alertColors[alert.type]
                    }`}
                  >
                    <Icon
                      className={`${iconColors[alert.type]} shrink-0 mt-1`}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                      {alert.produceId && (
                        <Link
                          href="/my-produce"
                          onClick={onClose}
                          className="inline-block mt-2 text-xs underline hover:no-underline"
                        >
                          View in My Produce →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning Alerts */}
        {warningAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle
                className="text-yellow-600 dark:text-yellow-400"
                size={18}
              />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Warnings ({warningAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {warningAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      alertColors[alert.type]
                    }`}
                  >
                    <Icon
                      className={`${iconColors[alert.type]} shrink-0 mt-1`}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                      {alert.produceId && (
                        <Link
                          href="/my-produce"
                          onClick={onClose}
                          className="inline-block mt-2 text-xs underline hover:no-underline"
                        >
                          View in My Produce →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Alerts */}
        {infoAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-blue-600 dark:text-blue-400" size={18} />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Information ({infoAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {infoAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      alertColors[alert.type]
                    }`}
                  >
                    <Icon
                      className={`${iconColors[alert.type]} shrink-0 mt-1`}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                      {alert.produceId && (
                        <Link
                          href="/my-produce"
                          onClick={onClose}
                          className="inline-block mt-2 text-xs underline hover:no-underline"
                        >
                          View in My Produce →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reminder Alerts */}
        {reminderAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-gray-500 dark:text-gray-400" size={18} />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Reminders ({reminderAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {reminderAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      alertColors[alert.type]
                    }`}
                  >
                    <Icon
                      className={`${iconColors[alert.type]} shrink-0 mt-1`}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                      {alert.produceId && (
                        <Link
                          href="/my-produce"
                          onClick={onClose}
                          className="inline-block mt-2 text-xs underline hover:no-underline"
                        >
                          View in My Produce →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
