"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Package,
  ClipboardList,
  ShoppingCart,
  Truck,
  Warehouse,
  ListOrdered,
  User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { JSX } from "react";

type MobileBottomNavProps = {
  role: "farmer" | "retailer" | "distributor";
  onAlertsClick?: () => void;
  alertCount?: number;
};

type NavItem = {
  name: string;
  href: string;
  icon: JSX.Element;
};

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const triggerHaptic = () => {
    if (
      typeof window !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(15);
    }
  };

  const navConfigs: Record<string, NavItem[]> = {
    farmer: [
      {
        name: "Dashboard",
        href: "/dashboard/farmer",
        icon: <LayoutGrid size={20} />,
      },
      { name: "Produce", href: "/my-produce", icon: <Package size={20} /> },
      {
        name: "Orders",
        href: "/dashboard/farmer/orders",
        icon: <ClipboardList size={20} />,
      },
      {
        name: "Market",
        href: "/marketplace/farmer",
        icon: <ShoppingCart size={20} />,
      },
      { name: "Profile", href: "/profile", icon: <User size={20} /> },
    ],
    retailer: [
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
        name: "Buy",
        href: "/marketplace/retailer",
        icon: <ShoppingCart size={20} />,
      },
      { name: "Profile", href: "/profile", icon: <User size={20} /> },
    ],
    distributor: [
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
      { name: "Profile", href: "/profile", icon: <User size={20} /> },
    ],
  };

  const navItems = navConfigs[role] || navConfigs.farmer;

  const isItemActive = (item: NavItem) => {
    if (item.href === pathname) return true;
    if (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href))
      return true;
    return false;
  };

  const handleNavClick = (item: NavItem) => {
    triggerHaptic();
    router.push(item.href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 z-50 safe-area-inset-bottom">
      <div className="container mx-auto px-2 h-16 flex justify-around items-center relative">
        {navItems.map((item, index) => {
          const isActive = isItemActive(item);
          return (
            <motion.button
              key={index}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-slate-400"
              }`}
              whileTap={{ scale: 0.92 }}
              animate={{ y: isActive ? -2 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-linear-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-400 rounded-b-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              <span
                className={`text-[10px] font-medium mt-1 ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {item.name}
              </span>
            </motion.button>
          );
        })}

        {/* Alerts removed from navbar (handled in header). */}
      </div>
    </nav>
  );
}
