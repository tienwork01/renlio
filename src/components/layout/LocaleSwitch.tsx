"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/i18n/config";

/**
 * Hai link thật (crawler đọc được) chứ không phải nút JS đổi text — nhờ đó
 * mỗi ngôn ngữ có URL riêng và được index độc lập.
 *
 * Khi người dùng tự chọn, lưu cookie để middleware không đoán lại theo IP nữa:
 * lựa chọn của người dùng luôn thắng suy luận tự động.
 */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || `/${locale}`;

  function hrefFor(target: Locale): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) segments[0] = target;
    else segments.unshift(target);
    return `/${segments.join("/")}`;
  }

  function remember(target: Locale) {
    // 1 năm, chỉ lưu mã ngôn ngữ — không phải dữ liệu cá nhân
    document.cookie = `renlio.locale=${target}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="flex gap-1" role="group" aria-label={label}>
      {LOCALES.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={hrefFor(target)}
            hrefLang={target}
            lang={target}
            aria-current={active ? "true" : undefined}
            onClick={() => remember(target)}
            className={[
              "cursor-pointer rounded-lg border px-2.5 py-1 font-heading text-[0.8125rem] font-bold no-underline transition-colors duration-200",
              active
                ? "border-brand-600 bg-brand-600 text-btn-fg"
                : "border-line text-muted hover:border-line-strong hover:text-ink",
            ].join(" ")}
          >
            {LOCALE_LABELS[target]}
          </Link>
        );
      })}
    </div>
  );
}
