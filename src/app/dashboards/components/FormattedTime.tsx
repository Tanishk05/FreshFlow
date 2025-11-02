"use client";
import { useSyncExternalStore } from "react";

export function FormattedTime({ dateString }: { dateString: string }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    // On the server, render a consistent, non-locale format (UTC time)
    let timeString = "--:--:--";
    try {
      // Splits "2025-11-03T18:00:00.000Z" into "18:00:00"
      timeString = dateString.split("T")[1].split(".")[0];
    } catch {
      // Fallback already set
    }
    return <span>{timeString}</span>;
  }

  // On the client, render the user's local time string
  return <span>{new Date(dateString).toLocaleTimeString()}</span>;
}
