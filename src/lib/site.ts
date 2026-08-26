import type { Locale } from "@/i18n/config";

/**
 * Cấu hình site dùng chung cho metadata, canonical, hreflang, sitemap, JSON-LD.
 * Đổi NEXT_PUBLIC_SITE_URL trong .env trước khi deploy.
 */
export const SITE = {
  name: "Renlio",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://renlio.com").replace(/\/$/, ""),
  email: "hello@renlio.com",
};

export function localePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\//, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export function absoluteUrl(path = ""): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Neo trong trang, dùng cho nav và các CTA. */
export const SECTION_IDS = {
  demo: "demo",
  reminder: "reminder",
  sources: "sources",
  dashboard: "dashboard",
  features: "features",
  security: "security",
  pricing: "pricing",
  faq: "faq",
  getStarted: "get-started",
} as const;
