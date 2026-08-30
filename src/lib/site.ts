import type { Locale } from "@/i18n/config";

const FALLBACK_URL = "https://renlio.site";

/**
 * Chuẩn hoá giá trị NEXT_PUBLIC_SITE_URL.
 *
 * Đặt biến thành `renlio.site` (thiếu protocol) là lỗi cấu hình rất dễ mắc, và
 * trước đây nó làm sập cả bản build ở bước prerender vì `new URL()` ném lỗi.
 * Ở đây tự thêm `https://`, cắt dấu `/` thừa ở cuối, và nếu vẫn không parse
 * được thì cảnh báo rồi dùng giá trị mặc định — một biến sai không đáng để
 * cả bản deploy thất bại.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return FALLBACK_URL;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    console.warn(
      `▲ Renlio: NEXT_PUBLIC_SITE_URL="${value}" không phải URL hợp lệ — dùng tạm ${FALLBACK_URL}. ` +
        "Canonical, hreflang, sitemap và JSON-LD sẽ trỏ sai cho tới khi sửa.",
    );
    return FALLBACK_URL;
  }
}

/**
 * Cấu hình site dùng chung cho metadata, canonical, hreflang, sitemap, JSON-LD.
 * Đổi NEXT_PUBLIC_SITE_URL trong .env (hoặc Environment Variables trên Vercel)
 * trước khi deploy.
 */
export const SITE = {
  name: "Renlio",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  email: "nguyencongtien01it@gmail.com",
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
