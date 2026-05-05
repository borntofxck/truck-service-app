import type { MetadataRoute } from "next";
import { company } from "@/lib/siteContent";

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date();

  return [
    {
      url: company.siteUrl,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${company.siteUrl}services`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${company.siteUrl}privacy`,
      lastModified: updatedAt,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
