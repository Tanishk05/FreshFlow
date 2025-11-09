// src/app/complete-signup/layout.tsx

import { NextAuthProvider } from "@/providers/SessionProvider"; // Adjust path if needed
import React from "react";

export default function CompleteSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This provider is all that's needed for useSession() to work
    <NextAuthProvider>{children}</NextAuthProvider>
  );
}
