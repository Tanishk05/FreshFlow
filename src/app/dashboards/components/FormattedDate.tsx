"use client";

export function FormattedDate({ dateString }: { dateString: string }) {
  // Render the locale date string and suppress hydration warning
  // since server and client will render different values
  return (
    <span suppressHydrationWarning>
      {new Date(dateString).toLocaleDateString()}
    </span>
  );
}
