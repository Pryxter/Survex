import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://survex.app";

  const routes = ["/", "/terms", "/privacy"];

  return routes.filter(Boolean).map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
