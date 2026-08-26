import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Mở cho cả crawler tìm kiếm truyền thống lẫn crawler của các engine trả lời
 * bằng AI — đó chính là điều kiện cần của GEO: nội dung không được đọc thì
 * không thể được trích dẫn.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
