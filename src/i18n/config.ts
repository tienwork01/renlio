export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * `en` là mặc định cho traffic không xác định được: an toàn hơn cho khách
 * quốc tế, còn khách Việt Nam đã được middleware chuyển sang `/vi` theo IP
 * hoặc Accept-Language trước khi tới đây.
 */
export const DEFAULT_LOCALE: Locale = "en";

/** Quốc gia (theo IP) được ưu tiên hiển thị tiếng Việt. */
export const VI_COUNTRIES = new Set(["VN"]);

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Nhãn hiển thị trên nút đổi ngôn ngữ. */
export const LOCALE_LABELS: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
};

/** Locale dùng cho Intl khi định dạng ngày. */
export const INTL_LOCALE: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};

/** og:locale */
export const OG_LOCALE: Record<Locale, string> = {
  vi: "vi_VN",
  en: "en_US",
};
