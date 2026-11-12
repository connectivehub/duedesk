import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

const routes = ["", "/annual-return", "/books", "/tender", "/grant-claim", "/esg"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "/annual-return" ? 1 : path === "" ? 0.9 : 0.7,
  }));
}
