import type { MetadataRoute } from "next";

import { siteIsIndexable } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // While the content is still placeholder, keep the whole site out of search.
  if (!siteIsIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/book/", "/bookings"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
