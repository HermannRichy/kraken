import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site";

const ROUTES = ["", "/le-defi", "/regles", "/calendrier", "/prix", "/documentation", "/faq", "/organisateur", "/mentions", "/classement"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/classement" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
