import type { MetadataRoute } from "next";
import { config } from "@/data/config";
import { publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: a build timestamp would not represent a content update.
  return Object.keys(publicPages).map((path) => ({
    url: new URL(path, config.site).href,
  }));
}
