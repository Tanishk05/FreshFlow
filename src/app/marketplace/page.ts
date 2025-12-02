import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Marketplace - Fresh Produce & Food Products",
  description:
    "Browse and order fresh produce directly from farmers and distributors. Real-time inventory, competitive pricing, and quality guaranteed delivery.",
  keywords: [
    "fresh produce marketplace",
    "buy produce online",
    "farm to table",
    "wholesale produce",
    "fresh vegetables",
    "fresh fruits",
  ],
  openGraph: {
    title: "Fresh Produce Marketplace | FreshFlow",
    description:
      "Browse and order fresh produce directly from farmers and distributors. Real-time inventory and quality guaranteed delivery.",
    url: "/marketplace",
  },
};

export default function MarketplacePage() {
  // Redirect to role-specific marketplace based on session
  // For now, redirect to farmer marketplace as default
  redirect("/marketplace/farmer");
}
