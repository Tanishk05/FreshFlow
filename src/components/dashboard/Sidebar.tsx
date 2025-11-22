"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  BarChartHorizontal,
  Package,
  Sprout,
  ChevronLeft,
  ClipboardList,
  Ship,
  Truck, // Icon for Distributor & Retailer Incoming
  Store, // Icon for Retailer
  Warehouse, // Icon for Distributor Warehouse
  ShoppingCart, // --- ADDED for Farmer Marketplace
  ListOrdered, // --- ADDED for Distributor Order Book
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// --- Configuration for each Dashboard Role ---

const farmerLinks = [
  {
    name: "Dashboard",
    href: "/dashboard/farmer",
    icon: <LayoutGrid size={20} />,
  },
  {
    name: "My Produce",
    href: "/my-produce",
    icon: <Package size={20} />,
  },
  {
    name: "Orders",
    href: "/dashboard/farmer/orders",
    icon: <ClipboardList size={20} />,
  },
  {
    name: "Marketplace",
    href: "/marketplace/farmer",
    icon: <ShoppingCart size={20} />,
  },
];

const retailerLinks = [
  {
    name: "Dashboard",
    href: "/dashboard/retailer",
    icon: <LayoutGrid size={20} />,
  },
  {
    name: "Inventory",
    href: "/dashboard/retailer/inventory",
    icon: <Package size={20} />,
  },
  {
    name: "Orders",
    href: "/dashboard/retailer/orders",
    icon: <ClipboardList size={20} />,
  },
  {
    name: "Buy Produce",
    href: "/marketplace/retailer",
    icon: <ShoppingCart size={20} />,
  },
];

const distributorLinks = [
  {
    name: "Dashboard",
    href: "/dashboard/distributor",
    icon: <LayoutGrid size={20} />,
  },
  {
    name: "Fleet",
    href: "/dashboard/distributor/fleet",
    icon: <Truck size={20} />,
  },
  {
    name: "Warehouse",
    href: "/dashboard/distributor/warehouse",
    icon: <Warehouse size={20} />,
  },
  {
    name: "Orders",
    href: "/dashboard/distributor/orders",
    icon: <ListOrdered size={20} />,
  },
  {
    name: "Order Book",
    href: "/order-book",
    icon: <ClipboardList size={20} />,
  },
];

// Mobile-only links (hash anchors for in-page navigation)
const farmerMobileLinks = [
  {
    name: "Demand Forecasts",
    href: "#analytics",
    icon: <BarChartHorizontal size={20} />,
  },
  { name: "Harvests", href: "#manage", icon: <Package size={20} /> },
  { name: "Orders", href: "#orders", icon: <ClipboardList size={20} /> },
  { name: "Shipments", href: "#shipments", icon: <Ship size={20} /> },
];

const retailerMobileLinks = [
  {
    name: "Store Inventory",
    href: "#inventory",
    icon: <Package size={20} />,
  },
  {
    name: "Incoming",
    href: "#deliveries",
    icon: <Truck size={20} />,
  },
  {
    name: "Demand",
    href: "#demand",
    icon: <BarChartHorizontal size={20} />,
  },
];

const distributorMobileLinks = [
  {
    name: "Pending Orders",
    href: "#orders",
    icon: <ClipboardList size={20} />,
  },
  {
    name: "Warehouse",
    href: "#warehouse",
    icon: <Warehouse size={20} />,
  },
  { name: "Fleet", href: "#fleet", icon: <Ship size={20} /> },
];

const dashboardConfigs = {
  farmer: {
    title: "FreshFlow",
    icon: Sprout,
    navLinks: farmerLinks,
    mobileLinks: farmerMobileLinks,
  },
  retailer: {
    title: "FreshFlow",
    icon: Store,
    navLinks: retailerLinks,
    mobileLinks: retailerMobileLinks,
  },
  distributor: {
    title: "FreshFlow",
    icon: Truck,
    navLinks: distributorLinks,
    mobileLinks: distributorMobileLinks,
  },
};

// --- End Configuration ---

type SidebarProps = {
  role: "farmer" | "retailer" | "distributor";
  isShrunk: boolean;
  setIsShrunk: (isShrunk: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  /** Optional handler to open alerts side panel */
  onAlertsClick?: () => void;
};

/**
 * Inner content of the sidebar. This is separated so we can
 * reuse it for both mobile and desktop sidebars.
 */
function SidebarContent({
  role,
  isShrunk,
  onAlertsClick,
  isMobile = false,
  setIsMobileOpen,
}: Omit<SidebarProps, "setIsShrunk"> & {
  onAlertsClick?: () => void;
  isMobile?: boolean;
}) {
  // Use Next.js usePathname hook for automatic route updates
  const pathname = usePathname();

  // Track active hash for hash anchor links
  const [activeHash, setActiveHash] = useState("");

  // Update active hash when URL hash changes
  useEffect(() => {
    // Listen for hash changes
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    // Set initial hash on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // router for client-side navigation
  const router = useRouter();

  // Get session data for the logged-in user
  const { data: session } = useSession();

  // Get the correct config based on the role
  const config = dashboardConfigs[role] || dashboardConfigs.farmer;
  const { title, icon: Icon, navLinks, mobileLinks } = config;

  // Use mobile links on mobile, desktop links on desktop
  const linksToShow = isMobile ? [...navLinks, ...mobileLinks] : navLinks;

  // Get display name: username if present, otherwise first name from full name
  const getDisplayName = () => {
    // @ts-expect-error - username is a custom field that may not be in the type
    if (session?.user?.username) {
      // @ts-expect-error - username is a custom field
      return `@${session.user.username}`;
    }
    if (session?.user?.name) {
      // Extract first name from full name
      return session.user.name.split(" ")[0];
    }
    return "User";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-2 pb-6 mb-6 border-b border-gray-200 dark:border-gray-700 ${
          isShrunk ? "justify-center" : ""
        }`}
      >
        <Icon className="text-green-600 shrink-0" size={28} />
        <motion.h1
          animate={{ opacity: isShrunk ? 0 : 1, width: isShrunk ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap"
        >
          {title}
        </motion.h1>
      </div>

      {/* Nav Links - flex-1 pushes profile to bottom */}
      <nav className="flex-1">
        <Tooltip.Provider delayDuration={0}>
          <ul className="space-y-2">
            {linksToShow.map((link) => {
              // Highlight active link for all routes (dashboard, marketplace, order-book)
              // For hash anchor links, check if current hash matches
              const isActive = link.href.startsWith("#")
                ? activeHash === link.href
                : pathname === link.href;
              // If this is the alerts item we render a button that triggers the sidepanel
              if (link.name.toLowerCase().includes("alert")) {
                return (
                  <li key={link.name}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (onAlertsClick) onAlertsClick();
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                            isShrunk ? "justify-center" : ""
                          } text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white`}
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
                        </button>
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
              }

              return (
                <li key={link.href}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      {/* Render a real anchor so Radix Tooltip's asChild wraps a DOM node.
                          For internal app routes use router.push for SPA navigation; for
                          hash anchors let the browser handle scrolling. */}
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          // Close mobile sidebar before navigating
                          if (isMobile) {
                            setIsMobileOpen(false);
                          }

                          // If it's a hash anchor, navigate to dashboard first then scroll
                          if (link.href.startsWith("#")) {
                            const dashboardPath = `/dashboard/${role}`;
                            router.push(dashboardPath + link.href);
                            // Update active hash immediately for visual feedback
                            setActiveHash(link.href);
                          } else {
                            // For regular routes, use router.push
                            router.push(link.href);
                          }
                        }}
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
                      </a>
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
        <a
          href="/profile"
          onClick={(e) => {
            e.preventDefault();
            // Close mobile sidebar before navigating
            if (isMobile) {
              setIsMobileOpen(false);
            }
            router.push("/profile");
          }}
          className={`flex items-center gap-3 ${
            isShrunk ? "justify-center" : ""
          } hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors`}
          aria-label="Profile"
        >
          <Image
            src={session?.user?.image || "https://avatar.vercel.sh/user.png"}
            alt={session?.user?.name || "User"}
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
              {getDisplayName()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap">
              {role}
            </p>
          </motion.div>
        </a>
      </div>
    </div>
  );
}

/**
 * Main Sidebar component.
 * Handles the mobile/desktop layout, backdrop, and shrink button.
 * The inner content is rendered by SidebarContent.
 */
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
        <SidebarContent {...props} isShrunk={false} isMobile={true} />
      </motion.aside>

      {/* --- Desktop Sidebar (Fixed) --- */}
      <motion.aside
        animate={{ width: isShrunk ? "88px" : "240px" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 min-h-screen bg-white dark:bg-gray-950 border-r dark:border-gray-800 p-6"
      >
        <SidebarContent {...props} isMobile={false} />

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
