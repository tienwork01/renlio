import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { absoluteUrl, localePath } from "@/lib/site";

/** Các đường dẫn có mặt ở cả hai ngôn ngữ. */
const PATHS = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "terms", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap((entry) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, entry.path)),
      lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      // Khai báo bản dịch tương ứng để search engine ghép đúng cặp hreflang.
      // Phải khớp với thẻ <link rel="alternate"> trong <head>, kể cả x-default,
      // nếu không Search Console sẽ báo lỗi hreflang không nhất quán.
      alternates: {
        languages: {
          ...Object.fromEntries(
            LOCALES.map((alt) => [alt, absoluteUrl(localePath(alt, entry.path))]),
          ),
          "x-default": absoluteUrl(localePath(DEFAULT_LOCALE, entry.path)),
        },
      },
    })),
  );
}
