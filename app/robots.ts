import type { MetadataRoute } from "next";
import { company } from "@/lib/siteContent";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${company.siteUrl}sitemap.xml`,
    host: company.siteUrl,
  };
}
