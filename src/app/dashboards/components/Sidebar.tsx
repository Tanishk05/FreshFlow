"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  BarChartHorizontal,
  Package,
  AlertCircle,
  Settings,
  Sprout,
  ChevronLeft,
  ClipboardList,
  Ship, // <-- New Icon
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboards/farmer",
    icon: <LayoutGrid size={20} />,
  },
  {
    name: "Demand Forecasts",
    href: "#analytics",
    icon: <BarChartHorizontal size={20} />,
  },
  { name: "Harvests", href: "#manage", icon: <Package size={20} /> },
  { name: "Orders", href: "#orders", icon: <ClipboardList size={20} /> },
  { name: "Shipments", href: "#shipments", icon: <Ship size={20} /> }, // <-- New Link
  { name: "Reports", href: "#", icon: <AlertCircle size={20} /> },
  { name: "Alerts", href: "#", icon: <Settings size={20} /> },
];

type SidebarProps = {
  role: "farmer" | "retailer" | "distributor";
  isShrunk: boolean;
  setIsShrunk: (isShrunk: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
};

// ... (SidebarContent function is unchanged)
function SidebarContent({
  role,
  isShrunk,
}: Omit<SidebarProps, "isMobileOpen" | "setIsMobileOpen" | "setIsShrunk">) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-2 pb-6 mb-6 border-b border-gray-200 dark:border-gray-700 ${
          isShrunk ? "justify-center" : ""
        }`}
      >
        <Sprout className="text-green-600 shrink-0" size={28} />
        <motion.h1
          animate={{ opacity: isShrunk ? 0 : 1, width: isShrunk ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap"
        >
          Farm Planner
        </motion.h1>
      </div>

      {/* Nav Links - flex-1 pushes profile to bottom */}
      <nav className="flex-1">
        <Tooltip.Provider delayDuration={0}>
          <ul className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                          isShrunk ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="shrink-0">{link.icon}</div>
                        <motion.span
                          animate={{
                            opacity: isShrunk ? 0 : 1,
                            width: isShrunk ? 0 : "auto",
                          }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {link.name}
                        </motion.span>
                      </Link>
                    </Tooltip.Trigger>
                    {isShrunk && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          className="z-50 ml-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg dark:bg-gray-700"
                        >
                          {link.name}
                          <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                </li>
              );
            })}
          </ul>
        </Tooltip.Provider>
      </nav>

      {/* User Profile Footer (stays at bottom) */}
      <div
        className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 ${
          isShrunk ? "justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            isShrunk ? "justify-center" : ""
          }`}
        >
          <Image
            src="https://avatar.vercel.sh/riya-patel.png"
            alt="Riya Patel"
            className="w-10 h-10 rounded-full shrink-0"
            width={40}
            height={40}
          />
          <motion.div
            animate={{
              opacity: isShrunk ? 0 : 1,
              width: isShrunk ? 0 : "auto",
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              Riya Patel
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap">
              {role}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ... (Main Sidebar export function is unchanged)
export default function Sidebar(props: SidebarProps) {
  const { isMobileOpen, setIsMobileOpen, isShrunk, setIsShrunk } = props;

  return (
    <>
      {/* --- Mobile Backdrop --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- Mobile Sidebar --- */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? "0%" : "-100%" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white dark:bg-gray-950 border-r dark:border-gray-800 p-6 md:hidden"
      >
        <SidebarContent {...props} isShrunk={false} />
      </motion.aside>

      {/* --- Desktop Sidebar (Fixed) --- */}
      <motion.aside
        animate={{ width: isShrunk ? "88px" : "240px" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 min-h-screen bg-white dark:bg-gray-950 border-r dark:border-gray-800 p-6"
      >
        <SidebarContent {...props} />

        <motion.button
          onClick={() => setIsShrunk(!isShrunk)}
          className="hidden md:block absolute top-6 -right-3 z-40 p-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition-colors"
          animate={{ rotate: isShrunk ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={16} />
        </motion.button>
      </motion.aside>
    </>
  );
}
