import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/profile/",
          "/verify-email/",
          "/reset-password/",
          "/complete-signup/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
