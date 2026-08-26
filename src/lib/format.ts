import type { Currency } from "@/lib/detect";
import { INTL_LOCALE, type Locale } from "@/i18n/config";

/**
 * Số tiền được định dạng theo locale của chính đồng tiền trên sao kê, không
 * theo ngôn ngữ giao diện — để con số khớp với những gì người dùng thấy trong
 * app ngân hàng của họ.
 */
const CURRENCY_LOCALE: Record<Currency, string> = {
  VND: "vi-VN",
  USD: "en-US",
  EUR: "de-DE",
};

export function formatMoney(value: number, currency: Currency = "VND"): string {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString(CURRENCY_LOCALE[currency] ?? "en-US")} ${currency}`;
  }
}

export function formatDate(date: Date, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      day: "2-digit",
      month: locale === "vi" ? "2-digit" : "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return isoDate(date);
  }
}

/** `datetime` cho thẻ <time> — máy đọc được, tốt cho SEO. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
